import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { getJointTypeSlotsWithStatus } from '../../services/api';
import { t } from '../../i18n';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SelectJointType: undefined;
  SelectDate: { jointType: string; jointTypeId: string } | undefined;
  SelectTimeSlot: { jointType: string; jointTypeId: string; date: string } | undefined;
  Confirmation: { jointType: string; jointTypeId: string; date: string; timeSlot: string; timeSlotId: string } | undefined;
  MyBookings: undefined;
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
  status: string; // Added status field
};

const SelectTimeSlotScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { jointType, jointTypeId, date } = (route.params as RouteParams) || { jointType: '', jointTypeId: '', date: '' };
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  const loadAvailableSlots = async () => {
    try {
      if (!global.currentUser?._id) {
        Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
        navigation.navigate('Login');
        return;
      }
      const response = await getJointTypeSlotsWithStatus(jointTypeId, global.currentUser.governorate, date);
      const now = new Date();
      setTimeSlots(response.data.map((slot: any) => {
        // بناء تاريخ/وقت البداية والنهاية للفترة
        const slotDate = date; // المتغير date هو تاريخ اليوم المختار
        const slotStart = new Date(`${slotDate}T${slot.start_time}:00`);
        const slotEnd = new Date(`${slotDate}T${slot.end_time}:00`);

        // لو التاريخ هو اليوم الحالي، والوقت الحالي بعد نهاية الفترة، اجعلها مغلقة
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
          status
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
        <Text style={styles.title}>{t('select_time_slot')}</Text>
        <Text style={styles.subtitle}>{jointType} - {date}</Text>
        <Text style={styles.subtitle}>{t('governorate')}: {global.currentUser?.governorate}</Text>
        
        <FlatList
          data={timeSlots}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, (item.available === 0 || item.status === 'closed') && styles.full]}
              onPress={() => item.available > 0 && handleSelect(item)}
              disabled={item.available === 0 || item.status === 'closed'}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="clock-outline" size={SIZES.icon + 4} color={(item.available === 0 || item.status === 'closed') ? COLORS.muted : COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={[styles.cardText, (item.available === 0 || item.status === 'closed') && { color: COLORS.muted }]}> 
                {item.start_time} - {item.end_time}
              </Text>
              <Text style={[styles.availabilityText, (item.available === 0 || item.status === 'closed') && { color: COLORS.muted }]}> 
                {item.status === 'closed' ? t('closed') : (item.available === 0 ? t('full') : `${item.available} ${t('remaining_places')} ${t('from')} ${item.capacity}`)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="clock-alert" 
                size={64} 
                color={COLORS.muted} 
              />
              <Text style={styles.emptyText}>{t('no_available_slots')}</Text>
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
  title: { 
    fontSize: SIZES.title, 
    fontWeight: 'bold', 
    color: COLORS.card, 
    marginBottom: 16, 
    alignSelf: 'center', 
    textShadowColor: COLORS.shadow, 
    textShadowOffset: { width: 0, height: 2 }, 
    textShadowRadius: 8 
  },
  subtitle: { 
    fontSize: SIZES.text, 
    color: COLORS.card, 
    marginBottom: 8, 
    alignSelf: 'center',
    textShadowColor: COLORS.shadow, 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 4 
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 32,
    marginBottom: 18,
    alignItems: 'center',
    ...SHADOW,
  },
  full: {
    backgroundColor: '#eee',
  },
  cardText: { 
    fontSize: SIZES.subtitle, 
    fontWeight: 'bold', 
    color: COLORS.primary,
    marginBottom: 4
  },
  availabilityText: { 
    fontSize: SIZES.text, 
    color: COLORS.muted,
    textAlign: 'center'
  },
  loadingText: { color: COLORS.card, fontSize: SIZES.text, marginTop: 16 },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: { 
    color: COLORS.card, 
    fontSize: SIZES.text, 
    marginTop: 16,
    textAlign: 'center'
  },
});

export default SelectTimeSlotScreen;
