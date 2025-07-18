import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SelectJointTypeScreen from './screens/SelectJointTypeScreen';
import SelectDateScreen from './screens/SelectDateScreen';
import SelectTimeSlotScreen from './screens/SelectTimeSlotScreen';
import ConfirmationScreen from './screens/ConfirmationScreen';
import MyBookingsScreen from './screens/MyBookingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import RegisterScreen from './screens/RegisterScreen';

import { useColorScheme } from '@/hooks/useColorScheme';

const Stack = createNativeStackNavigator();

export default function Layout() {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'تسجيل الدخول' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'الرئيسية' }} />
      <Stack.Screen name="SelectJointType" component={SelectJointTypeScreen} options={{ title: 'اختيار نوع المفصل' }} />
      <Stack.Screen name="SelectDate" component={SelectDateScreen} options={{ title: 'اختيار التاريخ' }} />
      <Stack.Screen name="SelectTimeSlot" component={SelectTimeSlotScreen} options={{ title: 'اختيار الميعاد' }} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ title: 'تأكيد الحجز' }} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'حجوزاتي' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'الإشعارات' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'تسجيل حساب جديد' }} />
    </Stack.Navigator>
  );
}
