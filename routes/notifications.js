// routes/notifications.js
const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notification = require('../models/Notification');

router.get('/', fetchuser, async (req, res) => {
    try {
        const notifications = await Notification.find({ toUser: req.user.id })
            .sort({ date: -1 })
            .populate('blog', 'title');
        res.json(notifications);
    } catch (error) {
        res.status(500).send("Server Error");
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
