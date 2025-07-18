const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');
const JointType = require('../models/JointType');
const TimeSlot = require('../models/TimeSlot');
const JointCapacity = require('../models/JointCapacity');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hip_booking');
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Staff.deleteMany({});
    await JointType.deleteMany({});
    await TimeSlot.deleteMany({});
    await JointCapacity.deleteMany({});

    // Create hospitals
    const hospitals = await require('../models/Hospital').create([
      { name: 'مستشفى القصر العيني', governorate: 'القاهرة الكبرى' },
      { name: 'مستشفى دار الشفاء', governorate: 'أسيوط' },
      { name: 'مستشفى المقطم', governorate: 'القاهرة الكبرى' },
      { name: 'مستشفى سوهاج العام', governorate: 'سوهاج' },
      { name: 'مستشفى طنطا الجامعي', governorate: 'طنطا' },
      { name: 'مستشفى المنصورة العام', governorate: 'المنصورة' }
    ]);

    // Create test users (doctors) with governorates and hospital_id
    const users = await User.create([
      { 
        name: 'د. أحمد محمد', 
        phone_number: '01012345678', 
        hospital_id: hospitals[0]._id,
        governorate: 'القاهرة الكبرى'
      },
      { 
        name: 'د. فاطمة علي', 
        phone_number: '01123456789', 
        hospital_id: hospitals[1]._id,
        governorate: 'أسيوط'
      },
      { 
        name: 'د. محمد حسن', 
        phone_number: '01234567890', 
        hospital_id: hospitals[2]._id,
        governorate: 'القاهرة الكبرى'
      },
      { 
        name: 'د. سارة أحمد', 
        phone_number: '01345678901', 
        hospital_id: hospitals[3]._id,
        governorate: 'سوهاج'
      },
      { 
        name: 'د. علي محمود', 
        phone_number: '01456789012', 
        hospital_id: hospitals[4]._id,
        governorate: 'طنطا'
      },
      { 
        name: 'د. نادية كمال', 
        phone_number: '01567890123', 
        hospital_id: hospitals[5]._id,
        governorate: 'المنصورة'
      }
    ]);

    // Create test staff
    const staff = await Staff.create([
      {
        name: 'أحمد مدير',
        email: 'admin@imsc.com',
        password: 'admin123',
        role: 'admin',
        department: 'الإدارة العامة'
      },
      {
        name: 'فاطمة موظفة',
        email: 'staff@imsc.com',
        password: 'staff123',
        role: 'staff',
        department: 'قسم الحجوزات'
      }
    ]);

    // Create joint types
    const jointTypes = await JointType.create([
      { name: 'Bipolar Cemented', description: 'Bipolar Cemented Hip Replacement' },
      { name: 'Total Hip Replacement', description: 'Total Hip Replacement Surgery' },
      { name: 'Unipolar', description: 'Unipolar Hip Replacement' },
    ]);

    // Create time slots
    const timeSlots = await TimeSlot.create([
      { start_time: '09:00', end_time: '11:00' },
      { start_time: '13:00', end_time: '15:00' },
      { start_time: '16:00', end_time: '18:00' },
    ]);

    // Define capacities for each governorate
    const governorateCapacities = {
      'القاهرة الكبرى': {
        'Bipolar Cemented': 10,
        'Total Hip Replacement': 8,
        'Unipolar': 6
      },
      'أسيوط': {
        'Bipolar Cemented': 4,
        'Total Hip Replacement': 3,
        'Unipolar': 2
      },
      'سوهاج': {
        'Bipolar Cemented': 5,
        'Total Hip Replacement': 4,
        'Unipolar': 3
      },
      'طنطا': {
        'Bipolar Cemented': 3,
        'Total Hip Replacement': 2,
        'Unipolar': 2
      },
      'المنصورة': {
        'Bipolar Cemented': 6,
        'Total Hip Replacement': 5,
        'Unipolar': 4
      }
    };

    // Create joint capacities for each governorate
    const capacities = [];
    const governorates = Object.keys(governorateCapacities);
    
    for (const governorate of governorates) {
      for (const jointType of jointTypes) {
        for (const timeSlot of timeSlots) {
          const capacity = governorateCapacities[governorate][jointType.name];
          capacities.push({
            joint_type_id: jointType._id,
            time_slot_id: timeSlot._id,
            governorate: governorate,
            capacity: capacity
          });
        }
      }
    }
    
    await JointCapacity.create(capacities);

    console.log('✅ Data seeded successfully!');
    console.log('👥 Users (Doctors):', users.length);
    console.log('👨‍💼 Staff:', staff.length);
    console.log('🦴 Joint Types:', jointTypes.length);
    console.log('⏰ Time Slots:', timeSlots.length);
    console.log('📊 Joint Capacities:', capacities.length);
    
    console.log('\n🔑 Doctor Credentials:');
    console.log('1. د. أحمد محمد - 01012345678 - مستشفى القصر العيني - القاهرة الكبرى');
    console.log('2. د. فاطمة علي - 01123456789 - مستشفى دار الشفاء - أسيوط');
    console.log('3. د. محمد حسن - 01234567890 - مستشفى المقطم - القاهرة الكبرى');
    console.log('4. د. سارة أحمد - 01345678901 - مستشفى سوهاج العام - سوهاج');
    console.log('5. د. علي محمود - 01456789012 - مستشفى طنطا الجامعي - طنطا');
    console.log('6. د. نادية كمال - 01567890123 - مستشفى المنصورة العام - المنصورة');
    
    console.log('\n🔑 Staff Credentials:');
    console.log('1. Admin - admin@imsc.com - admin123');
    console.log('2. Staff - staff@imsc.com - staff123');
    
    console.log('\n📊 Governorate Capacities:');
    for (const [governorate, capacities] of Object.entries(governorateCapacities)) {
      console.log(`${governorate}:`);
      for (const [jointType, capacity] of Object.entries(capacities)) {
        console.log(`  - ${jointType}: ${capacity} cases per slot`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
connectDB().then(() => {
  seedData();
}); 