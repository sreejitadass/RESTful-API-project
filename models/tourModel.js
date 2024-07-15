const mongoose=require('mongoose');
const User = require('./userModel');

//creating schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Must have a name!'],
        maxlength: [30, 'Tour name must be below max limit'],
        minlength: [10, 'Tour name must be above min limit'],
        unique: true
    },
    duration: {
        type: Number,
        required: [true, 'Must have a duration!']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Must have a group size!']
    },
    difficulty: {
        type: String,
        required: [true, 'Must have a difficulty!'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty can only be either easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1.0, 'Rating must be above 1.0'],
        max: [5.0, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Must have a price!']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return this.price > val;
            },
            message: `Price ({VALUE}) should always be greater than the discount`
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Must have a description!']
    },
    imageCover: {
        type: String,
        required: [true, 'Must have a cover picture!']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    startLocation: { // GeoJSON data - from geospatial mongoose
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], // latitude, longitude
        address: String,
        description: String
    },
    // Array of locations where locations[0]=startLocation
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // Array of userIDs who are guides - child referencing
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({startLocation: '2dsphere'});

//Virtual populating to get reviews field in tours
tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});


// //document middleware to retrieve the guides before 'save'
// tourSchema.pre('save', async function(next){
//     const guidesPromise = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromise);
//     next();
// });

//REFERENCING
//query middleware to populate the guides field with data rather than object IDs
tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides'
    });
    next();
});

//creating model
const Tour=mongoose.model('Tour',tourSchema);

module.exports= Tour;
