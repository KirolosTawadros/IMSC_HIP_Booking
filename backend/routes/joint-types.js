const express = require('express');
const router = express.Router();
const JointType = require('../models/JointType');
const JointCapacity = require('../models/JointCapacity');
const TimeSlot = require('../models/TimeSlot');
const Booking = require('../models/Booking');

// GET all joint types
router.get('/', async (req, res) => {
  try {
    const jointTypes = await JointType.find();
    res.json(jointTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new joint type
router.post('/', async (req, res) => {
  const jointType = new JointType({
    name: req.body.name,
    description: req.body.description
  });

  try {
    const newJointType = await jointType.save();
    // Add capacities if provided
    if (Array.isArray(req.body.capacities)) {
      const capacitiesToInsert = req.body.capacities.map(cap => ({
        joint_type_id: newJointType._id,
        governorate: cap.governorate,
        time_slot_id: cap.time_slot_id, // استخدم time_slot_id
        capacity: cap.capacity
      }));
      console.log('capacitiesToInsert:', capacitiesToInsert);
      await JointCapacity.insertMany(capacitiesToInsert);
    }
    res.status(201).json(newJointType);
  } catch (error) {
    console.error('Error in joint type creation:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update joint type
router.put('/:id', async (req, res) => {
  try {
    const jointType = await JointType.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description
      },
      { new: true }
    );
    if (!jointType) {
      return res.status(404).json({ message: 'Joint type not found' });
    }
    // --- تعديل هنا: حذف السعات القديمة وإضافة الجديدة ---
    if (Array.isArray(req.body.capacities)) {
      await JointCapacity.deleteMany({ joint_type_id: req.params.id });
      const capacitiesToInsert = req.body.capacities.map(cap => ({
        joint_type_id: req.params.id,
        governorate: cap.governorate,
        time_slot_id: cap.time_slot_id,
        capacity: cap.capacity
      }));
      if (capacitiesToInsert.length > 0) {
        await JointCapacity.insertMany(capacitiesToInsert);
      }
    }
    // --- نهاية التعديل ---
    res.json(jointType);
  } catch (error) {
    console.error('Error in joint type update:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE joint type
router.delete('/:id', async (req, res) => {
  try {
    const jointType = await JointType.findByIdAndDelete(req.params.id);
    if (!jointType) {
      return res.status(404).json({ message: 'Joint type not found' });
    }
    // Also delete related capacities
    await JointCapacity.deleteMany({ joint_type_id: req.params.id });
    res.json({ message: 'Joint type deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Joint Capacities Routes

// GET all joint capacities
router.get('/capacities', async (req, res) => {
  try {
    const capacities = await JointCapacity.find()
      .populate('joint_type_id')
      .populate('time_slot_id');
    res.json(capacities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new joint capacity
router.post('/capacities', async (req, res) => {
  // تحقق من القيم المطلوبة
  if (!req.body.joint_type_id || !req.body.time_slot_id || !req.body.governorate || !req.body.capacity) {
    console.log('رفض إضافة سعة: بيانات ناقصة', req.body);
    return res.status(400).json({ message: 'يجب إدخال نوع المفصل، المحافظة، الفترة الزمنية، والسعة.' });
  }
  // تحقق من عدم وجود سعة مكررة
  const exists = await JointCapacity.findOne({
    joint_type_id: req.body.joint_type_id,
    time_slot_id: req.body.time_slot_id,
    governorate: req.body.governorate
  });
  if (exists) {
    console.log('رفض إضافة سعة: السعة مكررة', req.body);
    return res.status(400).json({ message: 'يوجد بالفعل سعة لهذا النوع والمحافظة والفترة الزمنية.' });
  }
  const capacity = new JointCapacity({
    joint_type_id: req.body.joint_type_id,
    time_slot_id: req.body.time_slot_id, // استخدم time_slot_id فقط
    governorate: req.body.governorate,
    capacity: req.body.capacity
  });
  try {
    const newCapacity = await capacity.save();
    const populatedCapacity = await JointCapacity.findById(newCapacity._id)
      .populate('joint_type_id')
      .populate('time_slot_id');
    console.log('تمت إضافة سعة جديدة:', populatedCapacity);
    res.status(201).json(populatedCapacity);
  } catch (error) {
    console.error('خطأ في إضافة السعة:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT update joint capacity
router.put('/capacities/:id', async (req, res) => {
  // تحقق من القيم المطلوبة
  if (!req.body.joint_type_id || !req.body.time_slot_id || !req.body.governorate || !req.body.capacity) {
    console.log('رفض تحديث سعة: بيانات ناقصة', req.body);
    return res.status(400).json({ message: 'يجب إدخال نوع المفصل، المحافظة، الفترة الزمنية، والسعة.' });
  }
  // تحقق من عدم وجود سعة مكررة (عدا السعة الحالية)
  const exists = await JointCapacity.findOne({
    joint_type_id: req.body.joint_type_id,
    time_slot_id: req.body.time_slot_id,
    governorate: req.body.governorate,
    _id: { $ne: req.params.id }
  });
  if (exists) {
    console.log('رفض تحديث سعة: السعة مكررة', req.body);
    return res.status(400).json({ message: 'يوجد بالفعل سعة لهذا النوع والمحافظة والفترة الزمنية.' });
  }
  try {
    const capacity = await JointCapacity.findByIdAndUpdate(
      req.params.id,
      {
        joint_type_id: req.body.joint_type_id,
        time_slot_id: req.body.time_slot_id, // استخدم time_slot_id فقط
        governorate: req.body.governorate,
        capacity: req.body.capacity
      },
      { new: true }
    ).populate('joint_type_id')
     .populate('time_slot_id');
    if (!capacity) {
      return res.status(404).json({ message: 'Capacity not found' });
    }
    console.log('تم تحديث السعة:', capacity);
    res.json(capacity);
  } catch (error) {
    console.error('خطأ في تحديث السعة:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE joint capacity
router.delete('/capacities/:id', async (req, res) => {
  try {
    const capacity = await JointCapacity.findByIdAndDelete(req.params.id);
    if (!capacity) {
      return res.status(404).json({ message: 'Capacity not found' });
    }
    console.log('تم حذف السعة:', capacity);
    res.json({ message: 'Capacity deleted' });
  } catch (error) {
    console.error('خطأ في حذف السعة:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET all time slots for a joint type and governorate, with capacity or closed status
router.get('/:jointTypeId/capacities/with-slots', async (req, res) => {
  try {
    console.log('with-slots params:', req.params, req.query);
    const { governorate, date } = req.query;
    const { jointTypeId } = req.params;
    if (!governorate) {
      return res.status(400).json({ message: 'Governorate is required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    // Get all time slots
    const allSlots = await TimeSlot.find();
    // Get all capacities for this joint type and governorate (مع populate للفترة الزمنية)
    const capacities = await JointCapacity.find({
      joint_type_id: jointTypeId,
      governorate
    }).populate('time_slot_id');
    // Build response: for each slot, find capacity or mark as closed
    const result = await Promise.all(allSlots.map(async slot => {
      const found = capacities.find(c => {
        return c.time_slot_id && c.time_slot_id._id.toString() === slot._id.toString();
      });
      if (found) {
        // احسب عدد الحجوزات الفعلية في هذا اليوم والفترة
        const bookingsCount = await Booking.countDocuments({
          joint_type_id: jointTypeId,
          time_slot_id: slot._id,
          date: date,
          governorate // تصفية حسب المحافظة
        });
        const remaining = Math.max(0, found.capacity - bookingsCount);
        return {
          _id: slot._id,
          time_slot: `${slot.start_time} - ${slot.end_time}`,
          start_time: slot.start_time,
          end_time: slot.end_time,
          capacity: found.capacity,
          remaining,
          status: remaining > 0 ? 'open' : 'full'
        };
      } else {
        return {
          _id: slot._id,
          time_slot: `${slot.start_time} - ${slot.end_time}`,
          start_time: slot.start_time,
          end_time: slot.end_time,
          capacity: 0,
          remaining: 0,
          status: 'closed'
        };
      }
    }));
    res.json(result);
  } catch (error) {
    console.error('with-slots error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 