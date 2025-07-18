import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './JointTypeManagement.css';

const GOVERNORATES = [
  'القاهرة الكبرى',
  'أسيوط',
  'سوهاج',
  'طنطا',
  'المنصورة'
];

const JointTypeManagement = ({ user, onBack }) => {
  const [jointTypes, setJointTypes] = useState([]);
  const [capacities, setCapacities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCapacityForm, setShowCapacityForm] = useState(false);
  const [editingJoint, setEditingJoint] = useState(null);
  const [editingCapacity, setEditingCapacity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [capacityFormData, setCapacityFormData] = useState({
    joint_type_id: '',
    governorate: '',
    capacity: '',
    time_slot_id: ''
  });
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    fetchData();
    fetchTimeSlots();
  }, []);

  const fetchData = async () => {
    try {
      const [jointTypesResponse, capacitiesResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/joint-types'),
        axios.get('http://localhost:3000/api/joint-types/capacities')
      ]);
      setJointTypes(jointTypesResponse.data);
      setCapacities(capacitiesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('حدث خطأ في تحميل البيانات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/time-slots');
      setTimeSlots(res.data);
    } catch (e) {
      alert('فشل تحميل الفترات الزمنية');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJoint) {
        await axios.put(`http://localhost:3000/api/joint-types/${editingJoint._id}`, formData);
        alert('تم تحديث نوع المفصل بنجاح');
      } else {
        await axios.post('http://localhost:3000/api/joint-types', formData);
        alert('تم إضافة نوع المفصل بنجاح');
      }
      setFormData({ name: '', description: '' });
      setEditingJoint(null);
      setShowForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error saving joint type:', error);
      alert('حدث خطأ في حفظ نوع المفصل: ' + error.message);
    }
  };

  const handleCapacitySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCapacity) {
        await axios.put(`http://localhost:3000/api/joint-types/capacities/${editingCapacity._id}`, capacityFormData);
        alert('تم تحديث السعة بنجاح');
      } else {
        await axios.post('http://localhost:3000/api/joint-types/capacities', capacityFormData);
        alert('تم إضافة السعة بنجاح');
      }
      setCapacityFormData({ joint_type_id: '', governorate: '', capacity: '', time_slot_id: '' });
      setEditingCapacity(null);
      setShowCapacityForm(false);
      await fetchData();
    } catch (error) {
      console.error('Error saving capacity:', error);
      alert('حدث خطأ في حفظ السعة: ' + error.message);
    }
  };

  const handleEdit = (jointType) => {
    setEditingJoint(jointType);
    setFormData({
      name: jointType.name,
      description: jointType.description
    });
    setShowForm(true);
  };

  const handleEditCapacity = (capacity) => {
    setEditingCapacity(capacity);
    setCapacityFormData({
      joint_type_id: capacity.joint_type_id && typeof capacity.joint_type_id === 'object' ? capacity.joint_type_id._id : capacity.joint_type_id,
      governorate: capacity.governorate,
      capacity: capacity.capacity,
      time_slot_id: capacity.time_slot_id && typeof capacity.time_slot_id === 'object' ? capacity.time_slot_id._id : capacity.time_slot_id
    });
    setShowCapacityForm(true);
  };

  const handleDelete = async (jointTypeId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا النوع؟')) {
      try {
        await axios.delete(`http://localhost:3000/api/joint-types/${jointTypeId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting joint type:', error);
      }
    }
  };

  const handleDeleteCapacity = async (capacityId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه السعة؟')) {
      try {
        await axios.delete(`http://localhost:3000/api/joint-types/capacities/${capacityId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting capacity:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '' });
    setEditingJoint(null);
    setShowForm(false);
  };

  const handleCapacityCancel = () => {
    setCapacityFormData({ joint_type_id: '', governorate: '', capacity: '', time_slot_id: '' });
    setEditingCapacity(null);
    setShowCapacityForm(false);
  };

  const getCapacitiesForJointType = (jointTypeId) => {
    return capacities.filter(cap => {
      // Handle both populated and unpopulated joint_type_id
      if (cap.joint_type_id && typeof cap.joint_type_id === 'object' && cap.joint_type_id._id) {
        return cap.joint_type_id._id === jointTypeId;
      } else if (cap.joint_type_id && typeof cap.joint_type_id === 'string') {
        return cap.joint_type_id === jointTypeId;
      }
      return false;
    });
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="joint-type-management">
      <header className="page-header">
        <button onClick={onBack} className="back-btn">← رجوع</button>
        <h1>إدارة أنواع المفاصل والسعات</h1>
        <div className="header-actions">
          <button 
            onClick={() => setShowCapacityForm(true)} 
            className="add-btn"
          >
            إضافة سعة جديدة
          </button>
          <button 
            onClick={() => setShowForm(true)} 
            className="add-btn"
          >
            إضافة نوع جديد
          </button>
        </div>
      </header>

      {showForm && (
        <div className="form-overlay">
          <div className="form-card">
            <h2>{editingJoint ? 'تعديل نوع المفصل' : 'إضافة نوع مفصل جديد'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>اسم النوع:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="أدخل اسم نوع المفصل"
                />
              </div>
              <div className="form-group">
                <label>الوصف:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="أدخل وصف نوع المفصل"
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingJoint ? 'تحديث' : 'حفظ'}
                </button>
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCapacityForm && (
        <div className="form-overlay">
          <div className="form-card">
            <h2>{editingCapacity ? 'تعديل السعة' : 'إضافة سعة جديدة'}</h2>
            <form onSubmit={handleCapacitySubmit}>
              <div className="form-group">
                <label>نوع المفصل:</label>
                <select
                  value={capacityFormData.joint_type_id}
                  onChange={(e) => setCapacityFormData({...capacityFormData, joint_type_id: e.target.value})}
                  required
                >
                  <option value="">اختر نوع المفصل</option>
                  {jointTypes.map(jointType => (
                    <option key={jointType._id} value={jointType._id}>
                      {jointType.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>المحافظة:</label>
                <select
                  value={capacityFormData.governorate}
                  onChange={(e) => setCapacityFormData({...capacityFormData, governorate: e.target.value})}
                  required
                >
                  <option value="">اختر المحافظة</option>
                  {GOVERNORATES.map(governorate => (
                    <option key={governorate} value={governorate}>
                      {governorate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>الفترة الزمنية:</label>
                <select
                  value={capacityFormData.time_slot_id || ''}
                  onChange={e => setCapacityFormData({...capacityFormData, time_slot_id: e.target.value})}
                  required
                >
                  <option value="">اختر الفترة الزمنية</option>
                  {timeSlots.map(slot => (
                    <option key={slot._id} value={slot._id}>
                      {slot.start_time} - {slot.end_time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>السعة (عدد الحالات في الميعاد الواحد):</label>
                <input
                  type="number"
                  min="1"
                  value={capacityFormData.capacity}
                  onChange={(e) => setCapacityFormData({...capacityFormData, capacity: e.target.value})}
                  required
                  placeholder="أدخل السعة"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingCapacity ? 'تحديث' : 'حفظ'}
                </button>
                <button type="button" onClick={handleCapacityCancel} className="cancel-btn">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="joint-types-list">
        {jointTypes.map(jointType => {
          const jointCapacities = getCapacitiesForJointType(jointType._id);
          return (
            <div key={jointType._id} className="joint-type-card">
              <div className="joint-type-info">
                <h3>{jointType.name}</h3>
                <p>{jointType.description}</p>
                
                <div className="capacities-section">
                  <h4>السعات حسب المحافظة:</h4>
                  {jointCapacities.length > 0 ? (
                    <div className="capacities-grid">
                      {jointCapacities.map(capacity => (
                        <div key={capacity._id} className="capacity-item">
                          <span className="governorate">{capacity.governorate}</span>
                          <span className="time-slot">
                            {capacity.time_slot_id && typeof capacity.time_slot_id === 'object' && capacity.time_slot_id.start_time
                              ? `${capacity.time_slot_id.start_time} - ${capacity.time_slot_id.end_time}`
                              : ''}
                          </span>
                          <span className="capacity-value">{capacity.capacity} حالة</span>
                          <div className="capacity-actions">
                            <button 
                              onClick={() => handleEditCapacity(capacity)}
                              className="edit-btn small"
                            >
                              تعديل
                            </button>
                            <button 
                              onClick={() => handleDeleteCapacity(capacity._id)}
                              className="delete-btn small"
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-capacities">لا توجد سعات محددة لهذا النوع</p>
                  )}
                </div>
              </div>
              <div className="joint-type-actions">
                <button 
                  onClick={() => handleEdit(jointType)}
                  className="edit-btn"
                >
                  تعديل النوع
                </button>
                <button 
                  onClick={() => handleDelete(jointType._id)}
                  className="delete-btn"
                >
                  حذف النوع
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {jointTypes.length === 0 && (
        <div className="no-joint-types">
          لا توجد أنواع مفاصل مضافة
        </div>
      )}
    </div>
  );
};

export default JointTypeManagement; 