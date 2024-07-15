const mongoose=require('mongoose');
const crypto=require('crypto');
const validator=require('validator');
const bcrypt=require('bcryptjs');

//creating schema
const userSchema=new mongoose.Schema({
    name:
    {
        type: String,
        required: [true,'A user must have a name']
    },
    email:
    {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail,'Please provide a valid e-mail']
    },
    photo:
    {
        type: String,
    },
    role:
    {
        type: String,
        enum: ['user','guide','lead-guide','admin'],
        default: 'user'
    },
    password:
    {
        type: String,
        required: [true, 'A user must have a password'],
        unique: true,
        select: false
    },
    passwordConfirm:
    {
        type: String,
        required: [true, 'A user must have confirm their password'],
        validate: {
            validator: function(el){
                return el===this.password;
            },
            message: 'Passwords must be the same. Try again!'
        },
        select: false
    },
    passwordResetToken:
    {
        type: String
    },
    passwordResetExpiresIn:
    {
        type: Date
    },
    // active:
    // {
    //     type: Boolean,
    //     default: true,
    //     select: false
    // }
});

//PASSWORD ENCRYPTION
//USING DOCUMENT MIDDLEWARE
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password= await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
});


userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedAtTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp < changedAtTimestamp;
    }
    return false;
};

//Encrypted token generated to reset password - has an expiry time
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    //encrypted resetToken
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpiresIn = Date.now() + 10*60*1000;  //10 min in ms

    return resetToken;
}

//To check if passwords match
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User',userSchema);
module.exports= User;
