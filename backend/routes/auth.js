const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin users (in production, this should be in database)
const adminUsers = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@imsc.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'admin',
    status: 'approved'
  },
  {
    id: 2,
    name: 'Staff',
    email: 'staff@imsc.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'staff',
    status: 'approved'
  }
];

// POST login for admin/staff
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin user
    const user = adminUsers.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'بيانات الدخول غير صحيحة' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: 'بيانات الدخول غير صحيحة' 
      });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      return res.status(403).json({ 
        success: false,
        message: 'الحساب غير مفعل' 
      });
    }

    // Create JWT token (optional)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      token,
      message: `مرحباً ${user.name}`
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في الخادم' 
    });
  }
});

// POST register new admin (for development only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = adminUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'المستخدم موجود بالفعل' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new admin user
    const newUser = {
      id: adminUsers.length + 1,
      name,
      email,
      password: hashedPassword,
      role: role || 'staff',
      status: 'approved'
    };
    
    adminUsers.push(newUser);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في الخادم' 
    });
  }
});

module.exports = router; 