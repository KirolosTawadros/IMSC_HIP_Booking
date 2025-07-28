import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { t } from '../../i18n';
import { removeUser, getCurrentUser, getCurrentUserSync } from '../../services/auth';
import { Card, Surface, Chip, Avatar, Divider } from 'react-native-paper';

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

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const doctorName = getCurrentUserSync()?.name || 'د. أحمد';
  const doctorPhone = getCurrentUserSync()?.phone || '';
  const doctorGovernorate = getCurrentUserSync()?.governorate || '';
  const doctorHospital = getCurrentUserSync()?.hospital?.name || '';

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
              <MaterialCommunityIcons name="account-circle" size={80} color={COLORS.textInverse} />
              <Text style={styles.brandTitle}>الملف الشخصي</Text>
              <Text style={styles.brandSubtitle}>يرجى تسجيل الدخول لعرض الملف الشخصي</Text>
            </View>
            <Card style={styles.welcomeCard} elevation={4}>
              <Card.Content style={styles.welcomeContent}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => navigation.navigate('Login')}
                >
                  <MaterialCommunityIcons name="login" size={24} color={COLORS.textInverse} />
                  <Text style={styles.loginButtonText}>{t('login')}</Text>
                </TouchableOpacity>
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
          {/* Profile Header */}
          <View style={styles.header}>
            <Surface style={styles.headerCard} elevation={4}>
              <View style={styles.profileInfo}>
                <Avatar.Icon size={80} icon="account" style={styles.profileAvatar} />
                <View style={styles.profileText}>
                  <Text style={styles.profileName}>{doctorName}</Text>
                  <Chip icon="phone" style={styles.phoneChip}>
                    {doctorPhone}
                  </Chip>
                  <Chip icon="map-marker" style={styles.locationChip}>
                    {doctorGovernorate}
                  </Chip>
                  <Chip icon="hospital-building" style={styles.hospitalChip}>
                    {doctorHospital}
                  </Chip>
                </View>
              </View>
            </Surface>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionCard} onPress={handleMyBookings}>
                <Surface style={styles.actionSurface} elevation={3}>
                  <MaterialCommunityIcons name="calendar-check" size={40} color={COLORS.success} />
                  <Text style={styles.actionTitle}>حجوزاتي</Text>
                  <Text style={styles.actionSubtitle}>عرض جميع الحجوزات</Text>
                </Surface>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={handleNotifications}>
                <Surface style={styles.actionSurface} elevation={3}>
                  <MaterialCommunityIcons name="bell" size={40} color={COLORS.warning} />
                  <Text style={styles.actionTitle}>الإشعارات</Text>
                  <Text style={styles.actionSubtitle}>عرض الإشعارات</Text>
                </Surface>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.settings}>
            <Text style={styles.sectionTitle}>الإعدادات</Text>
            <Card style={styles.settingsCard} elevation={3}>
              <Card.Content>
                <TouchableOpacity style={styles.settingItem}>
                  <MaterialCommunityIcons name="account-edit" size={24} color={COLORS.primary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>تعديل الملف الشخصي</Text>
                    <Text style={styles.settingSubtitle}>تحديث المعلومات الشخصية</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity style={styles.settingItem}>
                  <MaterialCommunityIcons name="cog" size={24} color={COLORS.info} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>إعدادات الإشعارات</Text>
                    <Text style={styles.settingSubtitle}>تخصيص الإشعارات</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.info} />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity style={styles.settingItem}>
                  <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.success} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>الخصوصية والأمان</Text>
                    <Text style={styles.settingSubtitle}>إعدادات الأمان</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.success} />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity style={styles.settingItem}>
                  <MaterialCommunityIcons name="help-circle" size={24} color={COLORS.warning} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>المساعدة والدعم</Text>
                    <Text style={styles.settingSubtitle}>الدليل والمساعدة</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.warning} />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                  <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>تسجيل الخروج</Text>
                    <Text style={styles.settingSubtitle}>الخروج من التطبيق</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </Card.Content>
            </Card>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Card style={styles.infoCard} elevation={3}>
              <Card.Content>
                <View style={styles.appInfoContent}>
                  <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
                  <View style={styles.appInfoText}>
                    <Text style={styles.appInfoTitle}>IMSC - المركز الدولي للخدمات الطبية</Text>
                    <Text style={styles.appInfoVersion}>الإصدار 1.0.0</Text>
                    <Text style={styles.appInfoDescription}>
                      تطبيق حجز المواعيد الطبية للمفاصل
                    </Text>
                  </View>
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
  loginButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  header: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileAvatar: {
    backgroundColor: COLORS.primary,
    marginBottom: 16,
  },
  profileText: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  phoneChip: {
    marginBottom: 8,
  },
  locationChip: {
    marginBottom: 8,
  },
  hospitalChip: {
    marginBottom: 8,
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
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
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
  settings: {
    padding: 16,
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    marginVertical: 8,
  },
  appInfo: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
  },
  appInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfoText: {
    flex: 1,
    marginLeft: 16,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  appInfoVersion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appInfoDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default ProfileScreen;
