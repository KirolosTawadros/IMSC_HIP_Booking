import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  ActivityIndicator, 
  ScrollView, 
  Keyboard, 
  TouchableWithoutFeedback, 
  Dimensions, 
  SafeAreaView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { loginUser } from '../../services/api';
import { saveUser } from '../../services/auth';
import DropDownPicker from 'react-native-dropdown-picker';
import { getHospitals } from '../../services/api';
import { t } from '../../i18n';
import i18n from '../../i18n';
import { TextInput, Button, Card, Surface } from 'react-native-paper';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SelectJointType: undefined;
  SelectDate: { jointType: string; jointTypeId: string } | undefined;
  SelectTimeSlot: { jointType: string; jointTypeId: string; date: string } | undefined;
  Confirmation: { jointType: string; jointTypeId: string; date: string; timeSlot: string; timeSlotId: string } | undefined;
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

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [phone, setPhone] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [hospitalItems, setHospitalItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [hospitalError, setHospitalError] = useState('');

  React.useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    setLoadingHospitals(true);
    try {
      const response = await getHospitals();
      const hospitalOptions = response.data.map((hospital: any) => ({
        label: hospital.name,
        value: hospital._id,
      }));
      setHospitals(response.data);
      setHospitalItems(hospitalOptions);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (phoneError) setPhoneError('');
  };

  const handleHospitalChange = (value: string) => {
    setHospitalId(value);
    if (hospitalError) setHospitalError('');
  };

  const handleLogin = async () => {
    // Validation
    let hasError = false;
    
    if (!phone.trim()) {
      setPhoneError('يرجى إدخال رقم الهاتف');
      hasError = true;
    } else if (!validatePhone(phone.trim())) {
      setPhoneError('يرجى إدخال رقم هاتف صحيح');
      hasError = true;
    }
    
    if (!hospitalId) {
      setHospitalError('يرجى اختيار المستشفى');
      hasError = true;
    }
    
    if (hasError) return;

    setLoading(true);
    try {
      console.log('🔐 Attempting login...');
      const response = await loginUser(phone.trim(), hospitalId);
      console.log('✅ Login successful:', response.data);
      await saveUser(response.data);
      console.log('💾 User saved to storage');
      navigation.replace('Home');
    } catch (error: any) {
      console.log('❌ Login failed:', error);
      Alert.alert('خطأ', error.response?.data?.message || 'فشل في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={[COLORS.gradientStart, COLORS.gradientEnd]} 
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View style={styles.header}>
                <Surface style={styles.logoContainer} elevation={4}>
                  <MaterialCommunityIcons 
                    name="hospital-building" 
                    size={SIZES.icon.xxl} 
                    color={COLORS.primary} 
                  />
                </Surface>
                <Text style={styles.title}>HIP Booking</Text>
                <Text style={styles.subtitle}>{t('welcome_message')}</Text>
              </View>

              {/* Login Form */}
              <Card style={styles.formCard} elevation={4}>
                <Card.Content style={styles.formContent}>
                  <Text style={styles.formTitle}>{t('login')}</Text>
                  
                  {/* Phone Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      mode="outlined"
                      label={t('phone_number')}
                      value={phone}
                      onChangeText={handlePhoneChange}
                      keyboardType="phone-pad"
                      style={styles.input}
                      outlineColor={phoneError ? COLORS.error : COLORS.inputBorder}
                      activeOutlineColor={COLORS.primary}
                      left={<TextInput.Icon icon="phone" />}
                      error={!!phoneError}
                    />
                    {phoneError ? (
                      <Text style={styles.errorText}>{phoneError}</Text>
                    ) : null}
                  </View>

                  {/* Hospital Dropdown */}
                  <View style={styles.inputContainer}>
                    <DropDownPicker
                      open={open}
                      value={hospitalId}
                      items={hospitalItems}
                      setOpen={setOpen}
                      setValue={(callback) => {
                        const value = callback(hospitalId);
                        handleHospitalChange(value);
                      }}
                      setItems={setHospitalItems}
                      placeholder={t('select_hospital')}
                      loading={loadingHospitals}
                      style={[
                        styles.dropdown,
                        hospitalError ? styles.dropdownError : null
                      ]}
                      dropDownContainerStyle={styles.dropdownContainer}
                      textStyle={styles.dropdownText}
                      placeholderStyle={styles.dropdownPlaceholder}
                      listMode="SCROLLVIEW"
                      scrollViewProps={{
                        nestedScrollEnabled: true,
                      }}
                      zIndex={1000}
                      zIndexInverse={1000}
                    />
                    {hospitalError ? (
                      <Text style={styles.errorText}>{hospitalError}</Text>
                    ) : null}
                  </View>

                  {/* Login Button */}
                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.loginButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    {loading ? t('logging_in') : t('login')}
                  </Button>

                  {/* Register Link */}
                  <TouchableOpacity 
                    onPress={handleRegister}
                    style={styles.registerContainer}
                  >
                    <Text style={styles.registerText}>
                      {t('dont_have_account')}{' '}
                      <Text style={styles.registerLink}>{t('register')}</Text>
                    </Text>
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xxl,
    marginTop: SIZES.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius.round,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.largeTitle,
    fontWeight: '700' as const,
    color: COLORS.textInverse,
    marginBottom: SIZES.spacing.sm,
  },
  subtitle: {
    fontSize: SIZES.lg,
    color: COLORS.textInverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    ...SHADOW.light.large,
  },
  formContent: {
    padding: SIZES.spacing.lg,
  },
  formTitle: {
    fontSize: SIZES.title,
    fontWeight: '700' as const,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  inputContainer: {
    marginBottom: SIZES.spacing.md,
  },
  input: {
    backgroundColor: COLORS.input,
    fontSize: SIZES.md,
  },
  dropdown: {
    backgroundColor: COLORS.input,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.radius.sm,
    minHeight: SIZES.input.md,
  } as any,
  dropdownError: {
    borderColor: COLORS.error,
  } as any,
  dropdownContainer: {
    backgroundColor: COLORS.input,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: SIZES.radius.sm,
    maxHeight: 200,
  } as any,
  dropdownText: {
    fontSize: SIZES.md,
    color: COLORS.text,
  } as any,
  dropdownPlaceholder: {
    color: COLORS.textSecondary,
  } as any,
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.sm,
    marginTop: SIZES.spacing.xs,
    marginLeft: SIZES.spacing.sm,
  } as any,
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.spacing.lg,
    ...SHADOW.light.medium,
  } as any,
  buttonContent: {
    height: SIZES.button.lg,
  } as any,
  buttonLabel: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
  } as any,
  registerContainer: {
    marginTop: SIZES.spacing.lg,
    alignItems: 'center',
  } as any,
  registerText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  } as any,
  registerLink: {
    color: COLORS.primary,
    fontWeight: '600' as const,
  } as any,
});

export default LoginScreen;
