const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');


exports.setNestedIds = (req,res,next) => {
    //allow nested urls
    if(!req.body.tour)
        req.body.tour = req.params.tourId;
    if(!req.body.user)
        req.body.user = req.user.id;
    next();
}

//READ ALL REVIEWS
exports.getAllReviews = factory.getAll(Review);

//READ SPECIFIC REVIEW
exports.getReview = factory.getOne(Review);

//CREATE A REVIEW
exports.createReview = factory.createOne(Review);

//UPDATE REVIEW
exports.updateReview = factory.updateOne(Review);

//DELETE REVIEW
exports.deleteReview = factory.deleteOne(Review);
