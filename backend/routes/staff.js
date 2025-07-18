const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// POST staff login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const staff = await Staff.findOne({ email, password });
    if (!staff) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all pending bookings
router.get('/bookings/pending', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate({
        path: 'user_id',
        populate: { path: 'hospital_id' }
      })
      .populate('joint_type_id')
      .populate('time_slot_id')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all bookings (pending, approved, rejected)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'user_id',
        populate: { path: 'hospital_id' }
      })
      .populate('joint_type_id')
      .populate('time_slot_id')
      .populate('approved_by')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT approve booking
router.put('/bookings/:id/approve', async (req, res) => {
  try {
    const { staff_id, notes } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approved_by: staff_id,
        approved_at: new Date(),
        notes: notes || ''
      },
      { new: true }
    ).populate('user_id').populate('joint_type_id').populate('time_slot_id');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Create notification
    const notification = new Notification({
      user_id: booking.user_id._id,
      booking_id: booking._id,
      title: 'تمت الموافقة على الحجز',
      message: `تمت الموافقة على حجزك لعملية ${booking.joint_type_id.name} في ${booking.date} الساعة ${booking.time_slot_id.start_time}. ${notes ? `ملاحظات: ${notes}` : ''}`,
      type: 'booking_approved'
    });
    await notification.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT reject booking
router.put('/bookings/:id/reject', async (req, res) => {
  try {
    const { staff_id, notes } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approved_by: staff_id,
        approved_at: new Date(),
        notes: notes || ''
      },
      { new: true }
    ).populate('user_id').populate('joint_type_id').populate('time_slot_id');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Create notification
    const notification = new Notification({
      user_id: booking.user_id._id,
      booking_id: booking._id,
      title: 'تم رفض الحجز',
      message: `تم رفض حجزك لعملية ${booking.joint_type_id.name} في ${booking.date} الساعة ${booking.time_slot_id.start_time}. ${notes ? `سبب الرفض: ${notes}` : ''}`,
      type: 'booking_rejected'
    });
    await notification.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 