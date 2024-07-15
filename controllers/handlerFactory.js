const { Model, model } = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const APIoperations = require("./../utils/APIfeatures");

//1.DELETE
exports.deleteOne = Model => catchAsync(async (req,res,next) => {{
    const doc = await Model.findByIdAndDelete(req.params.id); //takes id to delete

    if(!doc)
    {
        res.status(404).json({
            status: 'fail',
            message: 'No document found with that ID'
        });
    }

    res.status(204).json({
        status:'success',
        data:{
            data: null
            }
        });
    }
});

//2.UPDATE
exports.updateOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:false
    });

    if(!doc)
    {
        res.status(404).json({
            status: 'fail',
            message: 'No document found with that ID'
        });
    }
        
    res.status(200).json({
        status:'success',
        data:{
            data: doc
        }
    });
});

//3.CREATE
exports.createOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.create(req.body);

    if(!doc)
    {
        res.status(404).json({
            status: 'fail',
            message: 'No document found with that ID'
        });
    }

    res.status(201).json({
        status:'success',
        data:{
            data: doc
            }
    });
});

//4.GET SPECIFIC
exports.getOne = (Model,populateOptions) => catchAsync(async (req,res,next) => {
    let query = Model.findById(req.params.id);
    if(populateOptions)
        query = query.populate(populateOptions);
    const doc = await query;
     
    if(!doc)
    {
        res.status(404).json({
            status: 'fail',
            message: 'No document found with that ID'
        });
    }

    res.status(200).json({
        status:'success',
        data:{
            data: doc
            }
    });
});

//5.GET ALL
exports.getAll = Model => catchAsync(async (req,res,next) => {
    //Nested endpoints in reviews
    let selected = { };
    if(req.params.tourId)
        selected = {tour: req.params.tourId};

    const features=new APIoperations(Model.find(selected),req.query);
    features
    .filter()
    .sort()
    .limitFields()
    .paginate();

    const doc = await features.query;

    if(!doc)
    {
        res.status(404).json({
            status: 'fail',
            message: 'No document found with that ID'
        });
    }

    res.status(200).json({
        status:'success',
        data:{
            results:doc.length,
            data: doc
        }
    });
});