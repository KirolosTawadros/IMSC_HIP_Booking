const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');

// GET all hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add hospital
router.post('/', async (req, res) => {
  try {
    const { name, governorate } = req.body;
    const hospital = new Hospital({ name, governorate });
    const newHospital = await hospital.save();
    res.status(201).json(newHospital);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT edit hospital
router.put('/:id', async (req, res) => {
  try {
    const { name, governorate } = req.body;
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { name, governorate },
      { new: true }
    );
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json(hospital);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE hospital
router.delete('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
    res.json({ message: 'Hospital deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 