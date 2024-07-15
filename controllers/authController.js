const { promisify }=require('util');
const crypto=require('crypto');
const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const Email=require('./../utils/email');
const bcrypt = require('bcryptjs')

//CREATE AND SEND TOKEN THROUGH COOKIE
const signNewToken = (user)=>{
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user,statusCode,res)=>{
    const token = signNewToken(user);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true
    };

    if(process.env.NODE_ENV == 'production')
        cookieOptions.secure=true;
    res.cookie('jwt',token,cookieOptions);

    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        data: user,
        token: token
    });
}

//SIGNUP NEW USER
exports.signUp= catchAsync(async (req,res,next)=>{
    const newUser = await User.create({
        //To store only selected info, not just whatever is written in req.body
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const url = 'http://127.0.0.1:3000/me';
    await new Email(newUser, url).sendWelcome();

    //Sign in the user using jwt secret token
    createSendToken(newUser,201,res);
});

//LOGIN EXISTING USER
exports.logIn = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    // 1) Check if email and password are provided
    if (!email || !password) {
        return res.status(400).send({
            status: 'fail',
            message: 'Email or password not given!'
        });
    }

    // 2) Check if user exists and password matches
    const user = await User.findOne({ email }).select('+password'); // Explicitly select the password field

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send({
            status: 'fail',
            message: 'Incorrect email or password!'
        });
    }

    // 3) Send token back to client if everything is ok, login the user
    createSendToken(user,200,res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
  
    if (!token) {
        res.status(401).json({
            status: 'fail',
            message: 'You are not logged in! Please log in to get access.'
        });
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        res.status(401).json({
            status: 'fail',
            message: 'User expired!'
        });

    }
  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        if (!currentUser) {
            res.status(401).json({
                status: 'fail',
                message: 'User recently changed password! Please log in again.'
            });
        }
    }
  
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

//TO AUTHENTICATE LOGGED IN USERS
exports.isLoggedIn= async(req,res,next)=>{
   //Get the token
    if(req.cookies.jwt)
    {
        try{
            let token = req.cookies.jwt;
            //Now verify the token if received and give result
            const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

            //Check if user is not deleted after issuing old token and someone else doesnt access by that token
            const freshUser = await User.findById(decoded.id);  
            if(!freshUser)
            {
                next();
            }

            //Check if user has changed the password
            if(freshUser.changedPasswordAfter(decoded.iat)){
                return next();
            }

            //Grant access to the user
            res.locals.user = freshUser;
            return next();
        } catch(err){
            return next();
        }
    }
    next();
};

//LOGOUT USERS
exports.logOut = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now()+ 10*1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
}

//TO ALLOW ONLY CERTAIN USER ROLES TO DELETE OTHER USERS
exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        //roles=[admin,lead-guide],if user
        if(!roles.includes(req.user.role)){
            res.status(403).json({
                status: 'fail',
                message: 'You dont have the permission to perform this action!'
            });
        }
        next();
    }
}

//TO ENABLE FORGOT PASSWORD
exports.forgotPassword = catchAsync(async (req,res,next)=>{

    //Find the user by email
    const user= await User.findOne({email: req.body.email});

    if(!user){
        res.status(401).json({
            status: 'fail',
            message: 'User not found!'
        });
    }

    //Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try{
        //Send it via e-mail to user
        const resetURL = `127.0.0.1:3000/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch(err){
        //if theres an error, token is deactivated
        user.passwordResetToken = undefined;
        user.passwordResetExpiresIn = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500).json({
            status: 'fail',
            message: 'Error sending email, try again!'
        });
    }
});

//TO ENABLE RESET PASSWORD
exports.resetPassword = catchAsync(async (req,res,next)=>{
    //First hash the reset token and get user based on it as in db hashed token is stored
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user=await User.findOne({
        passwordResetToken : hashedToken,
        passwordResetExpiresIn: {
            $gt: Date.now()
        }
    });

    if(!user){
        res.status(400).json({
            status: 'fail',
            message: 'User not found!'
        });
    }

    //If token has not expired, then reset the password
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpiresIn=undefined;
    await user.save();

    //Log in the user after resetting new password,send JWT
   createSendToken(user,200,res);

});

//UPDATE PASSWORD
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1. Get the user
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        return res.status(400).json({
            status: 'fail',
            message: 'User not found!'
        });
    }

    // 2. Check if the posted current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return res.status(401).json({
            status: 'fail',
            message: 'Incorrect current password!'
        });
    }

    // 3. Ensure new password and confirmation are provided
    if (!req.body.updatedPassword || !req.body.updatedPasswordConfirm) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide new password and password confirmation!'
        });
    }

    // 4. Update the password
    user.password = req.body.updatedPassword;
    user.passwordConfirm = req.body.updatedPasswordConfirm;
    await user.save();

    // 5. Log in user, send JWT
    createSendToken(user, 200, res);
});
