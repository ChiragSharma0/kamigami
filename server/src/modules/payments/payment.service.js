const prisma = require('../../db/prisma');
const AppError = require('../../common/errors/AppError');

exports.processRazorpayWebhook = async (payload) => {
  const { event: eventType, payload: eventPayload, account_id } = payload;
  const eventId = payload.id;

  // 1. Idempotency Check
  const existingEvent = await prisma.paymentEvent.findUnique({
    where: { eventId }
  });
  if (existingEvent) return { status: 'already_processed' };

  // 2. Extract Data
  // Note: For payment.captured, order_id is in payload.payment.entity.order_id
  const paymentEntity = eventPayload.payment.entity;
  const razorpayOrderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;

  // Find order by paymentIntentId (which we store as razorpay_order_id)
  const order = await prisma.order.findFirst({
    where: { paymentIntentId: razorpayOrderId },
    include: { items: true }
  });

  if (!order) {
    // We still log the event even if order not found for auditing
    await prisma.paymentEvent.create({
      data: {
        eventId,
        eventType,
        provider: 'razorpay',
        payload
      }
    });
    throw new AppError('Order not found', 404);
  }

  // 3. Process Event
  if (eventType === 'payment.captured') {
    if (order.status === 'PAID') return { status: 'already_paid' };
    return await handlePaymentSuccess(order, payload);
  } else if (eventType === 'payment.failed') {
    if (order.status === 'FAILED') return { status: 'already_failed' };
    return await handlePaymentFailure(order, payload);
  }

  return { status: 'ignored_event' };
};

async function handlePaymentSuccess(order, payload) {
  return await prisma.$transaction(async (tx) => {
    // A. Update Order
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'PAID' }
    });

    // B. Deduct Inventory
    for (const item of order.items) {
      const inventory = await tx.inventory.findUnique({
        where: { variantId: item.variantId }
      });

      if (!inventory) throw new AppError(`Inventory not found for variant ${item.variantId}`, 409);

      // Validate constraints
      if (inventory.stockReserved < item.quantity || inventory.stockTotal < item.quantity) {
        console.error(`[Razorpay] Inventory inconsistency for variant ${item.variantId}. Reserved: ${inventory.stockReserved}, Total: ${inventory.stockTotal}, Required: ${item.quantity}`);
        // We still proceed but log the error or throw based on strictness
        // User said: ALWAYS validate stock before deduction
        throw new AppError('Inventory inconsistency detected during capture', 409);
      }

      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          stockReserved: { decrement: item.quantity },
          stockTotal: { decrement: item.quantity }
        }
      });

      // C. Insert Inventory Logs
      await tx.inventoryLog.create({
        data: {
          variantId: item.variantId,
          changeAmount: -item.quantity,
          reason: 'PURCHASE',
          referenceId: order.id
        }
      });
    }

    // D. Log Payment Event (Idempotency)
    await tx.paymentEvent.create({
      data: {
        eventId: payload.id,
        eventType: payload.event,
        provider: 'razorpay',
        payload
      }
    });

    // E. Redis Cleanup for Drops
    const { redisClient } = require('../../db/redis');
    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });
      if (variant.product.isDrop) {
        const reservationKey = `reservation:${order.userId}:${item.variantId}`;
        await redisClient.del(reservationKey);
      }
    }

    return { status: 'processed_success' };
  });

  // F. Trigger automated Shiprocket shipping dispatch after transaction completes successfully
  const logisticsService = require('../logistics/logistics.service');
  try {
    const shipmentResult = await logisticsService.createShipment(null, order.id);
    console.log('[PaymentSuccess] Shiprocket order created successfully!', shipmentResult.awbCode);
  } catch (shipmentErr) {
    console.error('[PaymentSuccess] Shiprocket dispatch failed, failing transaction capture:', shipmentErr.message);
    throw new AppError(`Logistics dispatch failed: ${shipmentErr.message || 'Courier partner rejected details'}`, 422);
  }
}

async function handlePaymentFailure(order, payload) {
  return await prisma.$transaction(async (tx) => {
    // Update Order
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'FAILED' }
    });

    // Restore Reserved Stock (Optional but recommended)
    for (const item of order.items) {
      await tx.inventory.update({
        where: { variantId: item.variantId },
        data: {
          stockReserved: { decrement: item.quantity },
          stockAvailable: { increment: item.quantity }
        }
      });
    }

    // Log Payment Event
    await tx.paymentEvent.create({
      data: {
        eventId: payload.id,
        eventType: payload.event,
        provider: 'razorpay',
        payload
      }
    });

    // Redis Restore for Drops
    const { redisClient } = require('../../db/redis');
    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });
      if (variant.product.isDrop) {
        const activeDrop = await tx.drop.findFirst({
          where: {
            status: 'ACTIVE',
            dropProducts: { some: { productId: variant.productId } }
          }
        });
        if (activeDrop) {
          const stockKey = `drop:${activeDrop.id}:variant:${item.variantId}:stock`;
          await redisClient.incrBy(stockKey, item.quantity);
        }
        const reservationKey = `reservation:${order.userId}:${item.variantId}`;
        await redisClient.del(reservationKey);
      }
    }

    return { status: 'processed_failure' };
  });
}

exports.processMockPaymentSuccess = async (orderId) => {
  const logisticsService = require('../logistics/logistics.service');

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  if (!order) throw new AppError('Order not found', 404);
  if (order.status === 'PAID') return { status: 'already_paid', order };

  // 1. Process payment success in DB
  const mockPayload = { id: `mock_evt_${Date.now()}`, event: 'payment.captured' };
  await handlePaymentSuccess(order, mockPayload);

  // 2. Trigger automatic Shiprocket shipping integration
  try {
    const shipmentResult = await logisticsService.createShipment(null, orderId);
    console.log('[MockPayment] Shiprocket order created successfully!');
    return { status: 'processed_success', order: shipmentResult };
  } catch (shipmentErr) {
    console.error('[MockPayment] Shiprocket dispatch failed:', shipmentErr.message);
    throw new AppError(`Logistics dispatch failed: ${shipmentErr.message || 'Courier partner rejected details'}`, 422);
  }
  
};

exports.verifyPaymentSignature = async (userId, data) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;
  const crypto = require('crypto');
  const logisticsService = require('../logistics/logistics.service');

  // 1. Verify HMAC Signature
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new AppError('Razorpay Key Secret is not configured on the server', 500);
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new AppError('Payment signature verification failed. Invalid transaction.', 400);
  }

  // 2. Fetch the corresponding order
  const order = await prisma.order.findFirst({
    where: { paymentIntentId: razorpay_order_id },
    include: { items: true }
  });

  if (!order) {
    throw new AppError('Order associated with this payment intent not found', 404);
  }

  // Security check: Verify order belongs to the user
  if (order.userId !== userId) {
    throw new AppError('Unauthorized access to verify this order payment', 403);
  }

  // If already paid, return early with order details
  if (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    return { status: 'already_paid', order };
  }

  // 3. Mark payment as success in database and reserve inventory
  const mockPayload = {
    id: razorpay_payment_id,
    event: 'payment.captured',
    rawBody: data
  };
  
  await handlePaymentSuccess(order, mockPayload);

  // 4. Fetch the updated order containing AWB and courier details
  const updatedOrder = await prisma.order.findUnique({
    where: { id: order.id }
  });

  return { status: 'verification_success', order: updatedOrder };
};

