const express=require('express');
const userController=require('./../controllers/userControllers');
const authController=require('./../controllers/authController');

const userRouter=express.Router();

userRouter
.route('/signup')
.post(authController.signUp);

userRouter
.route('/login')
.post(authController.logIn);

userRouter
.route('/logout')
.get(authController.logOut);

userRouter
.route('/forgotPassword')
.post(authController.forgotPassword);

userRouter
.route('/resetPassword/:token')
.patch(authController.resetPassword);

userRouter
.route('/')
.get(userController.getAllUsers);

userRouter
.route('/:id')
.get(userController.getUser)
.delete(authController.restrictTo('admin','lead-guide'), userController.deleteUser)
.patch(authController.restrictTo('admin','lead-guide'), userController.updateUser);

userRouter
.route('/updatePassword')
.patch(authController.updatePassword);

userRouter
.route('/updateMe')
.patch(authController.protect, userController.updateMe); 


//BELOW ROUTES WILL HAVE PROTECT AUTHENTICATION
userRouter.use(authController.protect);

userRouter
.route('/me')
.get(userController.getMe,userController.getUser);


userRouter
.route('/deleteMe')
.delete(userController.deleteMe);


module.exports=userRouter;