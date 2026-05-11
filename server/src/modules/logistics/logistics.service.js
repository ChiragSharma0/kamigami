const prisma = require('../../db/prisma');
const shiprocket = require('./logistics.provider');
const AppError = require('../../common/errors/AppError');

exports.createShipment = async (adminId, orderId) => {
  // 1. Fetch Order with Items and Address
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true } 
  }); 

  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'PAID' && order.status !== 'PROCESSING') {
    throw new AppError('Order must be PAID or PROCESSING to create shipment', 400);
  }

  const shippingAddr = order.shippingAddress;

  // 2. Transform into Shiprocket Payload
  const shiprocketPayload = {
    order_id: order.orderNumber,
    order_date: order.createdAt.toISOString().split('T')[0],
    pickup_location: process.env.DEFAULT_PICKUP_LOCATION || 'Primary',
    billing_customer_name: order.user?.firstName || 'Customer',
    billing_last_name: order.user?.lastName || '',
    billing_address: shippingAddr.street_1,
    billing_address_2: shippingAddr.street_2 || '',
    billing_city: shippingAddr.city,
    billing_pincode: shippingAddr.postal_code,
    billing_state: shippingAddr.state_province,
    billing_country: shippingAddr.country,
    billing_email: order.user?.email || 'fake@email.com',
    billing_phone: order.user?.phoneNumber || '0000000000',
    shipping_is_billing: true,
    order_items: order.items.map(item => ({
      name: item.name,
      sku: item.sku,
      units: item.quantity,
      selling_price: item.priceAtPurchase.toString()
    })),
    payment_method: 'Prepaid',
    sub_total: order.subtotal.toString(),
    length: 10, // Default dimensions
    breadth: 10,
    height: 10,
    weight: 0.5
  };

  try {
    // 3. Call Shiprocket API
    const srOrder = await shiprocket.createOrder(shiprocketPayload);
    const shipmentId = srOrder.shipment_id;

    // 4. Assign AWB
    const awbResult = await shiprocket.assignAWB(shipmentId);
    const awbCode = awbResult.response.data.awb_code;
    const courierName = awbResult.response.data.courier_name;

    // 5. Update Order in DB
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        awbCode,
        courierName,
        shipmentStatus: 'shipped',
        status: 'SHIPPED',
        trackingUrl: `https://shiprocket.co/tracking/${awbCode}`
      }
    });

    // 6. Admin Log
    await prisma.adminLog.create({
      data: {
        adminId,
        action: 'create_shipment',
        entityId: orderId,
        metadata: { awbCode, provider: 'shiprocket' }
      }
    });

    return updatedOrder;
  } catch (err) {
    console.error('[Logistics] API Error:', err.message);
    throw new AppError(`Shiprocket API failed: ${err.message}`, 502);
  }
};

exports.updateTrackingManual = async (adminId, orderId, trackingData) => {
  const { trackingUrl, courierName, awbCode, status } = trackingData;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingUrl,
      courierName,
      awbCode,
      shipmentStatus: status || 'shipped',
      status: status === 'delivered' ? 'DELIVERED' : 'SHIPPED'
    }
  });

  await prisma.adminLog.create({
    data: {
      adminId,
      action: 'update_tracking_manual',
      entityId: orderId,
      metadata: trackingData
    }
  });

  return order;
};

exports.getTrackingInfo = async (orderId, userId = null) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      trackingUrl: true,
      courierName: true,
      awbCode: true,
      shipmentStatus: true,
      status: true
    }
  });

  if (!order) throw new AppError('Order not found', 404);
  
  // Security check for users
  if (userId && order.userId !== userId) {
    throw new AppError('Unauthorized access to tracking info', 403);
  }

  return {
    order_id: order.id,
    tracking_url: order.trackingUrl,
    courier: order.courierName,
    awb_code: order.awbCode,
    shipment_status: order.shipmentStatus,
    order_status: order.status
  };
};
