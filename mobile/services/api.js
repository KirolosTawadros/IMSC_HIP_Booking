import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'
    : 'http://192.168.1.41:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User APIs
export const loginUser = (phone_number, hospital_id) => 
  api.post('/users/login', { phone_number, hospital_id });

export const registerUser = (name, phone_number, hospital_id, governorate) => 
  api.post('/users/register', { name, phone_number, hospital_id, governorate });

export const getHospitals = () => 
  api.get('/hospitals');

// Joint Types APIs
export const getJointTypes = () => 
  api.get('/joint-types');

export const createJointType = (name, description) => 
  api.post('/joint-types', { name, description });

// Time Slots APIs
export const getTimeSlots = () => 
  api.get('/time-slots');

export const createTimeSlot = (start_time, end_time) => 
  api.post('/time-slots', { start_time, end_time });

// Booking APIs
export const getUserBookings = (userId) => 
  api.get(`/bookings/user/${userId}`);

export const createBooking = (user_id, joint_type_id, date, time_slot_id) => 
  api.post('/bookings', { user_id, joint_type_id, date, time_slot_id });

export const getAvailableSlots = (date, joint_type_id, user_id) => 
  api.get('/bookings/availability', { params: { date, joint_type_id, user_id } });

// Notification APIs
export const getUserNotifications = (userId) => 
  api.get(`/notifications/user/${userId}`);

export const markNotificationAsRead = (notificationId) => 
  api.put(`/notifications/${notificationId}/read`);

export const markAllNotificationsAsRead = (userId) => 
  api.put(`/notifications/user/${userId}/read-all`);

export const deleteNotification = (notificationId) => 
  api.delete(`/notifications/${notificationId}`);

// Get all time slots for a joint type and governorate, with capacity or closed status
export const getJointTypeSlotsWithStatus = (jointTypeId, governorate, date) => 
  api.get(`/joint-types/${jointTypeId}/capacities/with-slots?governorate=${encodeURIComponent(governorate)}&date=${date}`);

export default api; 