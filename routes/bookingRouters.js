const express = require('express');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const bookingRouter = express.Router();

bookingRouter
.route('/checkout-session/:tourID')
.get(authController.protect, bookingController.getCheckoutSession);

module.exports = bookingRouter;