const express = require('express');
const ordersController = require('./orders.controller');
const { verifyJWT } = require('../auth/auth.middleware');

const router = express.Router();

// All order/checkout routes require auth
router.use(verifyJWT);

// Checkout Intent
router.post('/checkout/intent', ordersController.createCheckoutIntent);

// User Orders
router.get('/orders/me', ordersController.getMe);
router.get('/orders/:id', ordersController.getOrder);

module.exports = router;
