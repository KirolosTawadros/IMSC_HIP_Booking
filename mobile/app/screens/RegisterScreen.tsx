import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, I18nManager, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../constants/Colors';
import { SIZES } from '../../constants/theme';
import { registerUser, getHospitals, loginUser } from '../../services/api';
import { saveUser } from '../../services/auth';
import DropDownPicker from 'react-native-dropdown-picker';
import { t } from '../../i18n';

I18nManager.forceRTL(true);

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

declare global {
  var currentUser: any;
}

const RegisterScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [open, setOpen] = useState(false);
  const [hospitalItems, setHospitalItems] = useState<any[]>([]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoadingHospitals(true);
      const response = await getHospitals();
      setHospitals(response.data);
      setHospitalItems(response.data.map((h: any) => ({ label: h.name, value: h._id })));
    } catch (error) {
      // يمكن إضافة Alert هنا إذا رغبت
    } finally {
      setLoadingHospitals(false);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      const selected = hospitals.find(h => h._id === hospitalId);
      setGovernorate(selected ? selected.governorate : '');
    } else {
      setGovernorate('');
    }
  }, [hospitalId, hospitals]);

  const handleRegister = async () => {
    if (!name || !phone || !hospitalId) {
      alert('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser(name, phone, hospitalId, governorate);
      if (response.data.success) {
        // Auto login after successful registration
        const loginResponse = await loginUser(phone, hospitalId);
        await saveUser(loginResponse.data);
        alert(response.data.message);
        navigation.replace('Home');
      } else {
        alert(response.data.message || 'حدث خطأ ما');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="hospital-building" size={56} color={COLORS.textInverse} style={{ alignSelf: 'center' }} />
            <Text style={styles.brandTitle}>IMSC</Text>
            <Text style={styles.brandSubtitle}>المركز الدولي للخدمات الطبية</Text>
          </View>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{t('register')}</Text>
            <Text style={styles.label}>{t('doctorName')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterDoctorName')}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#aaa"
              editable={!loading}
              textAlign="right"
            />
            <Text style={styles.label}>{t('phoneNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterPhoneNumber')}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#aaa"
              editable={!loading}
              textAlign="right"
            />
            <Text style={styles.label}>{t('hospital')}</Text>
            <DropDownPicker
              open={open}
              value={hospitalId}
              items={hospitalItems}
              setOpen={setOpen}
              setValue={setHospitalId}
              setItems={setHospitalItems}
              placeholder={t('selectHospital')}
              loading={loadingHospitals}
              disabled={loadingHospitals || loading}
              style={styles.dropdown}
              dropDownDirection="AUTO"
              listMode="SCROLLVIEW"
              onChangeValue={(val) => {
                setHospitalId(val || '');
                const selected = hospitals.find(h => h._id === val);
                setGovernorate(selected ? selected.governorate : '');
              }}
              zIndex={1000}
              zIndexInverse={1000}
              rtl={true}
            />
            <Text style={styles.label}>{t('governorate')}</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>{governorate || '---'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-plus" size={24} color="#fff" style={{ marginLeft: 8 }} />
                  <Text style={styles.buttonText}>{t('register')}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 18, alignSelf: 'center' }}
              onPress={() => navigation.replace('Login')}
            >
              <Text style={styles.loginLink}>{t('haveAccount')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 18 },
  brandTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  brandSubtitle: { fontSize: 15, color: '#e3e3e3', marginTop: 2 },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 3 } }), marginBottom: 16 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 18, textAlign: 'center' },
  label: { fontSize: 15, color: '#333', marginBottom: 6, textAlign: 'right', fontWeight: '500' },
  input: { backgroundColor: '#f7f7f7', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 15, textAlign: 'right' },
  pickerWrapper: { backgroundColor: '#f7f7f7', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 14, overflow: 'hidden' },
  picker: { height: 44, width: '100%', color: '#333', textAlign: 'right' },
  disabledInput: { backgroundColor: '#f0f0f0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e0e0e0', justifyContent: 'center' },
  disabledInputText: { color: '#888', fontSize: 15, textAlign: 'right' },
  button: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginLink: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  pickerWrapperFixed: { backgroundColor: '#f7f7f7', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 14, minHeight: 56, justifyContent: 'center' },
  pickerFixed: { height: 56, width: '100%', color: '#333', textAlign: 'right', backgroundColor: 'transparent' },
  dropdown: { marginBottom: 14, borderColor: '#e0e0e0', backgroundColor: '#f7f7f7', zIndex: 1000 },
});

export default RegisterScreen; 