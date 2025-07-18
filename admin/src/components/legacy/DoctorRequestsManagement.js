import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingManagement.css';

const DoctorRequestsManagement = ({ user, onBack }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState({});

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/users/pending');
      setDoctors(response.data);
    } catch (error) {
      alert('حدث خطأ في تحميل طلبات الأطباء');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await axios.patch(`http://localhost:3000/api/users/${doctorId}/status`, { status: 'approved' });
      fetchDoctors();
    } catch (error) {
      alert('حدث خطأ أثناء الموافقة');
    }
  };

  const handleReject = async (doctorId) => {
    const reason = rejectionReason[doctorId] || '';
    if (!window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    try {
      await axios.patch(`http://localhost:3000/api/users/${doctorId}/status`, { status: 'rejected', rejectionReason: reason });
      fetchDoctors();
    } catch (error) {
      alert('حدث خطأ أثناء الرفض');
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="booking-management">
      <header className="page-header">
        <button onClick={onBack} className="back-btn">← رجوع</button>
        <h1>طلبات تسجيل الأطباء الجدد</h1>
      </header>
      <div className="bookings-list">
        {doctors.map(doctor => (
          <div key={doctor._id} className="booking-card">
            <div className="booking-header">
              <h3>{doctor.name}</h3>
              <span className="status orange">بانتظار الموافقة</span>
            </div>
            <div className="booking-details">
              <p><strong>رقم التليفون:</strong> {doctor.phone_number}</p>
              <p><strong>المستشفى:</strong> {doctor.hospital_id?.name || '---'}</p>
              <p><strong>المحافظة:</strong> {doctor.hospital_id?.governorate || doctor.governorate || '---'}</p>
              <p><strong>تاريخ الطلب:</strong> {new Date(doctor.createdAt).toLocaleDateString('ar-EG')}</p>
            </div>
            <div className="booking-actions">
              <button 
                onClick={() => handleApprove(doctor._id)}
                className="approve-btn"
              >
                موافقة
              </button>
              <input
                type="text"
                placeholder="سبب الرفض (اختياري)"
                value={rejectionReason[doctor._id] || ''}
                onChange={e => setRejectionReason({ ...rejectionReason, [doctor._id]: e.target.value })}
                style={{ marginInline: 8, padding: 4, borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }}
              />
              <button 
                onClick={() => handleReject(doctor._id)}
                className="reject-btn"
              >
                رفض
              </button>
            </div>
          </div>
        ))}
      </div>
      {doctors.length === 0 && (
        <div className="no-bookings">لا توجد طلبات تسجيل جديدة</div>
      )}
    </div>
  );
};

export default DoctorRequestsManagement; 