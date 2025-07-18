import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingManagement.css';

const GOVERNORATES = [
  'القاهرة الكبرى',
  'أسيوط',
  'سوهاج',
  'طنطا',
  'المنصورة'
];

const HospitalManagement = ({ user, onBack }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({ name: '', governorate: '' });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/hospitals');
      setHospitals(response.data);
    } catch (error) {
      alert('حدث خطأ في تحميل المستشفيات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await axios.put(`http://localhost:3000/api/hospitals/${editingHospital._id}`, formData);
        alert('تم تحديث المستشفى بنجاح');
      } else {
        await axios.post('http://localhost:3000/api/hospitals', formData);
        alert('تم إضافة المستشفى بنجاح');
      }
      setFormData({ name: '', governorate: '' });
      setEditingHospital(null);
      setShowForm(false);
      fetchHospitals();
    } catch (error) {
      alert('حدث خطأ في حفظ المستشفى: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setFormData({ name: hospital.name, governorate: hospital.governorate });
    setShowForm(true);
  };

  const handleDelete = async (hospitalId) => {
    if (!window.confirm('هل أنت متأكد من حذف المستشفى؟')) return;
    try {
      await axios.delete(`http://localhost:3000/api/hospitals/${hospitalId}`);
      fetchHospitals();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', governorate: '' });
    setEditingHospital(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="booking-management">
      <header className="page-header">
        <button onClick={onBack} className="back-btn">← رجوع</button>
        <h1>إدارة المستشفيات</h1>
        <div className="header-actions">
          <button onClick={() => setShowForm(true)} className="add-btn">إضافة مستشفى جديد</button>
        </div>
      </header>

      {showForm && (
        <div className="form-overlay">
          <div className="form-card">
            <h2>{editingHospital ? 'تعديل المستشفى' : 'إضافة مستشفى جديد'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>اسم المستشفى:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="أدخل اسم المستشفى"
                />
              </div>
              <div className="form-group">
                <label>المحافظة:</label>
                <select
                  value={formData.governorate}
                  onChange={e => setFormData({ ...formData, governorate: e.target.value })}
                  required
                >
                  <option value="">اختر المحافظة</option>
                  {GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">{editingHospital ? 'تحديث' : 'حفظ'}</button>
                <button type="button" onClick={handleCancel} className="cancel-btn">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bookings-list">
        {hospitals.map(hospital => (
          <div key={hospital._id} className="booking-card">
            <div className="booking-header">
              <h3>{hospital.name}</h3>
              <span className="status blue">{hospital.governorate}</span>
            </div>
            <div className="booking-actions">
              <button onClick={() => handleEdit(hospital)} className="edit-btn">تعديل</button>
              <button onClick={() => handleDelete(hospital._id)} className="delete-btn">حذف</button>
            </div>
          </div>
        ))}
      </div>
      {hospitals.length === 0 && (
        <div className="no-bookings">لا توجد مستشفيات مضافة</div>
      )}
    </div>
  );
};

export default HospitalManagement; 