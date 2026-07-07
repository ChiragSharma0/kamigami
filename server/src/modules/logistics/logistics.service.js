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

  const sanitizePhone = (phone) => {
    if (!phone) return '9354029285';
    let cleaned = phone.toString().replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.length < 10) {
      return '9354029285';
    }
    return cleaned.slice(-10);
  };

  const billingPhone = sanitizePhone(shippingAddr?.phoneNumber || order.user?.phoneNumber);

  // 2. Transform into Shiprocket Payload
  const shiprocketPayload = {
    order_id: order.orderNumber,
    order_date: order.createdAt.toISOString().split('T')[0],
    pickup_location: process.env.DEFAULT_PICKUP_LOCATION || 'Primary',
    billing_customer_name: order.user?.firstName || 'Customer',
    billing_last_name: order.user?.lastName || '',
    billing_address: shippingAddr.street1 || shippingAddr.street_1 || '',
    billing_address_2: shippingAddr.street2 || shippingAddr.street_2 || '',
    billing_city: shippingAddr.city || '',
    billing_pincode: shippingAddr.postalCode || shippingAddr.postal_code || '',
    billing_state: shippingAddr.stateProvince || shippingAddr.state_province || '',
    billing_country: shippingAddr.country || '',
    billing_email: order.user?.email || 'fake@email.com',
    billing_phone: billingPhone,
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
    if (err.response?.data) {
      console.error('❌ [Logistics] Shiprocket API Rejected Payload:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('[Logistics] API Error:', err.message);
    }
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

exports.getETA = async (deliveryPostcode) => {
  const pickupPostcode = process.env.DEFAULT_PICKUP_POSTCODE || '110001';

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  try {
    const serviceability = await shiprocket.getServiceability(pickupPostcode, deliveryPostcode);
    const couriers = serviceability.data?.available_courier_companies || [];

    if (couriers.length > 0) {
      const fastest = couriers.reduce((prev, current) => {
        const prevDays = prev.etd_hours || 120;
        const currDays = current.etd_hours || 120;
        return currDays < prevDays ? current : prev;
      });

      const etdDateString = fastest.etd;
      if (etdDateString) {
        const etdDate = new Date(etdDateString);
        const days = Math.ceil((etdDate - new Date()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          return {
            status: 'serviceable',
            days: days,
            etaString: `Expected Delivery: ${formatDate(etdDate)}`
          };
        }
      }
    }

    const fallbackDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    return {
      status: 'serviceable',
      days: 4,
      etaString: `Expected Delivery: ${formatDate(fallbackDate)}`
    };
  } catch (err) {
    console.warn('[Logistics] Serviceability ETA failed, using fallback:', err.message);
    const fallbackDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    return {
      status: 'serviceable',
      days: 4,
      etaString: `Expected Delivery: ${formatDate(fallbackDate)}`
    };
  }
};
