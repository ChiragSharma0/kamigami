const express = require('express');
const paymentController = require('./payment.controller');

const router = express.Router();

// Razorpay Webhook Endpoint
router.post('/razorpay', paymentController.handleRazorpayWebhook);

module.exports = router;
