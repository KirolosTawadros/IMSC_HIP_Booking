const mongoose = require('mongoose');
const JointCapacity = require('../models/JointCapacity');
const TimeSlot = require('../models/TimeSlot');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hip_booking';

async function fixTimeSlotIds() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const capacities = await JointCapacity.find({});
  let fixed = 0;
  let deleted = 0;
  let missing = 0;
  for (const cap of capacities) {
    // إذا لم يوجد time_slot_id نهائيًا
    if (!cap.time_slot_id) {
      await cap.deleteOne();
      deleted++;
      console.warn(`Deleted capacity ${cap._id} (no time_slot_id)`);
      continue;
    }
    // تحقق أن الـ ID موجود فعلاً في جدول TimeSlot
    const slot = await TimeSlot.findById(cap.time_slot_id);
    if (!slot) {
      await cap.deleteOne();
      deleted++;
      console.warn(`Deleted capacity ${cap._id} (invalid time_slot_id: ${cap.time_slot_id})`);
      continue;
    }
    // إذا كان time_slot_id نص وليس ObjectId
    if (typeof cap.time_slot_id === 'string') {
      cap.time_slot_id = mongoose.Types.ObjectId(cap.time_slot_id);
      await cap.save();
      fixed++;
      console.log(`Fixed capacity ${cap._id}`);
    }
  }
  console.log(`Done. Fixed ${fixed} capacities. Deleted ${deleted} capacities with missing/invalid time_slot_id.`);
  await mongoose.disconnect();
}

fixTimeSlotIds().catch(err => {
  console.error('Error fixing time_slot_id:', err);
  process.exit(1);
}); 