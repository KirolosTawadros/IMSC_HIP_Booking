import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { getUserBookings, cancelBooking, getJointTypes } from '../../services/api';
import { getUser } from '../../services/auth';
import { t } from '../../i18n';
import NotificationService from '../../services/notifications';
import { Card, Surface, Chip, Button, Divider, FAB } from 'react-native-paper';

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
    case 'pending': return COLORS.bookingPending;
    case 'approved': return COLORS.bookingApproved;
    case 'rejected': return COLORS.bookingRejected;
    case 'cancelled': return COLORS.bookingCancelled;
    default: return COLORS.textTertiary;
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
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [jointTypes, setJointTypes] = useState<any[]>([]);
  const scheduledMotivationRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('🔍 Fetching user for MyBookings...');
      const u = await getUser();
      console.log('👤 User for MyBookings:', u);
      setUser(u);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchJointTypes = async () => {
      try {
        const response = await getJointTypes();
        if (mounted) setJointTypes(response.data);
      } catch (error) {
        if (mounted) setJointTypes([]);
      }
    };
    fetchJointTypes();
    return () => { mounted = false; };
  }, []);

  const loadBookings = useCallback(async (setLoadingState = true) => {
    console.log('📋 Loading bookings for user:', user);
    if (!user?.data?._id) {
      console.log('❌ No user ID found');
      if (setLoadingState) setLoading(false);
      return;
    }
    try {
      console.log('🔍 Fetching bookings from API...');
      const response = await getUserBookings(user.data._id);
      console.log('✅ Bookings loaded successfully:', response.data);
      setBookings(response.data);
    } catch (error) {
      console.log('❌ Error loading bookings:', error);
      Alert.alert('خطأ', 'فشل في تحميل الحجوزات');
    } finally {
      if (setLoadingState) setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const fetch = async () => {
        if (mounted) await loadBookings();
      };
      fetch();
      return () => { mounted = false; };
    }, [loadBookings])
  );

  useEffect(() => {
    if (bookings.length > 0) {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const tomorrowBookings = bookings.filter(
        (b) => b.status === 'approved' && b.date === tomorrowStr
      );
      if (tomorrowBookings.length > 0) {
        const body = tomorrowBookings.map((b, i) =>
          `${i + 1}- ${b.joint_type_id.name} في مستشفى ${b.joint_type_id.name} الساعة ${b.time_slot_id.start_time}`
        ).join('\n');
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

  useEffect(() => {
    if (bookings.length > 0 && jointTypes.length > 0) {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const tomorrowBookings = bookings.filter(
        (b) => b.status === 'approved' && b.date === tomorrowStr
      );
      if (tomorrowBookings.length === 0) {
        const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
        const jointTypeIndex = dayIndex % jointTypes.length;
        const jointTypeName = jointTypes[jointTypeIndex]?.name || 'مفصل';
        const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 13, 0, 0, 0);
        const reminderKey = `${reminderDate.toISOString()}-${jointTypeName}`;
        if (reminderDate > now && scheduledMotivationRef.current !== reminderKey) {
          NotificationService.scheduleNotification(
            'تذكير من المركز الدولي',
            `عندك مفصل ${jointTypeName} ولسه محجزتش، المركز الدولي معاك دايمًا وبيفكرك بمواعيد عمليات المفاصل بتاعتك`,
            reminderDate,
            {
              screen: 'SelectJointType',
              type: 'motivational',
            }
          );
          scheduledMotivationRef.current = reminderKey;
        }
      }
    }
  }, [bookings, jointTypes]);

  const markedDates = bookings.reduce((acc, booking) => {
    if (!acc[booking.date]) {
      acc[booking.date] = { 
        periods: [],
        dots: [],
        textColor: COLORS.text
      };
    }
    
    // Add period marking for multi-period support
    acc[booking.date].periods.push({
      color: getStatusColor(booking.status),
      startingDay: true,
      endingDay: true,
      textColor: COLORS.textInverse,
    });
    
    // Add dot marking for additional visual indication
    acc[booking.date].dots.push({
      color: getStatusColor(booking.status),
      key: booking._id,
      selectedDotColor: COLORS.textInverse,
    });
    
    // If multiple bookings on same date, adjust text color for better visibility
    if (acc[booking.date].periods.length > 1) {
      acc[booking.date].textColor = COLORS.textInverse;
    }
    
    return acc;
  }, {} as any);

  // Add selected date marking
  if (selectedDate && markedDates[selectedDate]) {
    markedDates[selectedDate].selected = true;
    markedDates[selectedDate].selectedColor = COLORS.primary;
    markedDates[selectedDate].selectedTextColor = COLORS.textInverse;
  } else if (selectedDate) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: COLORS.primary,
      selectedTextColor: COLORS.textInverse,
      periods: [],
      dots: []
    };
  }

  const bookingsForSelectedDate = selectedDate
    ? bookings.filter((b) => b.date === selectedDate)
    : [];

  const isBookingCancellable = (booking: Booking) => {
    if (booking.status !== 'pending' && booking.status !== 'approved') {
      return false;
    }

    const bookingDate = new Date(booking.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (bookingDate < today) {
      return false;
    }
    
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
              console.log('🔍 Cancelling booking:', booking._id);
              await cancelBooking(booking._id);
              console.log('✅ Booking cancelled successfully');
              
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
              console.log('🔄 Reloading bookings after cancellation');
              loadBookings();
            } catch (error: any) {
              console.log('❌ Error cancelling booking:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderBooking = (booking: Booking) => (
    <Card key={booking._id} style={styles.bookingCard} elevation={3}>
      <Card.Content style={styles.bookingContent}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <MaterialCommunityIcons 
              name="bone" 
              size={24} 
              color={COLORS.primary} 
            />
            <View style={styles.bookingText}>
              <Text style={styles.bookingTitle}>{booking.joint_type_id.name}</Text>
              <Text style={styles.bookingDate}>{formatDate(booking.date)}</Text>
              <Text style={styles.bookingTime}>{formatTime(booking.time_slot_id.start_time)}</Text>
            </View>
          </View>
          <Chip 
            icon={getStatusIcon(booking.status) as any}
            style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
            textStyle={styles.statusChipText}
          >
            {getStatusText(booking.status)}
          </Chip>
        </View>

        {isBookingCancellable(booking) && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.bookingActions}>
              <Button
                mode="outlined"
                onPress={() => handleCancelBooking(booking)}
                loading={cancelling === booking._id}
                disabled={cancelling === booking._id}
                style={styles.cancelButton}
                contentStyle={styles.buttonContent}
                labelStyle={[styles.buttonLabel, { color: COLORS.error }]}
              >
                {t('cancel_booking')}
              </Button>
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.loadingContainer}>
        <Surface style={styles.loadingCard} elevation={4}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </Surface>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadBookings(false).finally(() => setRefreshing(false));
              }}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('my_bookings')}</Text>
            <Text style={styles.subtitle}>{t('manage_your_bookings')}</Text>
          </View>

          {/* Calendar Card */}
          <Card style={styles.calendarCard} elevation={4}>
            <Card.Content style={styles.calendarContent}>
              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{bookings.filter(b => b.status === 'pending').length}</Text>
                  <Text style={styles.statLabel}>{t('pending')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{bookings.filter(b => b.status === 'approved').length}</Text>
                  <Text style={styles.statLabel}>{t('approved')}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{bookings.filter(b => b.status === 'cancelled').length}</Text>
                  <Text style={styles.statLabel}>{t('cancelled')}</Text>
                </View>
              </View>

              <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={markedDates}
                markingType="multi-period"
                theme={{
                  backgroundColor: COLORS.card,
                  calendarBackground: COLORS.card,
                  textSectionTitleColor: COLORS.text,
                  selectedDayBackgroundColor: COLORS.primary,
                  selectedDayTextColor: COLORS.textInverse,
                  todayTextColor: COLORS.primary,
                  dayTextColor: COLORS.text,
                  textDisabledColor: COLORS.textTertiary,
                  dotColor: COLORS.primary,
                  selectedDotColor: COLORS.textInverse,
                  arrowColor: COLORS.primary,
                  monthTextColor: COLORS.text,
                  indicatorColor: COLORS.primary,
                  textDayFontFamily: FONTS.family.regular,
                  textMonthFontFamily: FONTS.family.medium,
                  textDayHeaderFontFamily: FONTS.family.medium,
                  textDayFontWeight: '400' as const,
                  textMonthFontWeight: '600' as const,
                  textDayHeaderFontWeight: '500' as const,
                  textDayFontSize: SIZES.md,
                  textMonthFontSize: SIZES.lg,
                  textDayHeaderFontSize: SIZES.sm,
                }}
                style={styles.calendar}
              />
              
              {/* Status Legend */}
              <View style={styles.legendContainer}>
                <Text style={styles.legendTitle}>{t('booking_status')}</Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: getStatusColor('pending') }]} />
                    <Text style={styles.legendText}>{t('pending')}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: getStatusColor('approved') }]} />
                    <Text style={styles.legendText}>{t('approved')}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: getStatusColor('rejected') }]} />
                    <Text style={styles.legendText}>{t('rejected')}</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: getStatusColor('cancelled') }]} />
                    <Text style={styles.legendText}>{t('cancelled')}</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Bookings Section */}
          <View style={styles.bookingsSection}>
            {bookingsForSelectedDate.length > 0 ? (
              bookingsForSelectedDate.map(renderBooking)
            ) : (
              <Surface style={styles.emptyCard} elevation={2}>
                <MaterialCommunityIcons 
                  name="calendar-blank" 
                  size={48} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.emptyTitle}>{t('no_bookings_for_date')}</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedDate === new Date().toISOString().split('T')[0] 
                    ? t('no_bookings_today') 
                    : t('no_bookings_selected_date')}
                </Text>
              </Surface>
            )}
          </View>
        </ScrollView>

        {/* FAB */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('SelectJointType')}
          color={COLORS.textInverse}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  loadingCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    ...SHADOW.light.large,
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.largeTitle,
    fontWeight: '700' as const,
    color: COLORS.textInverse,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textInverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  calendarCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    ...SHADOW.light.large,
  },
  calendarContent: {
    padding: SIZES.spacing.md,
  },
  calendar: {
    borderRadius: SIZES.radius.md,
  },
  bookingsContainer: {
    flex: 1,
  },
  bookingsContent: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
  },
  bookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOW.light.medium,
  },
  bookingContent: {
    padding: SIZES.spacing.lg,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  bookingText: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  bookingTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  bookingDate: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  bookingTime: {
    fontSize: SIZES.sm,
    color: COLORS.textTertiary,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: COLORS.textInverse,
    fontSize: SIZES.sm,
    fontWeight: '500' as const,
  },
  divider: {
    backgroundColor: COLORS.divider,
    marginVertical: SIZES.spacing.md,
  },
  bookingActions: {
    alignItems: 'flex-end',
  },
  cancelButton: {
    borderColor: COLORS.error,
    borderRadius: SIZES.radius.sm,
  },
  buttonContent: {
    height: SIZES.button.sm,
  },
  buttonLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600' as const,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    marginTop: SIZES.spacing.xl,
    ...SHADOW.light.medium,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: SIZES.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.xl,
  },
  bookingsSection: {
    flex: 1,
    paddingHorizontal: SIZES.spacing.lg,
  },
  legendContainer: {
    marginTop: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
  },
  legendTitle: {
    fontSize: SIZES.md,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.spacing.xs,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: SIZES.spacing.xs,
  },
  legendText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.xl,
    fontWeight: '700' as const,
    color: COLORS.primary,
    marginBottom: SIZES.spacing.xs,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default MyBookingsScreen;
