const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET notifications for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.params.userId })
      .populate('booking_id')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new notification
router.post('/', async (req, res) => {
  const notification = new Notification({
    user_id: req.body.user_id,
    booking_id: req.body.booking_id,
    title: req.body.title,
    message: req.body.message,
    type: req.body.type
  });

  try {
    const newNotification = await notification.save();
    const populatedNotification = await Notification.findById(newNotification._id)
      .populate('booking_id');
    res.status(201).json(populatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    ).populate('booking_id');
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT mark all notifications as read for a user
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.params.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 