const express = require("express");
const Blog = require('../models/Blog');
const fetchuser = require("../middleware/fetchuser");
const { body , validationResult }=require('express-validator');
const router =express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User')

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
            title, content ,imageurl , isprivate, author:req.user.id
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
    const blogs = await Blog.find({isprivate: false}).populate("author", "username");
    res.json(blogs);
  }catch(error){
    console.error(error.message);
      res.status(500).send("Internal server error");
  }
})

//Route 3: /api/blogs/getblog/:id	GET	Retrieves a single blog post by its unique ID	Public
router.get('/getblog/:id',async(req,res)=>{
  try{
    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Not Found!");

    res.json(blog);
  } catch (error){
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

//Route:4 /api/blogs/updateblog/:id	PUT	Updates a blog post by ID (only if the logged-in user is the author)	Private (author only)
router.put('/updateblog/:id', fetchuser,async(req,res)=>{
  const { title, content, imageurl, isprivate }= req.body;

  //create a newBlog object
  const newBlog={};
  if(title) newBlog.title=title;
  if(content) newBlog.content=content;
  if(imageurl) newBlog.imageurl= imageurl;
  if(typeof isprivate === 'boolean') newBlog.isprivate= isprivate;

  try{
    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).send("Not Found!");

      // Allow update only if user owns this note
      if (blog.author.toString() !== req.user.id) {
          return res.status(401).send("Not Allowed!");
      }
      blog = await Blog.findByIdAndUpdate(req.params.id, { $set: newBlog }, { new: true });
      res.json({ blog });
  }catch(error){
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

//Route:4 /api/blogs/deleteblog/:id	DELETE	Deletes a blog post by ID (only if the logged-in user is the author)	Private (author only)
router.delete('/deleteblog/:id',fetchuser,async(req,res)=>{
  try{
    let blog= await Blog.findById(req.params.id);
    if(!blog) return res.status(404).send("Not Found!");

    // Allow delete only if user owns this note
    if (blog.author.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed!");
    }
    blog =await Blog.findByIdAndDelete(req.params.id);
    res.json({"success":"Blog has been deleted" ,blog :blog})
  }catch(error){
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

//Route:5 /api/blogs/authorblog/username/:username to get blogs of a particular author
router.get('/authorblog/username/:username', async (req, res) => {
  try {
    const username = req.params.username;

    // Find the user by username
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: "Author not found" });
    }

    // Find blogs with author ObjectId
    const blogs = await Blog.find({ author: user._id }).populate('author', 'username');

    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});





module.exports = router;
