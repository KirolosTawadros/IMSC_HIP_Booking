import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { loginUser } from '../../services/api';
import DropDownPicker from 'react-native-dropdown-picker';
import { getHospitals } from '../../services/api';
import { t } from '../../i18n';
import i18n from '../../i18n';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SelectJointType: undefined;
  SelectDate: undefined;
  SelectTimeSlot: undefined;
  Confirmation: undefined;
  MyBookings: undefined;
  Register: undefined;
};

declare global {
  var currentUser: any;
}

const GOVERNORATES = [
  'القاهرة الكبرى',
  'أسيوط',
  'سوهاج',
  'طنطا',
  'المنصورة'
];

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [phone, setPhone] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [hospitalItems, setHospitalItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [_, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await getHospitals();
      setHospitals(response.data);
      setHospitalItems(response.data.map((h: any) => ({ label: h.name, value: h._id })));
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل قائمة المستشفيات');
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleLogin = async () => {
    if (!phone || !hospitalId) {
      Alert.alert('خطأ', 'يرجى إدخال جميع البيانات المطلوبة');
      return;
    }
    setLoading(true);
    try {
      const response = await loginUser(phone, hospitalId);
      if (response.data.success) {
        global.currentUser = response.data.data;
        Alert.alert('تم تسجيل الدخول بنجاح', response.data.message);
        navigation.replace('Home');
      } else {
        Alert.alert('خطأ في تسجيل الدخول', response.data.message || 'بيانات غير صحيحة');
      }
    } catch (error: any) {
      Alert.alert('خطأ في تسجيل الدخول', error.response?.data?.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons 
                name="hospital-building" 
                size={40} 
                color={COLORS.white} 
              />
            </View>
            <Text style={styles.brandTitle}>IMSC</Text>
            <Text style={styles.brandSubtitle}>المركز الدولي للخدمات الطبية</Text>
            <Text style={styles.brandDescription}>تسجيل دخول الأطباء</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>{t('login')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('phone_placeholder')}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor={COLORS.muted}
              editable={!loading}
            />
            <Text style={styles.label}>{t('hospital')}</Text>
            <DropDownPicker
              open={open}
              value={hospitalId}
              items={hospitalItems}
              setOpen={setOpen}
              setValue={setHospitalId}
              setItems={setHospitalItems}
              placeholder={t('select_hospital')}
              loading={loadingHospitals}
              disabled={loadingHospitals || loading}
              style={{ marginBottom: 16, borderColor: COLORS.border, backgroundColor: '#f7fafd', zIndex: 1000 }}
              dropDownDirection="AUTO"
              listMode="SCROLLVIEW"
              zIndex={1000}
              zIndexInverse={1000}
              rtl={true}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => { i18n.locale = 'ar'; forceUpdate(); }} style={{ marginHorizontal: 8 }}>
                <Text style={{ color: i18n.locale === 'ar' ? '#1976d2' : '#888', fontWeight: 'bold' }}>{t('arabic')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { i18n.locale = 'en'; forceUpdate(); }} style={{ marginHorizontal: 8 }}>
                <Text style={{ color: i18n.locale === 'en' ? '#1976d2' : '#888', fontWeight: 'bold' }}>{t('english')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin} 
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="login" size={SIZES.icon} color="#fff" style={{ marginEnd: 8 }} />
                  <Text style={styles.buttonText}>{t('login_button')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ marginTop: 24, alignSelf: 'center' }}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>
              {t('register')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  brandDescription: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 28,
    width: '100%',
    maxWidth: 370,
    ...SHADOW,
    alignItems: 'center',
  },
  title: { fontSize: SIZES.title + 2, fontWeight: 'bold', color: COLORS.primary, marginBottom: 24 },
  input: {
    width: '100%',
    height: 48,
    borderColor: COLORS.border,
    borderWidth: 1.2,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: SIZES.text,
    backgroundColor: '#f7fafd',
    color: COLORS.text,
  },
  label: {
    fontSize: SIZES.text,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: SIZES.text,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 48,
    borderColor: COLORS.border,
    borderWidth: 1.2,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    backgroundColor: '#f7fafd',
  },
  pickerText: {
    fontSize: SIZES.text,
    color: COLORS.text,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 12,
    width: '100%',
    justifyContent: 'center',
    ...SHADOW,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: '#fff', fontSize: SIZES.button, fontWeight: 'bold' },
});

export default LoginScreen;
