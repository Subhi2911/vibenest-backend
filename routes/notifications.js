// routes/notifications.js
const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notification = require('../models/Notification');
// eslint-disable-next-line no-unused-vars
const Blog = require('../models/Blog')

router.get('/getnotifications', fetchuser, async (req, res) => {
    try {
        const notifications = await Notification.find({ toUser: req.user.id })
            .sort({ date: -1 })
            .populate('blog', 'title category');
        res.json(notifications);
    } catch (error) {
        console.error( error.message)
        res.status(500).send("Internal Server Error");
    }
});

router.put('/:id/mark-read', fetchuser, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).send("Server Error");
    }
});


module.exports = router