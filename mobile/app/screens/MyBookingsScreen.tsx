import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { getUserBookings, cancelBooking } from '../../services/api';
import { t } from '../../i18n';
import NotificationService from '../../services/notifications';

type Booking = {
  _id: string;
  joint_type_id: {
    _id: string;
    name: string;
  };
  time_slot_id: {
    _id: string;
    start_time: string;
  };
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes?: string;
  createdAt: string;
};

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Refresh data every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  const loadBookings = async () => {
    if (!global.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const response = await getUserBookings(global.currentUser._id);
      setBookings(response.data);
    } catch (error: any) {
      Alert.alert(t('error'), 'فشل في تحميل الحجوزات');
    } finally {
      setLoading(false);
    }
  };

  const isBookingCancellable = (booking: Booking) => {
    // Only pending and approved bookings can be cancelled
    if (booking.status !== 'pending' && booking.status !== 'approved') {
      return false;
    }

    const bookingDate = new Date(booking.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // If booking is in the past, not cancellable
    if (bookingDate < today) {
      return false;
    }
    
    // If booking is today, check if time has passed
    if (bookingDate.getTime() === today.getTime()) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [hours, minutes] = booking.time_slot_id.start_time.split(':');
      const bookingTime = parseInt(hours) * 60 + parseInt(minutes);
      
      if (currentTime >= bookingTime) {
        return false;
      }
    }
    
    return true;
  };

  const handleCancelBooking = async (booking: Booking) => {
    Alert.alert(
      t('cancel_booking'),
      t('cancel_booking_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('cancel_booking'),
          style: 'destructive',
          onPress: async () => {
            setCancelling(booking._id);
            try {
              await cancelBooking(booking._id);
              
              // إرسال إشعار محلي عند نجاح إلغاء الحجز
              await NotificationService.sendLocalNotification(
                'تم إلغاء الحجز بنجاح',
                `تم إلغاء حجز ${booking.joint_type_id.name} في ${booking.date} الساعة ${booking.time_slot_id.start_time}`,
                { 
                  screen: 'MyBookings',
                  bookingType: booking.joint_type_id.name,
                  bookingDate: booking.date,
                  bookingTime: booking.time_slot_id.start_time
                }
              );
              
              Alert.alert(t('cancel_booking_success'));
              loadBookings(); // Reload bookings
            } catch (error: any) {
              let errorMessage = t('cancel_booking_error');
              if (error.response?.data?.message) {
                if (error.response.data.message.includes('past')) {
                  errorMessage = t('cannot_cancel_past');
                } else if (error.response.data.message.includes('started')) {
                  errorMessage = t('cannot_cancel_started');
                } else if (error.response.data.message.includes('already cancelled')) {
                  errorMessage = t('already_cancelled');
                } else {
                  errorMessage = error.response.data.message;
                }
              }
              Alert.alert(t('error'), errorMessage);
            } finally {
              setCancelling(null);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'cancelled': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('pending_approval');
      case 'approved': return t('approved');
      case 'rejected': return t('rejected');
      case 'cancelled': return t('cancelled');
      default: return t('unknown');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'approved': return 'check-circle';
      case 'rejected': return 'close-circle';
      case 'cancelled': return 'cancel';
      default: return 'help-circle';
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
        <Text style={styles.title}>{t('my_bookings')}</Text>
        <FlatList
          data={bookings}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons 
                  name="calendar-check" 
                  size={SIZES.icon + 4} 
                  color={COLORS.primary} 
                  style={{ marginBottom: 8 }} 
                />
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <MaterialCommunityIcons 
                    name={getStatusIcon(item.status)} 
                    size={16} 
                    color={COLORS.white} 
                  />
                  <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.label}>{t('joint_type')}: <Text style={styles.value}>{item.joint_type_id.name}</Text></Text>
              <Text style={styles.label}>{t('date')}: <Text style={styles.value}>{item.date}</Text></Text>
              <Text style={styles.label}>{t('time_slot')}: <Text style={styles.value}>{item.time_slot_id.start_time}</Text></Text>
              
              {item.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>{t('notes')}:</Text>
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
              )}
              
              <Text style={styles.dateLabel}>
                {t('booking_date')}: {new Date(item.createdAt).toLocaleDateString('ar-EG')}
              </Text>

              {/* Cancel Booking Button - Only show for cancellable bookings */}
              {isBookingCancellable(item) && (
                <TouchableOpacity
                  style={[styles.cancelButton, cancelling === item._id && styles.cancelButtonDisabled]}
                  onPress={() => handleCancelBooking(item)}
                  disabled={cancelling === item._id}
                >
                  {cancelling === item._id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="close-circle" size={16} color="#fff" style={{ marginEnd: 4 }} />
                      <Text style={styles.cancelButtonText}>{t('cancel_booking')}</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="calendar-remove" 
                size={64} 
                color={COLORS.muted} 
              />
              <Text style={styles.emptyText}>{t('no_bookings_yet')}</Text>
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
  title: { fontSize: SIZES.title, fontWeight: 'bold', color: COLORS.card, marginBottom: 32, alignSelf: 'center', textShadowColor: COLORS.shadow, textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 24,
    marginBottom: 18,
    ...SHADOW,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: { fontSize: SIZES.text, marginBottom: 4, color: COLORS.text },
  value: { fontWeight: 'bold', color: COLORS.primary },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 12,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  cancelButtonDisabled: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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

export default MyBookingsScreen;
