const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Tour.find();

    //tour data from database is passed to template
    res.status(200).render('overview', {
        title: 'All tours',
        tours: tours
    });
});

exports.getTour = catchAsync(async (req, res) => {
    const tour = await Tour.findOne({name: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if(!tour)
    {
        res.status(404).json({
            status: 'fail',
            message: 'No such tour found!'
        });
    }

    res.status(200).render('tour', {
        title: tour.name,
        tour: tour
    });
});

exports.getLogInForm = (req,res) => {
    res.status(200).render('login',{
        title: 'Login'
    });
};

exports.getSignUpForm = (req,res) => {
    res.status(200).render('signup',{
        title: 'Signup'
    });
};

exports.getMyAccount = (req,res) => {
    //no need to query for current user, done by protect middleware
    res.status(200).render('account',{
        title: 'My account'
    });
};