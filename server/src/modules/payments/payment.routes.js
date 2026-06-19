const express = require('express');
const paymentController = require('./payment.controller');

const router = express.Router();

// Razorpay Webhook Endpoint
router.post('/razorpay', paymentController.handleRazorpayWebhook);

// Developer Mock Payment Success (Bypasses webhook delays in development)
router.post('/mock-success', paymentController.handleMockPaymentSuccess);

module.exports = router;
