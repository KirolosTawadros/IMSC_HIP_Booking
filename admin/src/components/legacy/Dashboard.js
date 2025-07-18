import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, onNavigate }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [allBookings, pendingBookings] = await Promise.all([
        axios.get('http://localhost:3000/api/staff/bookings'),
        axios.get('http://localhost:3000/api/staff/bookings/pending')
      ]);

      const total = allBookings.data.length;
      const pending = pendingBookings.data.length;
      const approved = allBookings.data.filter(b => b.status === 'approved').length;
      const rejected = allBookings.data.filter(b => b.status === 'rejected').length;

      setStats({ totalBookings: total, pendingBookings: pending, approvedBookings: approved, rejectedBookings: rejected });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>لوحة التحكم - IMSC</h1>
        <h2 style={{marginTop: '-10px', color: '#1976d2', fontWeight: 600}}>المركز الدولي للخدمات الطبية</h2>
        <div className="user-info">
          <span>مرحباً، {user.name}</span>
          <button onClick={onLogout} className="logout-btn">تسجيل الخروج</button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>إجمالي الحجوزات</h3>
          <p className="stat-number">{stats.totalBookings}</p>
        </div>
        <div className="stat-card pending">
          <h3>في انتظار الموافقة</h3>
          <p className="stat-number">{stats.pendingBookings}</p>
        </div>
        <div className="stat-card approved">
          <h3>تمت الموافقة</h3>
          <p className="stat-number">{stats.approvedBookings}</p>
        </div>
        <div className="stat-card rejected">
          <h3>مرفوضة</h3>
          <p className="stat-number">{stats.rejectedBookings}</p>
        </div>
      </div>

      <div className="actions-grid">
        <div className="action-card" onClick={() => onNavigate('bookings')}>
          <h3>إدارة الحجوزات</h3>
          <p>عرض ومراجعة جميع الحجوزات</p>
        </div>
        {user.role === 'admin' && (
          <>
            <div className="action-card" onClick={() => onNavigate('joint-types')}>
              <h3>إدارة أنواع المفاصل</h3>
              <p>إضافة وتعديل أنواع المفاصل</p>
            </div>
            <div className="action-card" onClick={() => onNavigate('doctor-requests')}>
              <h3>طلبات الأطباء الجدد</h3>
              <p>مراجعة طلبات تسجيل الأطباء والموافقة عليها</p>
            </div>
            <div className="action-card" onClick={() => onNavigate('hospitals')}>
              <h3>إدارة المستشفيات</h3>
              <p>إضافة وتعديل وحذف المستشفيات</p>
            </div>
            <div className="action-card" onClick={() => onNavigate('admin-users')}>
              <h3>إدارة الأطباء</h3>
              <p>عرض وتعديل وحذف جميع الأطباء المسجلين</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 