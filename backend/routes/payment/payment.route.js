const express = require('express');
const router = express.Router();
const { createPaymentUrl, vnpayReturn } = require('../../controllers/payment/payment.controller');

router.post('/create_url', createPaymentUrl);
router.get('/vnpay_return', vnpayReturn);

module.exports = router;