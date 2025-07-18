const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().populate('hospital_id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new user (register)
router.post('/register', async (req, res) => {
  try {
    const { name, phone_number, hospital_id, governorate } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone_number });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    const user = new User({
      name,
      phone_number,
      hospital_id,
      governorate,
      status: 'pending', // always pending on registration
      rejectionReason: ''
    });

    const newUser = await user.save();
    res.status(201).json({
      success: true,
      data: await newUser.populate('hospital_id'),
      message: 'تم إرسال طلب التسجيل، في انتظار موافقة الإدارة.'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST login
router.post('/login', async (req, res) => {
  try {
    const { phone_number, hospital_id } = req.body;
    
    const user = await User.findOne({ phone_number, hospital_id }).populate('hospital_id');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'حسابك قيد المراجعة من الإدارة. سيتم إشعارك عند الموافقة.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: user.rejectionReason ? `تم رفض طلبك: ${user.rejectionReason}` : 'تم رفض طلبك من الإدارة.' });
    }

    res.json({
      success: true,
      data: user,
      message: `مرحباً ${user.name} من ${user.governorate}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all pending doctors
router.get('/pending', async (req, res) => {
  try {
    const pendingDoctors = await User.find({ status: 'pending' }).populate('hospital_id');
    res.json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH approve/reject doctor
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const update = { status };
    if (status === 'rejected') {
      update.rejectionReason = rejectionReason || '';
    } else if (status === 'approved') {
      update.rejectionReason = '';
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { name, phone_number, hospital_id, governorate, status } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone_number) updateData.phone_number = phone_number;
    if (hospital_id) updateData.hospital_id = hospital_id;
    if (governorate) updateData.governorate = governorate;
    if (status) updateData.status = status;
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('hospital_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE user by id
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted', data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
