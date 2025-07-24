import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { getUserBookings, cancelBooking, getJointTypes } from '../../services/api';
import { t } from '../../i18n';
import NotificationService from '../../services/notifications';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SelectJointType: undefined;
  SelectDate: { jointType: string; jointTypeId: string } | undefined;
  SelectTimeSlot: { jointType: string; jointTypeId: string; date: string } | undefined;
  Confirmation: { jointType: string; jointTypeId: string; date: string; timeSlot: string; timeSlotId: string } | undefined;
  MyBookings: undefined;
  Notifications: undefined;
};

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

const MyBookingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [jointTypes, setJointTypes] = useState<any[]>([]);

  // جلب أنواع المفاصل عند أول تحميل
  useEffect(() => {
    const fetchJointTypes = async () => {
      try {
        const response = await getJointTypes();
        setJointTypes(response.data);
      } catch (error) {
        setJointTypes([]);
      }
    };
    fetchJointTypes();
  }, []);

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

  // جدولة إشعار تذكير يومي بكل عمليات الغد فقط
  useEffect(() => {
    if (bookings.length > 0) {
      // حساب تاريخ الغد
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      // جلب كل العمليات الموافق عليها ليوم الغد
      const tomorrowBookings = bookings.filter(
        (b) => b.status === 'approved' && b.date === tomorrowStr
      );
      if (tomorrowBookings.length > 0) {
        // بناء نص الإشعار
        const body = tomorrowBookings.map((b, i) =>
          `${i + 1}- ${b.joint_type_id.name} في مستشفى ${b.joint_type_id.name} الساعة ${b.time_slot_id.start_time}`
        ).join('\n');
        // جدولة الإشعار للغد الساعة 9 صباحًا
        const reminderDate = new Date(tomorrow);
        reminderDate.setHours(9, 0, 0, 0);
        if (reminderDate > now) {
          NotificationService.scheduleNotification(
            'تذكير بعمليات الغد',
            `لديك ${tomorrowBookings.length} عملية غدًا:\n${body}`,
            reminderDate,
            {
              screen: 'MyBookings',
              type: 'reminder',
            }
          );
        }
      }
    }
  }, [bookings]);

  // جدولة إشعار تحفيزي يومي أو كل يومين للطبيب الساعة 1 ظهراً إذا لم يكن لديه حجز غدًا
  useEffect(() => {
    if (bookings.length > 0 && jointTypes.length > 0) {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const tomorrowBookings = bookings.filter(
        (b) => b.status === 'approved' && b.date === tomorrowStr
      );
      // إذا لم يوجد حجز غدًا، أرسل إشعار تحفيزي الساعة 1 ظهراً
      if (tomorrowBookings.length === 0) {
        // اختيار نوع مفصل مختلف كل يوم
        const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
        const jointTypeIndex = dayIndex % jointTypes.length;
        const jointTypeName = jointTypes[jointTypeIndex]?.name || 'مفصل';
        const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 13, 0, 0, 0); // غدًا الساعة 1 ظهراً
        if (reminderDate > now) {
          NotificationService.scheduleNotification(
            'تذكير من المركز الدولي',
            `عندك مفصل ${jointTypeName} ولسه محجزتش، المركز الدولي معاك دايمًا وبيفكرك بمواعيد عمليات المفاصل بتاعتك`,
            reminderDate,
            {
              screen: 'SelectJointType',
              type: 'motivational',
            }
          );
        }
      }
    }
  }, [bookings, jointTypes]);

  // تجهيز بيانات التقويم
  const markedDates = bookings.reduce((acc, booking) => {
    acc[booking.date] = acc[booking.date] || { marked: false, dots: [] };
    acc[booking.date].marked = true;
    acc[booking.date].dots.push({
      color: getStatusColor(booking.status),
      key: booking._id,
    });
    return acc;
  }, {} as any);

  // الحجوزات لليوم المختار
  const bookingsForSelectedDate = selectedDate
    ? bookings.filter((b) => b.date === selectedDate)
    : [];

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, []);

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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: SIZES.padding, paddingTop: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <Text style={styles.title}>{t('my_bookings')}</Text>
        <Calendar
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={{
            ...markedDates,
            ...(selectedDate ? { [selectedDate]: { ...(markedDates[selectedDate] || {}), selected: true, selectedColor: COLORS.primary } } : {}),
          }}
          markingType="multi-dot"
          minDate={new Date().toISOString().split('T')[0]}
          style={styles.calendar}
          theme={{
            backgroundColor: COLORS.card,
            calendarBackground: COLORS.card,
            textSectionTitleColor: COLORS.primary,
            selectedDayBackgroundColor: COLORS.primary,
            todayTextColor: COLORS.primary,
            dayTextColor: COLORS.text,
            textDisabledColor: COLORS.muted,
            dotColor: COLORS.primary,
            selectedDotColor: COLORS.white,
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.primary,
            indicatorColor: COLORS.primary,
          }}
        />
        {selectedDate ? (
          bookingsForSelectedDate.length > 0 ? (
            bookingsForSelectedDate.map((item) => (
              <View key={item._id} style={styles.card}>
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
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="calendar-remove" 
                size={64} 
                color={COLORS.muted} 
              />
              <Text style={styles.emptyText}>{t('no_bookings_yet')}</Text>
              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => navigation.navigate('SelectJointType')}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" style={{ marginEnd: 8 }} />
                <Text style={styles.bookNowButtonText}>احجز الآن</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="calendar-search" 
              size={64} 
              color={COLORS.muted} 
            />
            <Text style={styles.emptyText}>اختر يومًا من التقويم لعرض الحجوزات</Text>
          </View>
        )}
      </ScrollView>
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
  calendar: {
    marginBottom: 24,
  },
  bookNowButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  bookNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyBookingsScreen;
