import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import './App.css';
import LoginScreen from './components/ModernLoginScreen';
import ModernDashboard from './components/ModernDashboard';
import BookingManagement from './components/ModernBookingManagement';
import JointTypeManagement from './components/ModernJointTypeManagement';
import DoctorRequestsManagement from './components/ModernDoctorRequestsManagement';
import HospitalManagement from './components/ModernHospitalManagement';
import AdminUserManagement from './components/ModernAdminUserManagement';
import TimeSlotManagement from './components/TimeSlotManagement';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create theme with RTL support
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <ModernDashboard user={currentUser} onLogout={handleLogout} onNavigate={setCurrentScreen} />;
      case 'bookings':
        return <BookingManagement user={currentUser} onBack={() => setCurrentScreen('dashboard')} />;
      case 'joint-types':
        return <JointTypeManagement user={currentUser} onBack={() => setCurrentScreen('dashboard')} />;
      case 'doctor-requests':
        return <DoctorRequestsManagement user={currentUser} onBack={() => setCurrentScreen('dashboard')} />;
      case 'hospitals':
        return <HospitalManagement user={currentUser} onBack={() => setCurrentScreen('dashboard')} />;
      case 'admin-users':
        return <AdminUserManagement user={currentUser} onBack={() => setCurrentScreen('dashboard')} />;
      case 'time-slots':
        return <TimeSlotManagement user={currentUser} onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <div className="App" dir="rtl">
          {renderScreen()}
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
