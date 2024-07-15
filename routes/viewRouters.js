const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const viewRouter = express.Router();


viewRouter
.route('/')
.get(authController.isLoggedIn, viewController.getOverview);

viewRouter
.route('/tour/:slug')
.get(authController.isLoggedIn, viewController.getTour);

viewRouter
.route('/login')
.get(authController.isLoggedIn, viewController.getLogInForm);

viewRouter
.route('/signup')
.get(viewController.getSignUpForm);

viewRouter
.route('/me')
.get(authController.protect, viewController.getMyAccount);

module.exports = viewRouter;