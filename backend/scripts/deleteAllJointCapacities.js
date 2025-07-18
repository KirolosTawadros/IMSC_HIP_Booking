const mongoose = require('mongoose');
const JointCapacity = require('../models/JointCapacity');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hip_booking';

async function deleteAllCapacities() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await JointCapacity.deleteMany({});
  console.log(`Deleted ${result.deletedCount} capacities.`);
  await mongoose.disconnect();
}

deleteAllCapacities().catch(err => {
  console.error('Error deleting capacities:', err);
  process.exit(1);
}); 