import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingManagement.css';

const BookingManagement = ({ user, onBack }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/staff/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await axios.put(`http://localhost:3000/api/staff/bookings/${bookingId}/approve`, {
        staff_id: user._id,
        notes: 'تمت الموافقة'
      });
      fetchBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await axios.put(`http://localhost:3000/api/staff/bookings/${bookingId}/reject`, {
        staff_id: user._id,
        notes: 'تم الرفض'
      });
      fetchBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'في انتظار الموافقة';
      case 'approved': return 'تمت الموافقة';
      case 'rejected': return 'مرفوضة';
      default: return 'غير معروف';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="booking-management">
      <header className="page-header">
        <button onClick={onBack} className="back-btn">← رجوع</button>
        <h1>إدارة الحجوزات</h1>
      </header>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          جميع الحجوزات
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          في انتظار الموافقة
        </button>
        <button 
          className={filter === 'approved' ? 'active' : ''} 
          onClick={() => setFilter('approved')}
        >
          تمت الموافقة
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''} 
          onClick={() => setFilter('rejected')}
        >
          مرفوضة
        </button>
      </div>

      <div className="bookings-list">
        {filteredBookings.map(booking => (
          <div key={booking._id} className="booking-card">
            <div className="booking-header">
              <h3>حجز #{booking._id.slice(-6)}</h3>
              <span className={`status ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>
            
            <div className="booking-details">
              <p><strong>الدكتور:</strong> {booking.user_id?.name}</p>
              <p><strong>المستشفى:</strong> {booking.user_id?.hospital_name}</p>
              <p><strong>المحافظة:</strong> {booking.user_id?.governorate}</p>
              <p><strong>نوع المفصل:</strong> {booking.joint_type_id?.name}</p>
              <p><strong>التاريخ:</strong> {booking.date}</p>
              <p><strong>الميعاد:</strong> {booking.time_slot_id?.start_time}</p>
              <p><strong>تاريخ الحجز:</strong> {new Date(booking.createdAt).toLocaleDateString('ar-EG')}</p>
            </div>

            {booking.status === 'pending' && (
              <div className="booking-actions">
                <button 
                  onClick={() => handleApprove(booking._id)}
                  className="approve-btn"
                >
                  موافقة
                </button>
                <button 
                  onClick={() => handleReject(booking._id)}
                  className="reject-btn"
                >
                  رفض
                </button>
              </div>
            )}

            {booking.notes && (
              <div className="booking-notes">
                <strong>ملاحظات:</strong> {booking.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="no-bookings">
          لا توجد حجوزات {filter !== 'all' && `بالحالة المحددة`}
        </div>
      )}
    </div>
  );
};

export default BookingManagement; 