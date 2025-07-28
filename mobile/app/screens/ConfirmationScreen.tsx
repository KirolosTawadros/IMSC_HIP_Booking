import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { createBooking } from '../../services/api';
import { getUser } from '../../services/auth';
import { t } from '../../i18n';
import NotificationService from '../../services/notifications';
import { Card, Surface, Chip, Button, Divider } from 'react-native-paper';

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

type RouteParams = {
  jointType: string;
  jointTypeId: string;
  date: string;
  timeSlot: string;
  timeSlotId: string;
};

const ConfirmationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { jointType, jointTypeId, date, timeSlot, timeSlotId } = (route.params as RouteParams) || { jointType: '', jointTypeId: '', date: '', timeSlot: '', timeSlotId: '' };
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('🔍 Fetching user for Confirmation...');
      const u = await getUser();
      console.log('👤 User for Confirmation:', u);
      setUser(u);
    };
    fetchUser();
  }, []);

  const handleConfirm = async () => {
    const currentUser = user?.data;
    if (!currentUser) {
      console.log('❌ No user found in handleConfirm');
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      return;
    }
    if (!timeSlotId || timeSlotId === '0') {
      Alert.alert('خطأ', 'يرجى اختيار فترة زمنية صحيحة قبل تأكيد الحجز');
      return;
    }
    setLoading(true);
    try {
      console.log('🔍 Creating booking for user:', currentUser._id);
      await createBooking(currentUser._id, jointTypeId, date, timeSlotId);
      
      await NotificationService.sendLocalNotification(
        'تم إنشاء الحجز بنجاح',
        `تم إنشاء حجز ${jointType} في ${date} الساعة ${timeSlot}`,
        { 
          screen: 'MyBookings',
          bookingType: jointType,
          bookingDate: date,
          bookingTime: timeSlot
        }
      );
      
      Alert.alert('تم الحجز بنجاح!', 'تم تأكيد الحجز الخاص بك.', [
        { text: 'حسناً', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error: any) {
      Alert.alert('خطأ', error.response?.data?.message || 'فشل في إنشاء الحجز');
    } finally {
      setLoading(false);
    }
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

  const formatTime = (timeString: string) => {
    const [startTime, endTime] = timeString.split(' - ');
    const formatSingleTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'م' : 'ص';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    return `${formatSingleTime(startTime)} - ${formatSingleTime(endTime)}`;
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Surface style={styles.successIcon} elevation={4}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={48} 
                color={COLORS.success} 
              />
            </Surface>
            <Text style={styles.title}>{t('confirmation')}</Text>
            <Text style={styles.subtitle}>{t('confirm_booking_details')}</Text>
          </View>

          {/* Booking Details Card */}
          <Card style={styles.detailsCard} elevation={4}>
            <Card.Content style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialCommunityIcons 
                    name="bone" 
                    size={24} 
                    color={COLORS.primary} 
                  />
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>{t('joint_type')}</Text>
                  <Text style={styles.detailValue}>{jointType}</Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={24} 
                    color={COLORS.secondary} 
                  />
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>{t('date')}</Text>
                  <Text style={styles.detailValue}>{formatDate(date)}</Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialCommunityIcons 
                    name="clock" 
                    size={24} 
                    color={COLORS.info} 
                  />
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>{t('time_slot')}</Text>
                  <Text style={styles.detailValue}>{formatTime(timeSlot)}</Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <MaterialCommunityIcons 
                    name="hospital-building" 
                    size={24} 
                    color={COLORS.warning} 
                  />
                </View>
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>{t('hospital')}</Text>
                  <Text style={styles.detailValue}>{user?.hospital?.name || t('selected_hospital')}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Confirmation Button */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={loading}
              style={styles.confirmButton}
              labelStyle={styles.confirmButtonText}
            >
              {loading ? t('confirming') : t('confirm_booking')}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.round,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
    ...SHADOW.light.large,
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
  detailsCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.lg,
    ...SHADOW.light.large,
  },
  detailsContent: {
    padding: SIZES.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
  },
  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  detailValue: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  divider: {
    backgroundColor: COLORS.divider,
    marginVertical: SIZES.spacing.sm,
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.lg,
    ...SHADOW.light.medium,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  statusText: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  statusTitle: {
    fontSize: SIZES.md,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  statusDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  statusChip: {
    backgroundColor: COLORS.warning,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: COLORS.textInverse,
    fontSize: SIZES.sm,
    fontWeight: '500' as const,
  },
  actionsContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOW.light.medium,
  },
  cancelButton: {
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
  },
  buttonContent: {
    height: SIZES.button.lg,
  },
  buttonLabel: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
  },
  infoText: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: SIZES.spacing.md,
  },
  confirmButtonText: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
  },
});

export default ConfirmationScreen;
