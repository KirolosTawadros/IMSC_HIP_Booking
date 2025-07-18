import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { t } from '../../i18n';
import i18n from '../../i18n';

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

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // اسم الدكتور من البيانات المحفوظة
  const doctorName = global.currentUser?.name || 'د. أحمد';
  const doctorGovernorate = global.currentUser?.governorate || '';

  const handleNewBooking = () => {
    if (!global.currentUser?._id) {
      Alert.alert('خطأ', t('please_login_first'));
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('SelectJointType');
  };

  const handleMyBookings = () => {
    if (!global.currentUser?._id) {
      Alert.alert('خطأ', t('please_login_first'));
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('MyBookings');
  };

  const handleNotifications = () => {
    if (!global.currentUser?._id) {
      Alert.alert('خطأ', t('please_login_first'));
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Notifications');
  };

  const handleLogout = () => {
    global.currentUser = null;
    navigation.navigate('Login');
  };

  const [_, forceUpdate] = React.useReducer(x => x + 1, 0);

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.branding}>
          <MaterialCommunityIcons name="hospital-building" size={40} color={COLORS.primary} style={{ marginBottom: 4 }} />
          <Text style={styles.brandingTitle}>IMSC</Text>
          <Text style={styles.brandingSubtitle}>المركز الدولي للخدمات الطبية</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => { i18n.locale = 'ar'; forceUpdate(); }} style={{ marginHorizontal: 8 }}>
            <Text style={{ color: i18n.locale === 'ar' ? '#1976d2' : '#888', fontWeight: 'bold' }}>{t('arabic')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { i18n.locale = 'en'; forceUpdate(); }} style={{ marginHorizontal: 8 }}>
            <Text style={{ color: i18n.locale === 'en' ? '#1976d2' : '#888', fontWeight: 'bold' }}>{t('english')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.welcome}>مرحباً 👋</Text>
          <Text style={styles.doctor}>{doctorName}</Text>
          {doctorGovernorate && (
            <Text style={styles.governorate}>من {doctorGovernorate}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNewBooking} activeOpacity={0.85}>
          <MaterialCommunityIcons name="plus-circle" size={SIZES.icon + 8} color="#fff" style={{ marginEnd: 8 }} />
          <Text style={styles.buttonText}>احجز عملية جديدة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryBtn]} onPress={handleMyBookings} activeOpacity={0.85}>
          <MaterialCommunityIcons name="calendar-check" size={SIZES.icon} color={COLORS.primary} style={{ marginEnd: 8 }} />
          <Text style={[styles.buttonText, { color: COLORS.primary }]}>حجوزاتي</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.notificationsBtn]} onPress={handleNotifications} activeOpacity={0.85}>
          <MaterialCommunityIcons name="bell" size={SIZES.icon} color="#fff" style={{ marginEnd: 8 }} />
          <Text style={styles.buttonText}>الإشعارات</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.logoutBtn]} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialCommunityIcons name="logout" size={SIZES.icon} color="#fff" style={{ marginEnd: 8 }} />
          <Text style={styles.buttonText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  branding: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  brandingSubtitle: {
    fontSize: 16,
    color: COLORS.muted,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 28,
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 370,
    ...SHADOW,
  },
  welcome: { fontSize: SIZES.subtitle, color: COLORS.muted, marginBottom: 6 },
  doctor: { fontSize: SIZES.title + 4, fontWeight: 'bold', color: COLORS.primary },
  governorate: {
    fontSize: SIZES.text,
    color: COLORS.muted,
    marginTop: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 18,
    width: '100%',
    maxWidth: 370,
    justifyContent: 'center',
    ...SHADOW,
  },
  buttonText: { color: '#fff', fontSize: SIZES.button, fontWeight: 'bold' },
  secondaryBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 0,
  },
  notificationsBtn: {
    backgroundColor: COLORS.info,
    marginBottom: 0,
  },
  logoutBtn: {
    backgroundColor: COLORS.danger,
    marginTop: 10,
  },
});

export default HomeScreen;
