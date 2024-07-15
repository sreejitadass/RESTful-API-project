const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_API_KEY);


exports.getCheckoutSession = catchAsync(async(req,res,next) => {
    //1. Get current tour
    const tour = await Tour.findById(req.params.tourID);

    //2.Create checkout session in backend
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: 'http://127.0.0.1:3000/',
        cancel_url: `http://127.0.0.1:3000/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        mode: 'payment',
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: tour.name,
                    description: tour.summary,
                },
                unit_amount: tour.price * 100, // Amount in cents
            },
            quantity: 1
        }]
    });


    //3.Send back the session as a response
    res.status(200).json({
        status: 'success',
        session
    });
});