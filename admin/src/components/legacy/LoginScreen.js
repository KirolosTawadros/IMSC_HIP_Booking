import React, { useState } from 'react';
import axios from 'axios';
import './LoginScreen.css';

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/staff/login', {
        email,
        password
      });
      onLogin(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'فشل في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>IMSC - لوحة التحكم</h1>
        <h2 style={{marginTop: '-10px', color: '#1976d2', fontWeight: 600}}>المركز الدولي للخدمات الطبية</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          <div className="form-group">
            <label>كلمة المرور:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="أدخل كلمة المرور"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        
        <div className="test-credentials">
          <h3>بيانات الاختبار:</h3>
          <p><strong>Admin:</strong> admin@hipbooking.com / admin123</p>
          <p><strong>Staff:</strong> staff@hipbooking.com / staff123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen; 