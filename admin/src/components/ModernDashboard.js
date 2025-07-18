import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  Grid,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BookOnline as BookingsIcon,
  LocalHospital as HospitalsIcon,
  People as DoctorsIcon,
  PersonAdd as RequestsIcon,
  Settings as SettingsIcon,
  AccountCircle,
  Logout,
  Notifications,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Cancel,
  AccessTime as TimeSlotIcon
} from '@mui/icons-material';
import axios from 'axios';

const drawerWidth = 280;

const ModernDashboard = ({ user, onLogout, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [allBookings, pendingBookings] = await Promise.all([
        axios.get('http://localhost:3000/api/staff/bookings'),
        axios.get('http://localhost:3000/api/staff/bookings/pending')
      ]);

      const total = allBookings.data.length;
      const pending = pendingBookings.data.length;
      const approved = allBookings.data.filter(b => b.status === 'approved').length;
      const rejected = allBookings.data.filter(b => b.status === 'rejected').length;

      setStats({ totalBookings: total, pendingBookings: pending, approvedBookings: approved, rejectedBookings: rejected });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: 'dashboard', color: '#1976d2' },
    { text: 'إدارة الحجوزات', icon: <BookingsIcon />, path: 'bookings', color: '#2e7d32' },
    { text: 'إدارة المستشفيات', icon: <HospitalsIcon />, path: 'hospitals', color: '#ed6c02' },
    { text: 'إدارة الأطباء', icon: <DoctorsIcon />, path: 'admin-users', color: '#9c27b0' },
    { text: 'طلبات الأطباء الجدد', icon: <RequestsIcon />, path: 'doctor-requests', color: '#d32f2f' },
    { text: 'إدارة أنواع المفاصل', icon: <SettingsIcon />, path: 'joint-types', color: '#7b1fa2' },
    { text: 'إدارة الفترات الزمنية', icon: <TimeSlotIcon />, path: 'time-slots', color: '#0288d1' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          IMSC
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          المركز الدولي للخدمات الطبية
        </Typography>
      </Box>
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={() => onNavigate(item.path)}
            sx={{
              mx: 1,
              mb: 1,
              borderRadius: 2,
              '&:hover': {
                bgcolor: `${item.color}15`,
                '& .MuiListItemIcon-root': {
                  color: item.color,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: '#666', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: 500,
                  fontSize: '0.95rem'
                } 
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card sx={{ 
      height: '100%', 
      background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
      border: `1px solid ${color}20`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${color}30`,
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: `${color}20`,
            color: color 
          }}>
            {icon}
          </Box>
          {trend && (
            <Chip 
              label={trend > 0 ? `+${trend}%` : `${trend}%`}
              size="small"
              color={trend > 0 ? 'success' : 'error'}
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex', direction: 'rtl' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mr: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#333',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <DashboardIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            لوحة التحكم
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              direction: 'rtl'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              direction: 'rtl'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          direction: 'rtl'
        }}
      >
        <Container maxWidth="xl">
          {/* Welcome Section */}
          <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              مرحباً، {user.name}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              إليك نظرة عامة على نشاط النظام اليوم
            </Typography>
          </Paper>

          {/* Stats Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="إجمالي الحجوزات"
                value={stats.totalBookings}
                icon={<TrendingUp />}
                color="#1976d2"
                trend={12}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="في انتظار الموافقة"
                value={stats.pendingBookings}
                icon={<Warning />}
                color="#ff9800"
                trend={-5}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="تمت الموافقة"
                value={stats.approvedBookings}
                icon={<CheckCircle />}
                color="#4caf50"
                trend={8}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="مرفوضة"
                value={stats.rejectedBookings}
                icon={<Cancel />}
                color="#f44336"
                trend={-2}
              />
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
            الإجراءات السريعة
          </Typography>
          
          <Grid container spacing={3}>
            {menuItems.slice(1).map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.text}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${item.color}20`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 25px ${item.color}30`,
                      borderColor: item.color,
                    }
                  }}
                  onClick={() => onNavigate(item.path)}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: `${item.color}15`,
                      color: item.color,
                      mb: 2,
                      display: 'inline-block'
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                      {item.text}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      إدارة {item.text.toLowerCase()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          الملف الشخصي
        </MenuItem>
        <Divider />
        <MenuItem onClick={onLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          تسجيل الخروج
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ModernDashboard; 