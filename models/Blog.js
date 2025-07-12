const mongoose =require('mongoose')
const BlogSchema = mongoose.Schema({
    author:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'username'
    },
    imageurl:{
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    isprivate: {
        type: Boolean,
        default: false  // false = public, true = private
    },
    updatedAt: Date,
    status: { 
        type: String, 
        enum: ['draft', 'published'], 
        default: 'draft' 
    }
})

module.exports = mongoose.model('blogs',BlogSchema);