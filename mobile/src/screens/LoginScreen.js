import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes } from '../theme';
import { loginUser } from '../services/api';

const GOVERNORATES = [
  'القاهرة الكبرى',
  'أسيوط',
  'سوهاج',
  'طنطا',
  'المنصورة'
];

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || !governorate) {
      Alert.alert('خطأ', 'يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(email, password);
      if (response.data.success) {
        // Save user data globally
        global.currentUser = response.data.data;
        Alert.alert('تم تسجيل الدخول بنجاح', response.data.message);
        navigation.replace('Home');
      } else {
        Alert.alert('خطأ في تسجيل الدخول', response.data.message || 'بيانات غير صحيحة');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons 
                name="hospital-building" 
                size={40} 
                color={colors.white} 
              />
            </View>
            <Text style={styles.title}>IMSC</Text>
            <Text style={styles.subtitle}>المركز الدولي للخدمات الطبية</Text>
            <Text style={styles.description}>تسجيل دخول الأطباء</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons 
                name="phone" 
                size={24} 
                color={colors.gray} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="رقم الموبايل"
                placeholderTextColor={colors.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons 
                name="hospital-building" 
                size={24} 
                color={colors.gray} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="اسم المستشفى"
                placeholderTextColor={colors.gray}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={24} 
                color={colors.gray} 
                style={styles.inputIcon}
              />
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {governorate || 'اختر المحافظة'}
                </Text>
                <MaterialCommunityIcons 
                  name="chevron-down" 
                  size={20} 
                  color={colors.gray} 
                />
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  Alert.alert(
                    'اختر المحافظة',
                    '',
                    GOVERNORATES.map(gov => ({
                      text: gov,
                      onPress: () => setGovernorate(gov)
                    }))
                  );
                }}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.accent, colors.accentDark]}
                style={styles.gradientButton}
              >
                {loading ? (
                  <MaterialCommunityIcons name="loading" size={24} color={colors.white} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="login" size={24} color={colors.white} />
                    <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                تطبيق حجز العمليات الجراحية للأطباء
              </Text>
              <Text style={styles.infoText}>
                International Medical Services Center
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: sizes.padding,
  },
  header: {
    alignItems: 'center',
    marginBottom: sizes.margin * 3,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sizes.margin,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: sizes.margin / 2,
  },
  subtitle: {
    fontSize: 18,
    color: colors.white,
    marginBottom: sizes.margin / 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: sizes.borderRadius * 2,
    padding: sizes.padding * 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: sizes.borderRadius,
    marginBottom: sizes.margin,
    paddingHorizontal: sizes.padding,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  inputIcon: {
    marginRight: sizes.margin,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.text,
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  pickerButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loginButton: {
    marginTop: sizes.margin,
    borderRadius: sizes.borderRadius,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.padding,
    paddingHorizontal: sizes.padding * 2,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: sizes.margin,
  },
  infoContainer: {
    marginTop: sizes.margin * 2,
    alignItems: 'center',
  },
  infoText: {
    color: colors.gray,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: sizes.margin / 2,
  },
});

export default LoginScreen; 