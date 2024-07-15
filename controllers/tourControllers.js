const Tour=require('./../models/tourModel');
const factory=require('./handlerFactory');
const catchAsync=require('./../utils/catchAsync');

//READ
exports.getTours= factory.getAll(Tour);

//READ SPECIFIC TOUR
exports.getSpecificTour=factory.getOne(Tour,{path: 'reviews'});

//CREATE
exports.createNewTour= factory.createOne(Tour);

//UPDATE
exports.updateTour= factory.updateOne(Tour);

//DELETE
exports.deleteTour= factory.deleteOne(Tour);

//GET TOURS WITHIN RADIUS
exports.getToursWithin = catchAsync(async (req,res,next) => {
    const { distance, latlng, unit } = req.params;
    const lat = latlng.split(',')[0];
    const lng = latlng.split(',')[1];

    if(!lat || !lng)
    {
        res.status(400).json({
            status: 'fail',
            message: 'Provide lat and lng in format lat,lng'
        });
    }
    const radians = unit === 'mi' ? distance/3963.2 : distance/6378.1;
    const tours = await Tour.find({
        startLocation: {$geoWithin: { $centerSphere: [[lng,lat],radians] }}
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data:{
            data: tours
        }
    });
});

//GET DISTANCES FROM START LATITUDE AND LONGITUDE
exports.getDistances = catchAsync(async (req,res,next) => {
    const { latlng, unit } = req.params;
    const lat = latlng.split(',')[0];
    const lng = latlng.split(',')[1];

    if(!lat || !lng)
    {
        res.status(400).json({
            status: 'fail',
            message: 'Provide lat and lng in format lat,lng'
        });
    }

    const multiplier = unit === 'mi' ? 0.000621 : 0.001;

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                //point from where to calculate distances
                near: {
                    type: 'Point',
                    coordinates: [lng*1, lat*1] //this point
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier   //convert m to km/mile
            },
        },
        {
            $project: {
                name: 1,
                distance: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data:{
            data: distances
        }
    });
});

//PRE-FILLING URL WITH MIDDLEWARE
exports.aliasName=(req,res,next)=>{
    req.query.limit=5;
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
}

//AGGREGATION PIPELINE COMMANDS
exports.getTourStatistics=async(req,res)=>{
    try{
        const stats= await Tour.aggregate([
        {
            $match: {ratingsAverage: {$gte : 4.3} }
        },
        {
            $group: {
                _id: {$toUpper: '$difficulty'},
                numTours : {$sum: 1},
                sumRating : {$sum: '$ratingsAverage'},
                avgRating : {$avg: '$ratingsAverage'},
                minPrice : {$min: '$price'},
                maxPrice : {$max: '$price'},
                avgPrice : {$avg: '$price'}
            }
        },
        {
            $sort: {avgPrice: 1}
        },
        {
            $match: {_id: {$ne: 'EASY'}}
        }      
    ]);
    res.status(200).json({
        status:'success',
        data:{
            tour: stats
        }
    });
    } catch(err){
        res.status(404).json({
            status:'fail',
            message:err
        });
    }
}

//NUMBER OF TOURS IN A MONTH
exports.getMonthlyPlan = async(req,res)=>{
    try{
        const year=req.params.year*1;
        const tourPlan=await Tour.aggregate([
        {
            $unwind: '$startDates'  //1 document for each startDate by destructuring the startDates array
        },
        {
            $match: {
                startDates: 
                {
                    $gte:new Date(`${year}-01-01`),
                    $lte:new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id:{$month: '$startDates'},
                numTours:{$sum: 1},
                tours:{$push: '$name'}
            }
        },
        {
            $addFields:{month: '$_id'}
        },
        {
            $project:{_id: 0}
        },
        {
            $sort:{numTours: -1}
        },
        {
            $limit: 15
        }
        ]);
        res.status(200).json({
            status:'success',
            data:{
                tour: tourPlan
            }
        });
    }catch(err){
        res.status(404).json({
            status:'fail',
            message:err
        });
    }
}