const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const JointCapacity = require('../models/JointCapacity');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET bookings for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user_id: req.params.userId })
      .populate('joint_type_id')
      .populate('time_slot_id')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new booking
router.post('/', async (req, res) => {
  try {
    // Get user to check governorate
    const user = await User.findById(req.body.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check capacity for user's governorate
    let capacity = await JointCapacity.findOne({
      joint_type_id: req.body.joint_type_id,
      time_slot_id: req.body.time_slot_id,
      governorate: user.governorate
    });

    // إذا لم يجد سعة مخصصة للميعاد، يبحث عن سعة عامة (بدون time_slot_id)
    if (!capacity) {
      capacity = await JointCapacity.findOne({
        joint_type_id: req.body.joint_type_id,
        governorate: user.governorate,
        $or: [
          { time_slot_id: null },
          { time_slot_id: { $exists: false } }
        ]
      });
    }

    if (!capacity) {
      return res.status(400).json({ message: 'No capacity found for this joint type and time slot in your governorate' });
    }

    // Check if slot is available
    const existingBookings = await Booking.find({
      date: req.body.date,
      joint_type_id: req.body.joint_type_id,
      time_slot_id: req.body.time_slot_id,
      governorate: user.governorate // تصفية حسب المحافظة
    });

    if (existingBookings.length >= capacity.capacity) {
      return res.status(400).json({ message: 'This time slot is fully booked for your governorate' });
    }

    const booking = new Booking({
      user_id: req.body.user_id,
      joint_type_id: req.body.joint_type_id,
      date: req.body.date,
      time_slot_id: req.body.time_slot_id,
      governorate: user.governorate // تخزين المحافظة مع الحجز
    });

    const newBooking = await booking.save();
    
    // Create notification for booking creation
    const notification = new Notification({
      user_id: req.body.user_id,
      booking_id: newBooking._id,
      title: 'تم إنشاء الحجز',
      message: `تم إنشاء حجزك بنجاح وهو في انتظار الموافقة من الإدارة.`,
      type: 'booking_created'
    });
    await notification.save();

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET available slots for a specific date and joint type
router.get('/availability', async (req, res) => {
  try {
    const { date, joint_type_id, user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user to check governorate
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all time slots
    const timeSlots = await require('../models/TimeSlot').find();
    
    // Get capacities for this joint type and user's governorate
    const capacities = await JointCapacity.find({ 
      joint_type_id,
      governorate: user.governorate
    });
    
    // Get existing bookings for this date and joint type and governorate
    const existingBookings = await Booking.find({
      date: date,
      joint_type_id: joint_type_id,
      governorate: user.governorate // تصفية حسب المحافظة
    });

    // Calculate available slots
    const availableSlots = timeSlots.map(slot => {
      // أولوية للسعة المخصصة للفترة الزمنية، ثم العامة
      const capacity =
        capacities.find(cap => cap.time_slot_id && cap.time_slot_id.toString() === slot._id.toString())
        || capacities.find(cap => !cap.time_slot_id);
      
      const bookedCount = existingBookings.filter(booking => 
        booking.time_slot_id.toString() === slot._id.toString()
      ).length;
      
      const available = capacity ? capacity.capacity - bookedCount : 0;
      
      return {
        id: slot._id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        available: Math.max(0, available),
        capacity: capacity ? capacity.capacity : 0,
        governorate: user.governorate
      };
    });
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE booking (cancel booking)
router.delete('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('joint_type_id')
      .populate('time_slot_id');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking is in the future
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Cannot cancel past bookings' });
    }

    // Check if booking is today but time has passed
    if (bookingDate.getTime() === today.getTime()) {
      const currentTime = now.getHours() * 60 + now.getMinutes(); // current time in minutes
      const [hours, minutes] = booking.time_slot_id.start_time.split(':');
      const bookingTime = parseInt(hours) * 60 + parseInt(minutes); // booking time in minutes
      
      if (currentTime >= bookingTime) {
        return res.status(400).json({ message: 'Cannot cancel bookings for time slots that have already started' });
      }
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status to cancelled instead of deleting
    await Booking.findByIdAndUpdate(req.params.bookingId, {
      status: 'cancelled',
      notes: booking.notes ? `${booking.notes}\n[ملغي بواسطة الطبيب]` : '[ملغي بواسطة الطبيب]'
    });
    
    // Create notification for booking cancellation
    const notification = new Notification({
      user_id: booking.user_id,
      title: 'تم إلغاء الحجز',
      message: `تم إلغاء حجزك بنجاح.`,
      type: 'booking_cancelled'
    });
    await notification.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 