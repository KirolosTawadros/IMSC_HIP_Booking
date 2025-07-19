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
  Alert,
  Snackbar,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack,
  Edit,
  Delete,
  Refresh,
  Search,
  Person,
  Email,
  Phone,
  LocationOn,
  LocalHospital,
  Visibility
} from '@mui/icons-material';
import axios from 'axios';

const ModernAdminUserManagement = ({ user, onBack }) => {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [actionType, setActionType] = useState('view'); // 'view' or 'edit'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    governorate: '',
    hospital_id: ''
  });

  const governorates = [
    'القاهرة الكبرى',
    'أسيوط',
    'سوهاج',
    'طنطا',
    'المنصورة'
  ];

  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://imsc-hip-booking-back-end.onrender.com/api/users');
      const doctorsWithIds = response.data.map((doctor, index) => ({
        ...doctor,
        id: doctor._id || index,
        doctorName: doctor.name,
        doctorEmail: doctor.email || '',
        doctorPhone: doctor.phone_number,
        doctorGovernorate: doctor.governorate,
        doctorHospital: doctor.hospital_id?.name || doctor.hospital_name || '',
        doctorStatus: doctor.status || 'pending',
        createdAt: new Date(doctor.createdAt).toLocaleDateString('ar-EG')
      }));
      setDoctors(doctorsWithIds);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setSnackbar({ open: true, message: 'خطأ في جلب البيانات', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await axios.get('https://imsc-hip-booking-back-end.onrender.com/api/hospitals');
      setHospitals(response.data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://imsc-hip-booking-back-end.onrender.com/api/users/${selectedDoctor.id}`, formData);
      setSnackbar({ open: true, message: 'تم تحديث بيانات الطبيب بنجاح', severity: 'success' });
      setDialogOpen(false);
      setSelectedDoctor(null);
      setFormData({ name: '', email: '', phone: '', governorate: '', hospital_id: '' });
      fetchDoctors();
    } catch (error) {
      console.error('Error updating doctor:', error);
      setSnackbar({ open: true, message: 'خطأ في تحديث بيانات الطبيب', severity: 'error' });
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
      try {
        await axios.delete(`https://imsc-hip-booking-back-end.onrender.com/api/users/${doctorId}`);
        setSnackbar({ open: true, message: 'تم حذف الطبيب بنجاح', severity: 'success' });
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        setSnackbar({ open: true, message: 'خطأ في حذف الطبيب', severity: 'error' });
      }
    }
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setActionType('edit');
    setFormData({
      name: doctor.doctorName,
      email: doctor.doctorEmail,
      phone: doctor.doctorPhone,
      governorate: doctor.doctorGovernorate,
      hospital_id: doctor.hospital_id || ''
    });
    setDialogOpen(true);
  };

  const handleView = (doctor) => {
    setSelectedDoctor(doctor);
    setActionType('view');
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'تمت الموافقة';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'doctorName',
      headerName: 'اسم الطبيب',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
            {params.value.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'doctorEmail',
      headerName: 'البريد الإلكتروني',
      width: 200
    },
    {
      field: 'doctorPhone',
      headerName: 'رقم الهاتف',
      width: 130
    },
    {
      field: 'doctorHospital',
      headerName: 'المستشفى',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital sx={{ color: '#666', fontSize: 16 }} />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'doctorGovernorate',
      headerName: 'المحافظة',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOn sx={{ color: '#666', fontSize: 16 }} />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'doctorStatus',
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
      headerName: 'تاريخ التسجيل',
      width: 120
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(params.row)}
          >
            <Visibility />
          </IconButton>
          <IconButton
            size="small"
            color="secondary"
            onClick={() => handleEdit(params.row)}
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteDoctor(params.row.id)}
          >
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesStatus = filters.status === 'all' || doctor.doctorStatus === filters.status;
    const matchesSearch = filters.search === '' || 
      doctor.doctorName.toLowerCase().includes(filters.search.toLowerCase()) ||
      doctor.doctorEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
      doctor.doctorHospital.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: doctors.length,
    approved: doctors.filter(d => d.doctorStatus === 'approved').length,
    pending: doctors.filter(d => d.doctorStatus === 'pending').length,
    rejected: doctors.filter(d => d.doctorStatus === 'rejected').length
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: 'white', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            إدارة الأطباء
          </Typography>
          <IconButton color="inherit" onClick={fetchDoctors}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2">إجمالي الأطباء</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.approved}
                </Typography>
                <Typography variant="body2">تمت الموافقة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2">في الانتظار</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.rejected}
                </Typography>
                <Typography variant="body2">مرفوضة</Typography>
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
                placeholder="البحث في الأطباء..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#666' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>حالة الطبيب</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  label="حالة الطبيب"
                >
                  <MenuItem value="all">جميع الحالات</MenuItem>
                  <MenuItem value="approved">تمت الموافقة</MenuItem>
                  <MenuItem value="pending">في الانتظار</MenuItem>
                  <MenuItem value="rejected">مرفوض</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* DataGrid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredDoctors}
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

      {/* View/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'edit' ? 'تعديل بيانات الطبيب' : 'تفاصيل الطبيب'}
        </DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Box sx={{ mt: 2 }}>
              {actionType === 'view' ? (
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#1976d2' }}>
                        {selectedDoctor.doctorName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={selectedDoctor.doctorName}
                      secondary="اسم الطبيب"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={selectedDoctor.doctorEmail}
                      secondary="البريد الإلكتروني"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={selectedDoctor.doctorPhone}
                      secondary="رقم الهاتف"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={selectedDoctor.doctorHospital}
                      secondary="المستشفى"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={selectedDoctor.doctorGovernorate}
                      secondary="المحافظة"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={
                        <Chip
                          label={getStatusText(selectedDoctor.doctorStatus)}
                          color={getStatusColor(selectedDoctor.doctorStatus)}
                          size="small"
                        />
                      }
                      secondary="حالة الطبيب"
                    />
                  </ListItem>
                </List>
              ) : (
                <form onSubmit={handleUpdateDoctor}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="اسم الطبيب"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="البريد الإلكتروني"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="رقم الهاتف"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>المحافظة</InputLabel>
                        <Select
                          value={formData.governorate}
                          onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                          label="المحافظة"
                          required
                        >
                          {governorates.map((governorate) => (
                            <MenuItem key={governorate} value={governorate}>
                              {governorate}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>المستشفى</InputLabel>
                        <Select
                          value={formData.hospital_id}
                          onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                          label="المستشفى"
                          required
                        >
                          {hospitals.map((hospital) => (
                            <MenuItem key={hospital._id} value={hospital._id}>
                              {hospital.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
          {actionType === 'edit' && (
            <Button onClick={handleUpdateDoctor} variant="contained">
              تحديث
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

export default ModernAdminUserManagement; 