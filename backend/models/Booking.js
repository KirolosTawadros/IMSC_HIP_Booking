const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joint_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JointType',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time_slot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  approved_at: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  governorate: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema); 