const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  start_time: {
    type: String,
    required: true,
    trim: true
  },
  end_time: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema); 