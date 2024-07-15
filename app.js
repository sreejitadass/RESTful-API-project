const express = require('express');
const path = require('path');
const app = express();

const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouters');
const reviewRouter = require('./routes/reviewRouters');
const viewRouter = require('./routes/viewRouters');
const bookingRouter = require('./routes/bookingRouters');

const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/* GLOBAL MIDDLEWAREs */

// 1. Serving static files of html, css, images etc
app.use(express.static(path.join(__dirname, 'public')));

// 2. Setting http headers -- helmet is a collection of 14 small middlewares
app.use(helmet());

// 3. Middleware to allow max 100 requests from the same IP in 1 hour
const limiter = rateLimiter({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, try after 1 hour!'
});
app.use('/api', limiter);

// 4. Using morgan middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 5. Setting limit of max 10kb size of req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 6. Data sanitization against NoSQL injection
app.use(mongoSanitize());

// 7. Data sanitization against XSS
app.use(xss());

// 8. Preventing parameter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// 9. Mounting
app.use('/',viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings',bookingRouter);

/* ERROR HANDLING */
// Handling unhandled routes
app.all('*', (req, res, next) => {
    const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    err.statusCode = 404;
    err.status = 'fail';

    next(err);
});

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error!';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
});

module.exports = app;
