import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { SIZES } from '../../constants/theme';
import { t } from '../../i18n';
import { getUser } from '../../services/auth';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SelectJointType: undefined;
  SelectDate: undefined;
  SelectTimeSlot: undefined;
  Confirmation: undefined;
  MyBookings: undefined;
};

const SplashScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
    
    const checkUserAndNavigate = async () => {
      try {
        const user = await getUser();
        setTimeout(() => {
          if (user) {
            navigation.replace('Home');
          } else {
            navigation.replace('Login');
          }
        }, 2000);
      } catch (error) {
        console.error('Error checking user:', error);
        setTimeout(() => {
          navigation.replace('Login');
        }, 2000);
      }
    };
    
    checkUserAndNavigate();
  }, [navigation]);

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }] }>
        <MaterialCommunityIcons name="hospital-building" size={80} color="#fff" style={{ marginBottom: 24 }} />
        <Text style={styles.title}>HIP Booking</Text>
        <Text style={styles.subtitle}>{t('welcome')}</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#e3e8f0', letterSpacing: 1 },
});

export default SplashScreen;
