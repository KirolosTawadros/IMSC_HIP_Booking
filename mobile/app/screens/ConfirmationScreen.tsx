import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { createBooking } from '../../services/api';
import { t } from '../../i18n';
import NotificationService from '../../services/notifications';

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
  timeSlot: string;
  timeSlotId: string;
};

const ConfirmationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { jointType, jointTypeId, date, timeSlot, timeSlotId } = (route.params as RouteParams) || { jointType: '', jointTypeId: '', date: '', timeSlot: '', timeSlotId: '' };
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!global.currentUser) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      return;
    }
    // حماية: تأكد من اختيار فترة زمنية صحيحة
    if (!timeSlotId || timeSlotId === '0') {
      Alert.alert('خطأ', 'يرجى اختيار فترة زمنية صحيحة قبل تأكيد الحجز');
      return;
    }
    setLoading(true);
    try {
      await createBooking(global.currentUser._id, jointTypeId, date, timeSlotId);
      
      // إرسال إشعار محلي عند نجاح الحجز
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

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.card}>
          <MaterialCommunityIcons name="check-circle" size={SIZES.icon + 16} color={COLORS.success} style={{ marginBottom: 16 }} />
          <Text style={styles.title}>{t('confirmation')}</Text>
          <Text style={styles.label}>{t('jointType')}: <Text style={styles.value}>{jointType}</Text></Text>
          <Text style={styles.label}>{t('date')}: <Text style={styles.value}>{date}</Text></Text>
          <Text style={styles.label}>{t('timeSlot')}: <Text style={styles.value}>{timeSlot}</Text></Text>
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleConfirm} 
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-bold" size={SIZES.icon} color="#fff" style={{ marginEnd: 8 }} />
                <Text style={styles.buttonText}>{t('confirmBooking')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 32,
    width: '100%',
    maxWidth: 370,
    ...SHADOW,
    alignItems: 'center',
  },
  title: { fontSize: SIZES.title, fontWeight: 'bold', color: COLORS.primary, marginBottom: 18 },
  label: { fontSize: SIZES.text, marginBottom: 8 },
  value: { fontWeight: 'bold', color: COLORS.primary },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 24,
    width: '100%',
    justifyContent: 'center',
    ...SHADOW,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: '#fff', fontSize: SIZES.button, fontWeight: 'bold' },
});

export default ConfirmationScreen;
