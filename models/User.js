const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    profileimage:{
        type:String,
        default:'/uploads/profile/default-user.png',
        match: [/^\/uploads\/profile\/.*\.(jpg|jpeg|png)$/, 'Invalid image path']
    },
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:3
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match: [/\S+@\S+\.\S+/, 'Invalid email format']
    },
    password:{
        type:String,
        required:true
    },
    date: {
    type: Date,
    default: Date.now
    }
})

const User = mongoose.model('user', UserSchema);
module.exports = User;