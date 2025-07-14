const express = require("express");
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

require('dotenv').config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET;



// PUT /api/user/profile-image
router.put('/profile-image', fetchuser, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const profileImage = `/uploads/profile/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { userimage: profileImage }, // or 'profileImage' based on your schema
      { new: true }
    );

    res.json({ success: true, image: user.userimage });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// ROUTE 1: Create a user using POST "/api/auth/createuser"
router.post('/createuser', [
  body('username', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
], async (req, res) => {
  let success=false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }

  try {
    let user = await User.findOne({ email: req.body.email });
    let user_name = await User.findOne({ username: req.body.username });
    
    if (user) {
      let success=false;
      return res.status(400).json({success, error: "User with this email already exists." });
    }
    if (user_name) {
      let success=false;
      return res.status(400).json({success, error: "User with this username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: secPass
    });

    const data = {
      user: {
        id: user.id
      }
    };

    const authToken = jwt.sign(data, JWT_SECRET);
    const success=true;
    res.json({success, authToken });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// ROUTE 2: Authenticate a user using POST "/api/auth/login"
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const success=false;
    return res.status(400).json({success, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    
    if (!user) {
      const success = false;
      return res.status(400).json({success, error: "Invalid credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      const success = false;
      return res.status(400).json({success, error: "Invalid credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    };

    const authToken = jwt.sign(data, JWT_SECRET);
    const success=true;
    res.json({success, authToken });

    
  } catch (error) {
    console.error(success,error.message);
    res.status(500).send("Internal server error");
  }
});

//Route 3: Get loggedin user details using: POST"/api/auth/getuser. Login required.
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
});

//Route 4: get user details of other user (limited data)
router.post('/getanotheruser/:username', fetchuser, async (req, res) => {

    try {
        const username = req.params.username;
        const user = await User.findOne({ username }).select("username bio date"); 
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
});

//Route 5: Change the user bio
router.post('/changebio/:id', fetchuser, async (req, res) => {
  try {
    const { bio } = req.body;

    if (!bio || bio.trim() === '') {
      return res.status(400).json({ error: "Bio cannot be empty" });
    }

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { bio: bio } },
      { new: true }
    );

    res.json({ bio: user.bio });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
