const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/TimeSlot');

// GET all time slots
router.get('/', async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find();
    // أضف time_slot وارجع _id بشكل صريح
    const formatted = timeSlots.map(slot => ({
      _id: slot._id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      time_slot: `${slot.start_time} - ${slot.end_time}`
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new time slot
router.post('/', async (req, res) => {
  const timeSlot = new TimeSlot({
    start_time: req.body.start_time,
    end_time: req.body.end_time
  });

  try {
    const newTimeSlot = await timeSlot.save();
    res.status(201).json(newTimeSlot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update time slot
router.put('/:id', async (req, res) => {
  try {
    const { start_time, end_time } = req.body;
    if (!start_time || !end_time) {
      return res.status(400).json({ message: 'start_time and end_time are required' });
    }
    const updated = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      { start_time, end_time },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('PUT /api/time-slots/:id error:', error);

    res.status(500).json({ message: error.message });
  }
});

// DELETE time slot
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TimeSlot.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.json({ message: 'Time slot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 