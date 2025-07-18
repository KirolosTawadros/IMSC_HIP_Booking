import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusLabels = {
  pending: 'قيد المراجعة',
  approved: 'مقبول',
  rejected: 'مرفوض'
};

const AdminUserManagement = ({ user, onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:3000/api/users/');
      setUsers(res.data);
    } catch (err) {
      setError('فشل في تحميل بيانات الأطباء');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطبيب؟')) return;
    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert('فشل في حذف الطبيب');
    }
  };

  // تعديل الطبيب (نافذة منبثقة أو صفحة منفصلة يمكن إضافتها لاحقًا)
  const handleEdit = (user) => {
    alert('ميزة التعديل ستضاف لاحقًا');
  };

  if (loading) return <div className="loading">جاري تحميل بيانات الأطباء...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-users">
      <header className="page-header">
        <button onClick={onBack} className="back-btn">← رجوع</button>
        <h1>إدارة الأطباء</h1>
      </header>
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>المستشفى</th>
              <th>المحافظة</th>
              <th>الحالة</th>
              <th>سبب الرفض</th>
              <th>تاريخ الإنشاء</th>
              <th>تاريخ التحديث</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.phone_number}</td>
                <td>{u.hospital_id?.name || '-'}</td>
                <td>{u.governorate}</td>
                <td>{statusLabels[u.status] || u.status}</td>
                <td>{u.status === 'rejected' ? (u.rejectionReason || '-') : '-'}</td>
                <td>{new Date(u.createdAt).toLocaleString('ar-EG')}</td>
                <td>{new Date(u.updatedAt).toLocaleString('ar-EG')}</td>
                <td>
                  <button onClick={() => handleEdit(u)} className="edit-btn">تعديل</button>
                  <button onClick={() => handleDelete(u._id)} className="delete-btn">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="no-users">لا يوجد أطباء مسجلون</div>}
      </div>
    </div>
  );
};

export default AdminUserManagement; 