import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { t } from '../../i18n';
import NotificationService from '../../services/notifications';
import { getUserNotifications } from '../../services/api';
import { removeUser, getCurrentUser, getCurrentUserSync } from '../../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button, Surface, Chip, Avatar } from 'react-native-paper';

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
  Register: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const doctorName = getCurrentUserSync()?.name || 'د. أحمد';
  const doctorGovernorate = getCurrentUserSync()?.governorate || '';

  // Request notification permissions when component mounts
  React.useEffect(() => {
    const setupNotifications = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser?._id) {
        try {
          const hasPermission = await NotificationService.requestPermissions();
          if (hasPermission) {
            const pushToken = await NotificationService.getPushToken();
            if (pushToken) {
              console.log('Push token saved for user:', currentUser._id);
            }
          }
        } catch (error) {
          console.error('Error setting up notifications:', error);
        }
      }
    };

    setupNotifications();
  }, []);

  // Check for new notifications periodically
  React.useEffect(() => {
    const LAST_NOTIFICATION_KEY = 'lastNotificationId';
    const checkNotifications = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser?._id) return;
      
      try {
        const response = await getUserNotifications(currentUser._id);
        const unreadNotifications = response.data.filter((n: any) => !n.read);
        
        if (unreadNotifications.length > 0) {
          const latestNotification = unreadNotifications[0];
          const lastId = await AsyncStorage.getItem(LAST_NOTIFICATION_KEY);

          if (latestNotification._id !== lastId) {
            await NotificationService.sendLocalNotification(
              latestNotification.title,
              latestNotification.message,
              {
                screen: 'Notifications',
                notificationId: latestNotification._id,
                type: latestNotification.type,
              }
            );
            await AsyncStorage.setItem(LAST_NOTIFICATION_KEY, latestNotification._id);
          }
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logout_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await removeUser();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleNewBooking = () => {
    const currentUser = getCurrentUserSync();
    if (!currentUser?._id) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('SelectJointType');
  };

  const handleMyBookings = () => {
    const currentUser = getCurrentUserSync();
    if (!currentUser?._id) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('MyBookings');
  };

  const handleNotifications = () => {
    const currentUser = getCurrentUserSync();
    if (!currentUser?._id) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Notifications');
  };

  const currentUser = getCurrentUserSync();
  if (!currentUser) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
                         <View style={styles.logoContainer}>
               <MaterialCommunityIcons name="hospital-building" size={80} color={COLORS.textInverse} />
               <Text style={styles.brandTitle}>IMSC</Text>
               <Text style={styles.brandSubtitle}>المركز الدولي للخدمات الطبية</Text>
             </View>
            <Card style={styles.welcomeCard} elevation={4}>
              <Card.Content style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>{t('welcome_to_imsc')}</Text>
                <Text style={styles.welcomeText}>{t('welcome_message')}</Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonText}
                >
                  {t('login')}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Register')}
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonText}
                >
                  {t('register')}
                </Button>
              </Card.Content>
            </Card>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Surface style={styles.headerCard} elevation={4}>
              <View style={styles.headerContent}>
                <View style={styles.userInfo}>
                  <Avatar.Icon size={50} icon="account" style={styles.avatar} />
                  <View style={styles.userText}>
                    <Text style={styles.welcomeText}>{t('welcome')}</Text>
                    <Text style={styles.doctorName}>{doctorName}</Text>
                    <Chip icon="map-marker" style={styles.locationChip}>
                      {doctorGovernorate}
                    </Chip>
                  </View>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <MaterialCommunityIcons name="logout" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </Surface>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionCard} onPress={handleNewBooking}>
                <Surface style={styles.actionSurface} elevation={3}>
                  <MaterialCommunityIcons name="calendar-plus" size={40} color={COLORS.primary} />
                  <Text style={styles.actionTitle}>{t('new_booking')}</Text>
                  <Text style={styles.actionSubtitle}>{t('book_appointment')}</Text>
                </Surface>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={handleMyBookings}>
                <Surface style={styles.actionSurface} elevation={3}>
                  <MaterialCommunityIcons name="calendar-check" size={40} color={COLORS.success} />
                  <Text style={styles.actionTitle}>{t('my_bookings')}</Text>
                  <Text style={styles.actionSubtitle}>{t('view_bookings')}</Text>
                </Surface>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={handleNotifications}>
                <Surface style={styles.actionSurface} elevation={3}>
                  <MaterialCommunityIcons name="bell" size={40} color={COLORS.warning} />
                  <Text style={styles.actionTitle}>{t('notifications')}</Text>
                  <Text style={styles.actionSubtitle}>{t('view_notifications')}</Text>
                </Surface>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={() => Alert.alert('معلومات', 'سيتم إضافة هذه الميزة قريباً')}>
                <Surface style={styles.actionSurface} elevation={3}>
                  <MaterialCommunityIcons name="information" size={40} color={COLORS.info} />
                  <Text style={styles.actionTitle}>{t('about')}</Text>
                  <Text style={styles.actionSubtitle}>{t('app_info')}</Text>
                </Surface>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>{t('recent_activity')}</Text>
            <Card style={styles.activityCard} elevation={3}>
              <Card.Content>
                <View style={styles.activityItem}>
                  <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.primary} />
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{t('last_booking')}</Text>
                    <Text style={styles.activitySubtitle}>{t('check_my_bookings')}</Text>
                  </View>
                  <TouchableOpacity onPress={handleMyBookings}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textInverse,
    marginTop: 16,
  },
  brandSubtitle: {
    fontSize: 18,
    color: COLORS.textInverse,
    marginTop: 8,
    textAlign: 'center',
  },
  welcomeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
  },
  welcomeContent: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: COLORS.primary,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    width: '100%',
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  header: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginRight: 16,
  },
  userText: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  locationChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  logoutButton: {
    padding: 8,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textInverse,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 16,
  },
  actionSurface: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  recentActivity: {
    padding: 16,
    paddingBottom: 32,
  },
  activityCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    flex: 1,
    marginLeft: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  activitySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default HomeScreen;
