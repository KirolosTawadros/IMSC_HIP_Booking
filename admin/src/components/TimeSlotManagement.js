import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import axios from 'axios';

const TimeSlotManagement = ({ user, onBack }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState({ start_time: '', end_time: '' });

  useEffect(() => { fetchTimeSlots(); }, []);

  const fetchTimeSlots = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://imsc-hip-booking-back-end.onrender.com/api/time-slots');
      setTimeSlots(res.data);
    } catch (e) {
      alert('فشل تحميل الفترات الزمنية');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (slot = null) => {
    setEditingSlot(slot);
    setForm(slot ? { start_time: slot.start_time, end_time: slot.end_time } : { start_time: '', end_time: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSlot(null);
    setForm({ start_time: '', end_time: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.start_time || !form.end_time) return alert('يرجى إدخال وقت البداية والنهاية');
    try {
      if (editingSlot) {
        await axios.put(`https://imsc-hip-booking-back-end.onrender.com/api/time-slots/${editingSlot._id}`, form);
      } else {
        await axios.post('https://imsc-hip-booking-back-end.onrender.com/api/time-slots', form);
      }
      fetchTimeSlots();
      handleCloseDialog();
    } catch (e) {
      alert('فشل حفظ الفترة الزمنية');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفترة؟')) return;
    try {
      await axios.delete(`https://imsc-hip-booking-back-end.onrender.com/api/time-slots/${id}`);
      fetchTimeSlots();
    } catch (e) {
      alert('فشل حذف الفترة الزمنية');
    }
  };

  // قائمة الساعات من 08:00 إلى 20:00
  const hours = Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack}><ArrowBack /></IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold', ml: 2 }}>إدارة الفترات الزمنية</Typography>
      </Box>
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        إضافة فترة زمنية
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>وقت البداية</TableCell>
              <TableCell>وقت النهاية</TableCell>
              <TableCell align="center">إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3}>جاري التحميل...</TableCell></TableRow>
            ) : timeSlots.length === 0 ? (
              <TableRow><TableCell colSpan={3}>لا توجد فترات زمنية</TableCell></TableRow>
            ) : timeSlots.map(slot => (
              <TableRow key={slot._id}>
                <TableCell>{slot.start_time}</TableCell>
                <TableCell>{slot.end_time}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenDialog(slot)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(slot._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog} dir="rtl">
        <DialogTitle>{editingSlot ? 'تعديل الفترة الزمنية' : 'إضافة فترة زمنية'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1, color: 'text.secondary', fontSize: 14 }}>وقت البداية</Typography>
          <Select
            margin="dense"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            fullWidth
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="" disabled>اختر وقت البداية</MenuItem>
            {hours.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
          </Select>
          <Typography sx={{ mb: 1, color: 'text.secondary', fontSize: 14 }}>وقت النهاية</Typography>
          <Select
            margin="dense"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>اختر وقت النهاية</MenuItem>
            {hours.map(h => <MenuItem key={h} value={h}>{h}</MenuItem>)}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeSlotManagement; 