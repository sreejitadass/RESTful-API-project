const Tour = require('./tourModel');
const User = require('./userModel');
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Must post a review!']
    },
    rating: {
        type: Number,
        min: [1, 'Minimum rating cant be less than 1!'],
        max: [5, 'Maximum rating cant be more than 5!']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
            //required: [true, 'Review must belong to a tour']
        },
    user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            //required: [true, 'Review must belong to a user']
        } 
});

//Creating composite index
reviewSchema.index({tour: 1, user: 1},{unique: true});

// Query middleware to populate the tour and user fields with data rather than object IDs
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'tour',
        select: 'name'
    })
    .populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

//STATIC FUNCTION TO CALCULATE RATINGS AVERAGE BASED ON REVIEWS OF A TOUR
reviewSchema.statics.calcAvgRatings = async function(tourId)
{
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                numRatings: {$sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ]);
    
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity: stats[0].numRatings,
        ratingsAverage: stats[0].avgRating
    });
}

//CALLING FUNCTION VIA MIDDLEWARE
reviewSchema.post('save', function(){
    this.constructor.calcAvgRatings(this.tour);
});

//CHANGING STATS ON UPDATE AND REVIEW
reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne();   //find review associated to current query
    console.log(r);   
    next();
});

reviewSchema.post(/^findOneAnd/, async function(){
    await this.r.constructor.calcAvgRatings(this.r.tour)
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
