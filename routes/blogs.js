const express = require("express");
const Blog = require('../models/Blog');
const fetchuser = require("../middleware/fetchuser");
const { body , validationResult }=require('express-validator');
const router =express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });

// POST /api/upload-image
router.post('/upload-image', upload.single('image'), (req, res) => {
  const imageurl = `/uploads/${req.file.filename}`;
  res.json({ url: imageurl });
});
//Route1 Create Private Blogs where only user can see and write POST "/api/blogs/creaatepvtblog"
router.post('/createpvtblog',fetchuser,[
    body('title','Enter a valid Title').isLength({min: 3}),
    body('content','Content must be at least 5 characters').isLength({min:5}),
    body('imageurl','Insert an image related to blog'),
    body('private','Do you want the blog to be private?')
], async(req,res)=>{
    try{
        const {title , content , imageurl , isprivate }=req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        
        const blog = new Blog({
            title, content ,imageurl , isprivate, user:req.user.id
        });
        const  savedBlog = await blog.save();
        res.json(savedBlog);
    } catch (error){
        console.error(error.message);
        res.status(500).send("Internal Server Error!");
    }
});

//Route2: /api/blogs/fetchblogs	GET	Retrieves all published blogs with author details	Public
router.get('/fetchblogs', async(req,res)=>{
  try{
    const blogs = await Blog.find({isprivate: false})
    res.json(blogs);
  }catch(error){
    console.error(error.message);
      res.status(500).send("Internal server error");
  }
})

module.exports = router;
