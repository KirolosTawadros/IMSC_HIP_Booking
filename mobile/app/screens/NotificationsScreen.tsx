import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../services/api';
import { t } from '../../i18n';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SelectJointType: undefined;
  SelectDate: undefined;
  SelectTimeSlot: undefined;
  Confirmation: undefined;
  MyBookings: undefined;
  Notifications: undefined;
};

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: 'booking_approved' | 'booking_rejected' | 'booking_created';
  read: boolean;
  createdAt: string;
  booking_id: {
    _id: string;
    joint_type_id: {
      name: string;
    };
    date: string;
    time_slot_id: {
      start_time: string;
    };
  };
};

const NotificationsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Refresh data every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    if (!global.currentUser?._id) {
      setLoading(false);
      return;
    }

    try {
      const response = await getUserNotifications(global.currentUser._id);
      setNotifications(response.data);
    } catch (error: any) {
      Alert.alert('خطأ', 'فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!global.currentUser?._id) return;
    
    try {
      await markAllNotificationsAsRead(global.currentUser._id);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error: any) {
      Alert.alert('خطأ', 'فشل في حذف الإشعار');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_approved': return 'check-circle';
      case 'booking_rejected': return 'close-circle';
      case 'booking_created': return 'calendar-plus';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_approved': return '#4caf50';
      case 'booking_rejected': return '#f44336';
      case 'booking_created': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={COLORS.card} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('notifications')}</Text>
          {notifications.some(n => !n.read) && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllReadBtn}>
              <Text style={styles.markAllReadText}>{t('markAllRead')}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, !item.read && styles.unreadCard]}
              onPress={() => !item.read && handleMarkAsRead(item._id)}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons 
                  name={getNotificationIcon(item.type)} 
                  size={24} 
                  color={getNotificationColor(item.type)} 
                />
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                
                {item.booking_id && (
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingText}>
                      {item.booking_id.joint_type_id.name} - {item.booking_id.date} - {item.booking_id.time_slot_id.start_time}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString('ar-EG')} - {new Date(item.createdAt).toLocaleTimeString('ar-EG')}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => handleDeleteNotification(item._id)}
              >
                <MaterialCommunityIcons name="delete" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="bell-off" 
                size={64} 
                color={COLORS.muted} 
              />
              <Text style={styles.emptyText}>{t('noNotifications')}</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: SIZES.padding, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { 
    fontSize: SIZES.title, 
    fontWeight: 'bold', 
    color: COLORS.card, 
    textShadowColor: COLORS.shadow, 
    textShadowOffset: { width: 0, height: 2 }, 
    textShadowRadius: 8 
  },
  markAllReadBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllReadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...SHADOW,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: '#f8f9fa',
  },
  cardHeader: {
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  cardContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  bookingInfo: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  bookingText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: { 
    color: COLORS.card, 
    fontSize: SIZES.text, 
    marginTop: 16,
    textAlign: 'center',
  },
  loadingText: { color: COLORS.card, fontSize: SIZES.text, marginTop: 16 },
});

export default NotificationsScreen; 