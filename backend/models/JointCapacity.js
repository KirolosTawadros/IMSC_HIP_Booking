const mongoose = require('mongoose');

const jointCapacitySchema = new mongoose.Schema({
  joint_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JointType',
    required: true
  },
  time_slot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  governorate: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JointCapacity', jointCapacitySchema); 