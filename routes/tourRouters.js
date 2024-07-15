const express=require('express');
const tourController=require('./../controllers/tourControllers');
const authController=require('./../controllers/authController');
const reviewRouter=require('./../routes/reviewRouters');

const tourRouter=express.Router();

//use reviewRouter on encountering this route-mounting like in app.js
tourRouter.use('/:tourId/reviews',reviewRouter);

tourRouter
.route('/top-5-best')
.get(tourController.aliasName,tourController.getTours);

tourRouter
.route('/get-tour-stats')
.get(tourController.getTourStatistics);

tourRouter
.route('/get-monthly-plan/:year')
.get(authController.protect, authController.restrictTo('lead-guide','admin','guide'),tourController.getMonthlyPlan);

tourRouter
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin);

tourRouter
.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances);

tourRouter
.route('/')
.get(tourController.getTours)
.post(authController.protect, authController.restrictTo('lead-guide','admin'), tourController.createNewTour);

tourRouter
.route('/:id')
.get(tourController.getSpecificTour)
.patch(authController.protect, authController.restrictTo('lead-guide','admin'), tourController.updateTour)
.delete(authController.protect, authController.restrictTo('admin','lead-guide'), tourController.deleteTour);


module.exports=tourRouter;