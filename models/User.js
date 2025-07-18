const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
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
    },
    bio:{
        type:String,
        default:'Hey there!! I enjoy writing blogs.What about you?'
    }
    
})

const User = mongoose.model('User', UserSchema);
module.exports = User;