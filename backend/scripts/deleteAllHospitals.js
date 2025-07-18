// backend/scripts/deleteAllHospitals.js
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hip_booking');
  const result = await Hospital.deleteMany({});
  console.log('Deleted hospitals:', result.deletedCount);
  process.exit(0);
}

run();