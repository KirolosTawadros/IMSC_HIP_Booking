import React, { useState, useEffect } from 'react';
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
import { removeUser, getUser } from '../../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button, Surface, Chip, Avatar } from 'react-native-paper';
import { getUserBookings } from '../../services/api';

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
  const [user, setUser] = useState<any>(null);
  const [bookingStats, setBookingStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    const fetchUser = async () => {
      console.log('🔍 Fetching user from storage...');
      const u = await getUser();
      console.log('👤 User from storage:', u);
      setUser(u);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.data?._id) {
      loadBookingStats();
    }
  }, [user]);

  const loadBookingStats = async () => {
    try {
      console.log('📊 Loading booking stats...');
      const response = await getUserBookings(user.data._id);
      const bookings = response.data;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const todayBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= today;
      });
      
      const weekBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= thisWeek;
      });
      
      const monthBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= thisMonth;
      });
      
      setBookingStats({
        today: todayBookings.length,
        thisWeek: weekBookings.length,
        thisMonth: monthBookings.length
      });
      
      console.log('📊 Booking stats updated:', {
        today: todayBookings.length,
        thisWeek: weekBookings.length,
        thisMonth: monthBookings.length
      });
    } catch (error) {
      console.log('❌ Error loading booking stats:', error);
    }
  };

  const doctorName = user?.data?.name || 'د. أحمد';
  const doctorGovernorate = user?.data?.governorate || '';
  
  console.log('🎯 Current user state:', user);
  console.log('📝 Doctor name:', doctorName);

  // Request notification permissions when component mounts
  React.useEffect(() => {
    const setupNotifications = async () => {
      if (user?.data?._id) {
        try {
          const hasPermission = await NotificationService.requestPermissions();
          if (hasPermission) {
            const pushToken = await NotificationService.getPushToken();
            if (pushToken) {
              console.log('Push token saved for user:', user.data._id);
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
      if (!user?.data?._id) return;
      
      try {
        const response = await getUserNotifications(user.data._id);
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

  const menuItems = [
    {
      id: 'new_booking',
      title: t('new_booking'),
      subtitle: t('book_new_appointment'),
      icon: 'calendar-plus',
      color: COLORS.primary,
      onPress: () => {
        console.log('🔘 New Booking pressed');
        console.log('👤 User in New Booking:', user);
        if (!user?.data?._id) {
          console.log('❌ No user ID found, redirecting to login');
          Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
          navigation.navigate('Login');
          return;
        }
        console.log('✅ User authenticated, navigating to SelectJointType');
        navigation.navigate('SelectJointType');
      },
    },
    {
      id: 'my_bookings',
      title: t('my_bookings'),
      subtitle: t('view_manage_bookings'),
      icon: 'calendar-clock',
      color: COLORS.secondary,
      onPress: () => {
        console.log('🔘 My Bookings pressed');
        console.log('👤 User in My Bookings:', user);
        if (!user?.data?._id) {
          console.log('❌ No user ID found, redirecting to login');
          Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
          navigation.navigate('Login');
          return;
        }
        console.log('✅ User authenticated, navigating to MyBookings');
        navigation.navigate('MyBookings');
      },
    },
    {
      id: 'notifications',
      title: t('notifications'),
      subtitle: t('view_notifications'),
      icon: 'bell',
      color: COLORS.info,
      onPress: () => {
        console.log('🔘 Notifications pressed');
        console.log('👤 User in Notifications:', user);
        if (!user?.data?._id) {
          console.log('❌ No user ID found, redirecting to login');
          Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
          navigation.navigate('Login');
          return;
        }
        console.log('✅ User authenticated, navigating to Notifications');
        navigation.navigate('Notifications');
      },
    },
  ];

  const quickStats = [
    {
      id: 'today',
      title: t('today'),
      value: bookingStats.today,
      icon: 'calendar-today',
      color: COLORS.success,
    },
    {
      id: 'this_week',
      title: t('this_week'),
      value: bookingStats.thisWeek,
      icon: 'calendar-week',
      color: COLORS.warning,
    },
    {
      id: 'this_month',
      title: t('this_month'),
      value: bookingStats.thisMonth,
      icon: 'calendar-month',
      color: COLORS.info,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={[COLORS.gradientStart, COLORS.gradientEnd]} 
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Surface style={styles.profileCard} elevation={4}>
              <View style={styles.profileInfo}>
                <Avatar.Text 
                  size={60} 
                  label={doctorName.charAt(0)} 
                  style={styles.avatar}
                  color={COLORS.textInverse}
                />
                <View style={styles.profileText}>
                  <Text style={styles.welcomeText}>{t('welcome')}</Text>
                  <Text style={styles.doctorName}>{doctorName}</Text>
                  <Chip 
                    icon="map-marker" 
                    style={styles.locationChip}
                    textStyle={styles.locationText}
                  >
                    {doctorGovernorate}
                  </Chip>
                </View>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </Surface>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>{t('quick_stats')}</Text>
            <View style={styles.statsGrid}>
              {quickStats.map((stat) => (
                <Card key={stat.id} style={styles.statCard} elevation={2}>
                  <Card.Content style={styles.statContent}>
                    <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                      <MaterialCommunityIcons 
                        name={stat.icon as any} 
                        size={24} 
                        color={COLORS.textInverse} 
                      />
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>

          {/* Main Menu */}
          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>{t('quick_actions')}</Text>
            {menuItems.map((item) => (
              <Card key={item.id} style={styles.menuCard} elevation={3}>
                <TouchableOpacity onPress={item.onPress} style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                      <MaterialCommunityIcons 
                        name={item.icon as any} 
                        size={28} 
                        color={COLORS.textInverse} 
                      />
                    </View>
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </Card>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('footer_text')}
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.xl,
  },
  header: {
    marginBottom: SIZES.spacing.xl,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    ...SHADOW.light.large,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginRight: SIZES.spacing.md,
  },
  profileText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  doctorName: {
    fontSize: SIZES.xl,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  locationChip: {
    backgroundColor: COLORS.backgroundSecondary,
    alignSelf: 'flex-start',
  },
  locationText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  logoutButton: {
    padding: SIZES.spacing.sm,
  },
  statsContainer: {
    marginBottom: SIZES.spacing.xl,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.textInverse,
    marginBottom: SIZES.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: SIZES.spacing.xs,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
  },
  statContent: {
    alignItems: 'center',
    padding: SIZES.spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  statTitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: SIZES.spacing.xl,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOW.light.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  menuIconContainer: {
    marginRight: SIZES.spacing.md,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  menuSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    alignItems: 'center',
    marginTop: SIZES.spacing.xl,
  },
  footerText: {
    fontSize: SIZES.sm,
    color: COLORS.textInverse,
    opacity: 0.8,
    textAlign: 'center',
  },
});

export default HomeScreen;
