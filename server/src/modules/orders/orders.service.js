const prisma = require('../../db/prisma');
const { redisClient } = require('../../db/redis');
const AppError = require('../../common/errors/AppError');
const ordersUtils = require('./orders.utils');

exports.createCheckoutIntent = async (userId, payload, idempotencyKey) => {
  const { shippingAddressId, billingAddressId, items } = payload;

  // 1. Idempotency Check
  if (idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey }
    });
    if (existingOrder) {
      // In a real scenario, you'd also check if the user is the same
      // Return existing payment intent info
      return {
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        paymentIntentId: existingOrder.paymentIntentId,
        totalAmount: parseFloat(existingOrder.totalAmount),
        currency: existingOrder.currency,
        isExisting: true
      };
    }
  }

  // 2. Validate Addresses
  const [shippingAddress, billingAddress] = await Promise.all([
    prisma.address.findUnique({ where: { id: shippingAddressId } }),
    prisma.address.findUnique({ where: { id: billingAddressId } })
  ]);

  if (!shippingAddress || shippingAddress.userId !== userId) throw new AppError('Invalid shipping address', 400);
  if (!billingAddress || billingAddress.userId !== userId) throw new AppError('Invalid billing address', 400);

  // 3. Validate Items and Calculate Prices
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: {
        product: true,
        inventory: true
      }
    });

    if (!variant) throw new AppError(`Variant ${item.variantId} not found`, 404);

    // Drop Validation
    if (item.isDrop || variant.product.isDrop) {
      const reservationKey = `reservation:${userId}:${item.variantId}`;
      const reservationExists = await redisClient.exists(reservationKey);
      if (!reservationExists) {
        throw new AppError(`No valid reservation found for drop item: ${variant.product.name}`, 409);
      }
    } else {
      // Standard Validation
      if (variant.inventory.stockAvailable < item.quantity) {
        throw new AppError(`Insufficient stock for ${variant.product.name}`, 409);
      }
    }

    const priceAtPurchase = parseFloat(variant.price || variant.product.basePrice);
    subtotal += priceAtPurchase * item.quantity;

    processedItems.push({
      variantId: variant.id,
      sku: variant.sku,
      name: variant.product.name,
      attributes: variant.attributes,
      quantity: item.quantity,
      priceAtPurchase
    });
  }

  // 4. Final Calculations
  const shippingAmount = 0; // Placeholder
  const taxAmount = 0; // Placeholder
  const totalAmount = subtotal + shippingAmount + taxAmount;

  // 5. Simulate Payment Intent
  const paymentIntent = await ordersUtils.createSimulatedPaymentIntent(totalAmount);

  // 6. Database Transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderNumber: ordersUtils.generateOrderNumber(),
        idempotencyKey,
        paymentIntentId: paymentIntent.id,
        subtotal,
        taxAmount,
        shippingAmount,
        totalAmount,
        currency: 'USD',
        status: 'PENDING',
        shippingAddress: shippingAddress, // JSON snapshot
        billingAddress: billingAddress,   // JSON snapshot
        items: {
          create: processedItems.map(item => ({
            variantId: item.variantId,
            sku: item.sku,
            name: item.name,
            attributes: item.attributes,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            taxAtPurchase: 0
          }))
        }
      }
    });

    // 6.5 Reserve Stock in DB for ALL items
    for (const item of processedItems) {
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          stockAvailable: { decrement: item.quantity },
          stockReserved: { increment: item.quantity }
        }
      });
    }

    return newOrder;
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    totalAmount,
    currency: 'USD'
  };
};

exports.getUserOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true
    }
  });
};

exports.getOrderById = async (userId, orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true
    }
  });

  if (!order || order.userId !== userId) {
    throw new AppError('Order not found', 404);
  }

  return order;
};
