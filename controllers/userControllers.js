const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filterBody = (body, ...allowedFields) => {
    const newBody = {};
    Object.keys(body).forEach(el => {
        if (allowedFields.includes(el)) {
            newBody[el] = body[el];
        }
    });
    return newBody;
};

//GET ME--CURRENT USER DATA (MIDDLEWARE)
exports.getMe = (req,res,next) => {
    req.params.id = req.user.id;
    next();
}

//UPDATE USER DATA (ME-- name and email)
exports.updateMe = catchAsync(async (req,res,next)=>{
    //1.Error if user tries to update password here
    if(req.body.password || req.body.passwordConfirm){
        res.status(400).json({
            status: 'fail',
            message: 'This route is not for updating password!'
        });
    }

    //2.Update user data and allow only name and email to be updated
    const filteredBody = filterBody(req.body,'name','email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        updatedData: updatedUser
    });
});


//DELETING USER(ME)--
exports.deleteMe = catchAsync(async (req,res,next)=>{
    await User.findByIdAndDelete(req.user.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});


//UPDATING USER(not for passwords)
exports.updateUser = factory.updateOne(User);

//DELETE USER
exports.deleteUser = factory.deleteOne(User);

//GET ALL USERS
exports.getAllUsers = factory.getAll(User);

//GET SPECIFIC USER
exports.getUser = factory.getOne(User);