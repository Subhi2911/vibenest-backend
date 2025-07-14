const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  imageurl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isprivate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  ratings: [
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    rating: Number
  }
  ],
  averageRating: {
    type: Number,
    default: 0
  },
  category:{
    type:String,
    default:'general'
  }

}, { timestamps: true });

module.exports = mongoose.model('blogs', BlogSchema);
