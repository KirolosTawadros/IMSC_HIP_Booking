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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Refresh,
  Search,
  ExpandMore,
  Settings,
  AccessTime,
  LocationOn
} from '@mui/icons-material';
import axios from 'axios';

const ModernJointTypeManagement = ({ user, onBack }) => {
  const [jointTypes, setJointTypes] = useState([]);
  const [capacities, setCapacities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJointType, setEditingJointType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacities: []
  });
  const [newCapacity, setNewCapacity] = useState({
    governorate: '',
    time_slot_id: '',
    capacity: ''
  });
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    fetchData();
    fetchTimeSlots();
  }, []);

  const fetchData = async () => {
    try {
      const [jointTypesResponse, capacitiesResponse] = await Promise.all([
        axios.get('https://imsc-hip-booking-back-end.onrender.com/api/joint-types'),
        axios.get('https://imsc-hip-booking-back-end.onrender.com/api/joint-types/capacities')
      ]);
      
      const jointTypesWithIds = jointTypesResponse.data.map((jointType, index) => ({
        ...jointType,
        id: jointType._id || index,
        jointTypeName: jointType.name,
        jointTypeDescription: jointType.description,
        capacitiesCount: (capacitiesResponse.data || []).filter(
          cap => (cap.joint_type_id && ((cap.joint_type_id._id || cap.joint_type_id) == jointType._id))
        ).length
      }));
      
      setJointTypes(jointTypesWithIds);
      setCapacities(capacitiesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({ open: true, message: 'خطأ في تحميل البيانات: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const res = await axios.get('https://imsc-hip-booking-back-end.onrender.com/api/time-slots');
      setTimeSlots(res.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'خطأ في تحميل الفترات الزمنية', severity: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // فلتر السعات قبل الإرسال (تأكد من اكتمال كل الحقول المطلوبة وبشكل صارم)
    const filteredFormData = {
      ...formData,
      capacities: (formData.capacities || []).filter(
        cap =>
          typeof cap.time_slot_id === 'string' &&
          cap.time_slot_id.trim() !== '' &&
          typeof cap.governorate === 'string' &&
          cap.governorate.trim() !== '' &&
          cap.capacity !== undefined &&
          cap.capacity !== null &&
          !isNaN(Number(cap.capacity)) &&
          Number(cap.capacity) > 0
      )
    };
    console.log('Submitting joint type (filtered capacities):', filteredFormData);
    // Prevent submit if capacities is missing or empty
    if (!filteredFormData.capacities || filteredFormData.capacities.length === 0) {
      setSnackbar({ open: true, message: 'يجب إضافة سعة واحدة على الأقل لكل نوع مفصل', severity: 'error' });
      return;
    }
    try {
      if (editingJointType) {
        await axios.put(`https://imsc-hip-booking-back-end.onrender.com/api/joint-types/${editingJointType.id}`, filteredFormData);
        setSnackbar({ open: true, message: 'تم تحديث نوع المفصل بنجاح', severity: 'success' });
      } else {
        await axios.post('https://imsc-hip-booking-back-end.onrender.com/api/joint-types', filteredFormData);
        setSnackbar({ open: true, message: 'تم إضافة نوع المفصل بنجاح', severity: 'success' });
      }
      
      setDialogOpen(false);
      setEditingJointType(null);
      setFormData({ name: '', description: '', capacities: [] });
      fetchData();
    } catch (error) {
      console.error('Error saving joint type:', error);
      setSnackbar({ open: true, message: 'خطأ في حفظ نوع المفصل', severity: 'error' });
    }
  };

  const handleEdit = async (jointType) => {
    setEditingJointType(jointType);
    try {
      const res = await axios.get('https://imsc-hip-booking-back-end.onrender.com/api/joint-types/capacities');
      const relatedCapacities = (res.data || []).filter(
        cap => (cap.joint_type_id && ((cap.joint_type_id._id || cap.joint_type_id) == jointType._id))
      );
      console.log('DEBUG: relatedCapacities', relatedCapacities);
      // تجهيز السعات مع time_slot_id فقط، تجاهل أي سعة ليس بها time_slot_id أو time_slot نص (ID)
      const capacitiesWithSlotId = relatedCapacities.map(cap => {
        let slotId = cap.time_slot_id;
        if (!slotId && typeof cap.time_slot === 'string') slotId = cap.time_slot;
        // إذا لم يوجد time_slot_id أو time_slot نص، تجاهل السعة
        if (!slotId) return null;
        return {
          governorate: cap.governorate,
          time_slot_id: (typeof slotId === 'object' && slotId !== null && slotId._id)
            ? String(slotId._id)
            : String(slotId),
          capacity: Number(cap.capacity) // تأكد أنه رقم
        };
      }).filter(Boolean); // تجاهل null
      console.log('DEBUG: capacitiesWithSlotId', capacitiesWithSlotId);
      setFormData({
        name: jointType.name || jointType.jointTypeName,
        description: jointType.description || jointType.jointTypeDescription,
        capacities: capacitiesWithSlotId
      });
      setDialogOpen(true);
    } catch (error) {
      setSnackbar({ open: true, message: 'خطأ في تحميل السعات', severity: 'error' });
      setDialogOpen(true);
    }
  };

  const handleDelete = async (jointTypeId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا النوع من المفاصل؟')) {
      try {
        await axios.delete(`https://imsc-hip-booking-back-end.onrender.com/api/joint-types/${jointTypeId}`);
        setSnackbar({ open: true, message: 'تم حذف نوع المفصل بنجاح', severity: 'success' });
        fetchData();
      } catch (error) {
        console.error('Error deleting joint type:', error);
        setSnackbar({ open: true, message: 'خطأ في حذف نوع المفصل', severity: 'error' });
      }
    }
  };

  const handleAddNew = () => {
    setEditingJointType(null);
    setFormData({ name: '', description: '', capacities: [] });
    setDialogOpen(true);
  };

  const addCapacity = () => {
    if (newCapacity.governorate && newCapacity.time_slot_id && newCapacity.capacity) {
      setFormData(prev => ({
        ...prev,
        capacities: [...(prev.capacities || []), {
          governorate: newCapacity.governorate,
          time_slot_id: (typeof newCapacity.time_slot_id === 'object' && newCapacity.time_slot_id !== null && newCapacity.time_slot_id._id)
            ? String(newCapacity.time_slot_id._id)
            : String(newCapacity.time_slot_id),
          capacity: Number(newCapacity.capacity) // تأكد أنه رقم
        }]
      }));
      setNewCapacity({ governorate: '', time_slot_id: '', capacity: '' });
    }
  };

  const removeCapacity = (index) => {
    setFormData(prev => ({
      ...prev,
      capacities: [...(prev.capacities || [])].filter((_, i) => i !== index)
    }));
  };

  const columns = [
    {
      field: 'jointTypeName',
      headerName: 'نوع المفصل',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings sx={{ color: '#1976d2' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'jointTypeDescription',
      headerName: 'الوصف',
      width: 300
    },
    {
      field: 'capacitiesCount',
      headerName: 'عدد السعات',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}
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

  const filteredJointTypes = jointTypes.filter(jointType =>
    jointType.jointTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jointType.jointTypeDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const governorates = [
    'القاهرة الكبرى',
    'أسيوط',
    'سوهاج',
    'طنطا',
    'المنصورة'
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: 'white', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            إدارة أنواع المفاصل
          </Typography>
          <IconButton color="inherit" onClick={fetchData}>
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {/* Stats Card */}
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {jointTypes.length}
            </Typography>
            <Typography variant="body1">
              إجمالي أنواع المفاصل المسجلة
            </Typography>
          </CardContent>
        </Card>

        {/* Search and Add */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="البحث في أنواع المفاصل..."
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
                إضافة نوع مفصل جديد
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* DataGrid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredJointTypes}
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
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: 22, textAlign: 'center', pb: 1 }}>
          {editingJointType ? 'تعديل نوع المفصل' : 'إضافة نوع مفصل جديد'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 4, bgcolor: '#f9f9fb', borderRadius: 2, boxShadow: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="اسم نوع المفصل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الوصف"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  required
                  sx={{ bgcolor: 'white', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              {/* Capacities Section */}
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>إدارة السعات</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>المحافظة</InputLabel>
                          <Select
                            value={newCapacity.governorate}
                            onChange={(e) => setNewCapacity({ ...newCapacity, governorate: e.target.value })}
                            label="المحافظة"
                          >
                            {governorates.map((gov) => (
                              <MenuItem key={gov} value={gov}>{gov}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>الميعاد</InputLabel>
                          <Select
                            value={newCapacity.time_slot_id || ''}
                            onChange={(e) => setNewCapacity({ ...newCapacity, time_slot_id: e.target.value })}
                            label="الميعاد"
                          >
                            {timeSlots.map((slot) => (
                              <MenuItem key={slot._id} value={slot._id}>
                                {slot.start_time} - {slot.end_time}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="السعة"
                          type="number"
                          value={newCapacity.capacity}
                          onChange={(e) => setNewCapacity({ ...newCapacity, capacity: e.target.value })}
                          sx={{ bgcolor: 'white', borderRadius: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button
                          variant="contained"
                          onClick={addCapacity}
                          fullWidth
                          sx={{ height: 56, fontWeight: 'bold', fontSize: 18 }}
                        >
                          إضافة
                        </Button>
                      </Grid>
                    </Grid>
                    {/* Existing Capacities */}
                    {(formData.capacities || []).length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>السعات المضافة:</Typography>
                        <List>
                          {(formData.capacities || []).map((capacity, index) => {
                            // البحث عن الفترة الزمنية المرتبطة بالسعة
                            const slot = timeSlots.find(s => s._id === capacity.time_slot_id);
                            const slotLabel = slot ? `${slot.start_time} - ${slot.end_time}` : '—';
                            return (
                              <ListItem key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1, bgcolor: '#fff' }}>
                                <ListItemText
                                  primary={<span style={{ fontWeight: 500 }}>{capacity.governorate} - <span style={{ color: '#1976d2' }}>{slotLabel}</span></span>}
                                  secondary={<span style={{ color: '#1976d2' }}>السعة: {capacity.capacity}</span>}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    color="error"
                                    onClick={() => removeCapacity(index)}
                                  >
                                    <Delete />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'space-between' }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 'bold', fontSize: 18 }}>إلغاء</Button>
            <Button type="submit" variant="contained" sx={{ fontWeight: 'bold', fontSize: 18 }}>
              {editingJointType ? 'تحديث' : 'إضافة'}
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

export default ModernJointTypeManagement; 