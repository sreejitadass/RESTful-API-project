const express = require('express');
const reviewController = require('./../controllers/reviewControllers');
const authController = require('./../controllers/authController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);

reviewRouter
.route('/')
.get(reviewController.getAllReviews)
.post(authController.restrictTo('user'),reviewController.setNestedIds,reviewController.createReview);

reviewRouter
.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('admin','user'), reviewController.updateReview)
.delete(authController.restrictTo('admin','user'), reviewController.deleteReview);

module.exports = reviewRouter;