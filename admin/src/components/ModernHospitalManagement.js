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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Paper,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Refresh,
  Search,
  LocalHospital,
  LocationOn,
  Phone,
  Email
} from '@mui/icons-material';
import axios from 'axios';

const ModernHospitalManagement = ({ user, onBack }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    governorate: ''
  });

  const governorates = [
    'القاهرة الكبرى',
    'أسيوط',
    'سوهاج',
    'طنطا',
    'المنصورة'
  ];

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://imsc-hip-booking-back-end.onrender.com/api/hospitals');
      const hospitalsWithIds = response.data.map((hospital, index) => ({
        ...hospital,
        id: hospital._id || index,
        hospitalName: hospital.name,
        hospitalGovernorate: hospital.governorate
      }));
      setHospitals(hospitalsWithIds);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      setSnackbar({ open: true, message: 'خطأ في جلب البيانات', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHospital) {
        await axios.put(`https://imsc-hip-booking-back-end.onrender.com/api/hospitals/${editingHospital.id}`, formData);
        setSnackbar({ open: true, message: 'تم تحديث المستشفى بنجاح', severity: 'success' });
      } else {
        await axios.post('https://imsc-hip-booking-back-end.onrender.com/api/hospitals', formData);
        setSnackbar({ open: true, message: 'تم إضافة المستشفى بنجاح', severity: 'success' });
      }
      
      setDialogOpen(false);
      setEditingHospital(null);
      setFormData({ name: '', governorate: '' });
      fetchHospitals();
    } catch (error) {
      console.error('Error saving hospital:', error);
      setSnackbar({ open: true, message: 'خطأ في حفظ المستشفى', severity: 'error' });
    }
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.hospitalName,
      governorate: hospital.hospitalGovernorate
    });
    setDialogOpen(true);
  };

  const handleDelete = async (hospitalId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستشفى؟')) {
      try {
        await axios.delete(`https://imsc-hip-booking-back-end.onrender.com/api/hospitals/${hospitalId}`);
        setSnackbar({ open: true, message: 'تم حذف المستشفى بنجاح', severity: 'success' });
        fetchHospitals();
      } catch (error) {
        console.error('Error deleting hospital:', error);
        setSnackbar({ open: true, message: 'خطأ في حذف المستشفى', severity: 'error' });
      }
    }
  };

  const handleAddNew = () => {
    setEditingHospital(null);
    setFormData({ name: '', governorate: '' });
    setDialogOpen(true);
  };

  const columns = [
    {
      field: 'hospitalName',
      headerName: 'اسم المستشفى',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital sx={{ color: '#1976d2' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'hospitalGovernorate',
      headerName: 'المحافظة',
      width: 200,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleEdit(params.row)}
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ];

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.hospitalGovernorate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: 'white', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            إدارة المستشفيات
          </Typography>
          <IconButton color="inherit" onClick={fetchHospitals}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {/* Stats Card */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {hospitals.length}
            </Typography>
            <Typography variant="body1">
              إجمالي المستشفيات المسجلة
            </Typography>
          </CardContent>
        </Card>

        {/* Search and Add */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="البحث في المستشفيات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#666' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddNew}
                fullWidth
                sx={{ height: 56 }}
              >
                إضافة مستشفى جديد
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* DataGrid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredHospitals}
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingHospital ? 'تعديل المستشفى' : 'إضافة مستشفى جديد'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="اسم المستشفى"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="governorate-label">المحافظة</InputLabel>
                  <Select
                    labelId="governorate-label"
                    value={formData.governorate}
                    label="المحافظة"
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  >
                    {governorates.map((governorate) => (
                      <MenuItem key={governorate} value={governorate}>
                        {governorate}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button type="submit" variant="contained">
              {editingHospital ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </form>
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

export default ModernHospitalManagement; 