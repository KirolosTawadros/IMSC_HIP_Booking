import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  Container,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Delete,
  FilterList,
  Search,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';

const ModernBookingManagement = ({ user, onBack }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://imsc-hip-booking-back-end.onrender.com/api/staff/bookings');
      const bookingsWithIds = response.data.map((booking, index) => ({
        ...booking,
        id: booking._id || index,
        doctorName: booking.user_id?.doctor_name || booking.user_id?.name || '',
        jointType: booking.joint_type_id?.name || '',
        governorate: booking.user_id?.governorate || '',
        hospitalName: booking.user_id?.hospital_id?.name || '',
        appointmentDate: booking.date ? new Date(booking.date).toLocaleDateString('ar-EG') : '',
        appointmentTime: booking.time_slot_id?.start_time || '',
        status: booking.status,
        createdAt: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('ar-EG') : ''
      }));
      setBookings(bookingsWithIds);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setSnackbar({ open: true, message: 'خطأ في جلب البيانات', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus, rejectionReason = '') => {
    try {
      // endpoint المناسب
      const endpoint = newStatus === 'approved'
        ? `https://imsc-hip-booking-back-end.onrender.com/api/staff/bookings/${bookingId}/approve`
        : `https://imsc-hip-booking-back-end.onrender.com/api/staff/bookings/${bookingId}/reject`;
      // جهز البيانات
      const data = {
        staff_id: user._id,
        notes: rejectionReason || (newStatus === 'approved' ? 'تمت الموافقة' : 'تم الرفض')
      };
      await axios.put(endpoint, data);
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
      setSnackbar({ 
        open: true, 
        message: `تم ${newStatus === 'approved' ? 'الموافقة على' : 'رفض'} الحجز بنجاح`, 
        severity: 'success' 
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating booking:', error);
      setSnackbar({ open: true, message: 'خطأ في تحديث الحجز', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'تمت الموافقة';
      case 'rejected': return 'مرفوض';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'doctorName',
      headerName: 'اسم الطبيب',
      width: 150
    },
    {
      field: 'jointType',
      headerName: 'نوع المفصل',
      width: 120
    },
    {
      field: 'governorate',
      headerName: 'المحافظة',
      width: 120
    },
    {
      field: 'hospitalName',
      headerName: 'المستشفى',
      width: 150
    },
    {
      field: 'appointmentDate',
      headerName: 'تاريخ الموعد',
      width: 120
    },
    {
      field: 'appointmentTime',
      headerName: 'وقت الموعد',
      width: 100
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={getStatusText(params.value)}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 120
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.status === 'pending' && (
            <>
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setSelectedBooking(params.row);
                  setActionType('approve');
                  setDialogOpen(true);
                }}
              >
                <CheckCircle />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedBooking(params.row);
                  setActionType('reject');
                  setDialogOpen(true);
                }}
              >
                <Cancel />
              </IconButton>
            </>
          )}
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setSelectedBooking(params.row);
              setActionType('view');
              setDialogOpen(true);
            }}
          >
            <Visibility />
          </IconButton>
        </Box>
      )
    }
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filters.status === 'all' || booking.status === filters.status;
    const matchesSearch = filters.search === '' || 
      booking.doctorName.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.hospitalName.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: 'white', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            إدارة الحجوزات
          </Typography>
          <IconButton color="inherit" onClick={fetchBookings}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2">إجمالي الحجوزات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2">في الانتظار</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.approved}
                </Typography>
                <Typography variant="body2">تمت الموافقة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.rejected}
                </Typography>
                <Typography variant="body2">مرفوضة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.cancelled}
                </Typography>
                <Typography variant="body2">ملغية</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="البحث في الحجوزات..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#666' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>حالة الحجز</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="حالة الحجز"
                >
                  <MenuItem value="all">جميع الحالات</MenuItem>
                  <MenuItem value="pending">في الانتظار</MenuItem>
                  <MenuItem value="approved">تمت الموافقة</MenuItem>
                  <MenuItem value="rejected">مرفوض</MenuItem>
                  <MenuItem value="cancelled">ملغي</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* DataGrid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredBookings}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e0e0e0',
              },
            }}
          />
        </Paper>
      </Container>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' && 'الموافقة على الحجز'}
          {actionType === 'reject' && 'رفض الحجز'}
          {actionType === 'view' && 'تفاصيل الحجز'}
        </DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              {actionType === 'view' ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">اسم الطبيب:</Typography>
                    <Typography variant="body1">{selectedBooking.doctorName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">نوع المفصل:</Typography>
                    <Typography variant="body1">{selectedBooking.jointType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">المحافظة:</Typography>
                    <Typography variant="body1">{selectedBooking.governorate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">المستشفى:</Typography>
                    <Typography variant="body1">{selectedBooking.hospitalName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">تاريخ الموعد:</Typography>
                    <Typography variant="body1">{selectedBooking.appointmentDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">وقت الموعد:</Typography>
                    <Typography variant="body1">{selectedBooking.appointmentTime}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">الحالة:</Typography>
                    <Chip
                      label={getStatusText(selectedBooking.status)}
                      color={getStatusColor(selectedBooking.status)}
                      size="small"
                    />
                  </Grid>
                </Grid>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {actionType === 'approve' 
                      ? `هل تريد الموافقة على هذا الحجز؟`
                      : `هل تريد رفض هذا الحجز؟`
                    }
                  </Typography>
                  {actionType === 'reject' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="سبب الرفض (اختياري)"
                      placeholder="أدخل سبب الرفض..."
                      sx={{ mt: 2 }}
                    />
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          {actionType === 'approve' && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => handleStatusUpdate(selectedBooking.id, 'approved')}
            >
              موافقة
            </Button>
          )}
          {actionType === 'reject' && (
            <Button 
              variant="contained" 
              color="error"
              onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected')}
            >
              رفض
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModernBookingManagement; 