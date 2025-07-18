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
  ListItemAvatar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Visibility,
  PersonAdd,
  Refresh,
  Search,
  FilterList
} from '@mui/icons-material';
import axios from 'axios';

const ModernDoctorRequestsManagement = ({ user, onBack }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/users/pending');
      const requestsWithIds = response.data.map((request, index) => ({
        ...request,
        id: request._id || index,
        doctorName: request.name,
        email: request.email,
        phone: request.phone,
        hospitalName: request.hospital_name,
        governorate: request.governorate,
        status: request.status,
        createdAt: new Date(request.created_at).toLocaleDateString('ar-EG')
      }));
      setRequests(requestsWithIds);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setSnackbar({ open: true, message: 'خطأ في جلب البيانات', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status, rejectionReason = '') => {
    try {
      await axios.patch(`http://localhost:3000/api/users/${requestId}/status`, {
        status,
        rejectionReason
      });
      setSnackbar({ 
        open: true, 
        message: status === 'approved' ? 'تمت الموافقة على الطلب بنجاح' : 'تم رفض الطلب بنجاح', 
        severity: 'success' 
      });
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      setSnackbar({ open: true, message: 'خطأ في تحديث حالة الطلب', severity: 'error' });
    }
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
      field: 'email',
      headerName: 'البريد الإلكتروني',
      width: 200
    },
    {
      field: 'phone',
      headerName: 'رقم الهاتف',
      width: 130
    },
    {
      field: 'hospitalName',
      headerName: 'المستشفى',
      width: 150
    },
    {
      field: 'governorate',
      headerName: 'المحافظة',
      width: 120
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
      headerName: 'تاريخ الطلب',
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
                  setSelectedRequest(params.row);
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
                  setSelectedRequest(params.row);
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
              setSelectedRequest(params.row);
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

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesSearch = filters.search === '' || 
      request.doctorName.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      request.hospitalName.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: 'white', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            طلبات الأطباء الجدد
          </Typography>
          <IconButton color="inherit" onClick={fetchRequests}>
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
                <Typography variant="body2">إجمالي الطلبات</Typography>
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
                placeholder="البحث في الطلبات..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#666' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="حالة الطلب"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">في الانتظار</option>
                <option value="approved">تمت الموافقة</option>
                <option value="rejected">مرفوض</option>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* DataGrid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredRequests}
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
          {actionType === 'approve' && 'الموافقة على الطلب'}
          {actionType === 'reject' && 'رفض الطلب'}
          {actionType === 'view' && 'تفاصيل الطلب'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              {actionType === 'view' ? (
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#1976d2' }}>
                        {selectedRequest.doctorName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={selectedRequest.doctorName}
                      secondary="اسم الطبيب"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={selectedRequest.email}
                      secondary="البريد الإلكتروني"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={selectedRequest.phone}
                      secondary="رقم الهاتف"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={selectedRequest.hospitalName}
                      secondary="المستشفى"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={selectedRequest.governorate}
                      secondary="المحافظة"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary={
                        <Chip
                          label={getStatusText(selectedRequest.status)}
                          color={getStatusColor(selectedRequest.status)}
                          size="small"
                        />
                      }
                      secondary="حالة الطلب"
                    />
                  </ListItem>
                </List>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {actionType === 'approve' 
                      ? `هل تريد الموافقة على طلب الدكتور ${selectedRequest.doctorName}؟`
                      : `هل تريد رفض طلب الدكتور ${selectedRequest.doctorName}؟`
                    }
                  </Typography>
                  {actionType === 'reject' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="سبب الرفض (اختياري)"
                      placeholder="أدخل سبب الرفض..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
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
              onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')}
            >
              موافقة
            </Button>
          )}
          {actionType === 'reject' && (
            <Button 
              variant="contained" 
              color="error"
              onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected', rejectionReason)}
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

export default ModernDoctorRequestsManagement; 