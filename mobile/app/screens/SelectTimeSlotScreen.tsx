import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { getJointTypeSlotsWithStatus } from '../../services/api';
import { getUser } from '../../services/auth';
import { t } from '../../i18n';
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
};

type TimeSlot = {
  id: string;
  start_time: string;
  end_time: string;
  available: number;
  capacity: number;
  status: string;
};

const SelectTimeSlotScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { jointType, jointTypeId, date } = (route.params as RouteParams) || { jointType: '', jointTypeId: '', date: '' };
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('🔍 Fetching user for SelectTimeSlot...');
      const u = await getUser();
      console.log('👤 User for SelectTimeSlot:', u);
      setUser(u);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.data?._id) {
      console.log('✅ User authenticated, loading time slots');
      loadAvailableSlots();
    }
  }, [user]);

  const loadAvailableSlots = async () => {
    try {
      if (!user?.data?._id) {
        console.log('❌ No user ID found in loadAvailableSlots');
        Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
        navigation.navigate('Login');
        return;
      }
      console.log('🔍 Loading time slots for user:', user.data._id);
      const response = await getJointTypeSlotsWithStatus(jointTypeId, user.data.governorate, date);
      const now = new Date();
      setTimeSlots(response.data.map((slot: any) => {
        const slotDate = date;
        const slotStart = new Date(`${slotDate}T${slot.start_time}:00`);
        const slotEnd = new Date(`${slotDate}T${slot.end_time}:00`);

        let status = slot.status;
        if (slotDate === now.toISOString().split('T')[0] && now > slotEnd) {
          status = 'closed';
        }

        return {
          id: slot._id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          available: status === 'open' ? slot.remaining : 0,
          capacity: slot.capacity,
          status: status,
        };
      }));
      console.log('DEBUG: timeSlots', response.data);
    } catch (error: any) {
      console.error('Error loading slots:', error);
      Alert.alert('خطأ', 'فشل في تحميل المواعيد المتاحة: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (timeSlot: TimeSlot) => {
    navigation.navigate('Confirmation', { 
      jointType, 
      jointTypeId, 
      date, 
      timeSlot: `${timeSlot.start_time} - ${timeSlot.end_time}`,
      timeSlotId: timeSlot.id
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return COLORS.success;
      case 'closed': return COLORS.error;
      case 'full': return COLORS.warning;
      default: return COLORS.textTertiary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return t('available');
      case 'closed': return t('closed');
      case 'full': return t('full');
      default: return t('unknown');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return 'check-circle';
      case 'closed': return 'close-circle';
      case 'full': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const renderTimeSlot = ({ item }: { item: TimeSlot }) => (
    <Card style={styles.timeSlotCard} elevation={2}>
      <TouchableOpacity 
        onPress={() => handleSelect(item)}
        disabled={item.status !== 'open'}
        style={[
          styles.timeSlotItem,
          item.status !== 'open' && styles.timeSlotDisabled
        ]}
      >
        <View style={styles.timeSlotHeader}>
          <View style={styles.timeInfo}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={24} 
              color={COLORS.primary} 
            />
            <Text style={styles.timeText}>
              {formatTime(item.start_time)} - {formatTime(item.end_time)}
            </Text>
          </View>
          <Chip 
            icon={getStatusIcon(item.status) as any}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusChipText}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.timeSlotDetails}>
          <View style={styles.capacityInfo}>
            <MaterialCommunityIcons 
              name="account-group" 
              size={20} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.capacityText}>
              {t('capacity')}: {item.available}/{item.capacity}
            </Text>
          </View>
          
          {item.status === 'open' && (
            <Button
              mode="contained"
              onPress={() => handleSelect(item)}
              style={styles.selectButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {t('select')}
            </Button>
          )}
        </View>
      </TouchableOpacity>
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
      <View style={styles.header}>
        <Surface style={styles.headerCard} elevation={4}>
          <View style={styles.headerContent}>
            <View style={styles.bookingInfo}>
              <MaterialCommunityIcons 
                name="bone" 
                size={32} 
                color={COLORS.primary} 
              />
              <View style={styles.bookingText}>
                <Text style={styles.jointTypeName}>{jointType}</Text>
                <Text style={styles.dateText}>{date}</Text>
                <Chip 
                  icon="clock" 
                  style={styles.timeChip}
                  textStyle={styles.timeChipText}
                >
                  {t('select_time_slot')}
                </Chip>
              </View>
            </View>
          </View>
        </Surface>
      </View>

      <FlatList
        data={timeSlots}
        renderItem={renderTimeSlot}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadAvailableSlots}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <Surface style={styles.emptyCard} elevation={2}>
                         <MaterialCommunityIcons 
               name="clock-alert" 
               size={48} 
               color={COLORS.textSecondary} 
             />
            <Text style={styles.emptyTitle}>{t('no_time_slots_available')}</Text>
            <Text style={styles.emptySubtitle}>{t('try_different_date')}</Text>
          </Surface>
        }
      />
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
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    ...SHADOW.light.large,
  },
  headerContent: {
    padding: SIZES.spacing.lg,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingText: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  jointTypeName: {
    fontSize: SIZES.xl,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  dateText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  timeChip: {
    backgroundColor: COLORS.backgroundSecondary,
    alignSelf: 'flex-start',
  },
  timeChipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  listContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
  },
  timeSlotCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOW.light.medium,
  },
  timeSlotItem: {
    padding: SIZES.spacing.lg,
  },
  timeSlotDisabled: {
    opacity: 0.6,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginLeft: SIZES.spacing.sm,
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
  timeSlotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SIZES.spacing.xs,
  },
  selectButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.sm,
    ...SHADOW.light.small,
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
});

export default SelectTimeSlotScreen;
