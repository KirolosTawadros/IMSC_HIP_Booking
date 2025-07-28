import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { t } from '../../i18n';
import { getUser } from '../../services/auth';
import { Card, Surface, Chip, Button } from 'react-native-paper';

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

type RouteParams = {
  jointType: string;
  jointTypeId: string;
};

const SelectDateScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { jointType, jointTypeId } = (route.params as RouteParams) || { jointType: '', jointTypeId: '' };
  const [selected, setSelected] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('🔍 Fetching user for SelectDate...');
      const u = await getUser();
      console.log('👤 User for SelectDate:', u);
      setUser(u);
      
      // Check user after loading
      if (!u?.data?._id) {
        console.log('❌ No user ID found in SelectDate');
        Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
        navigation.navigate('Login');
        return;
      }
    };
    fetchUser();
  }, []);

  const handleDayPress = (day: any) => {
    if (!user?.data?._id) {
      console.log('❌ No user ID found in handleDayPress');
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
    
    setSelected(day.dateString);
    navigation.navigate('SelectTimeSlot', { jointType, jointTypeId, date: day.dateString });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <Surface style={styles.headerCard} elevation={4}>
          <View style={styles.headerContent}>
            <View style={styles.jointTypeInfo}>
              <MaterialCommunityIcons 
                name="bone" 
                size={32} 
                color={COLORS.primary} 
              />
              <View style={styles.jointTypeText}>
                <Text style={styles.jointTypeName}>{jointType}</Text>
                <Chip 
                  icon="calendar" 
                  style={styles.dateChip}
                  textStyle={styles.dateChipText}
                >
                  {t('select_date')}
                </Chip>
              </View>
            </View>
          </View>
        </Surface>
      </View>

      <Card style={styles.calendarCard} elevation={4}>
        <Card.Content style={styles.calendarContent}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selected]: { 
                selected: true, 
                selectedColor: COLORS.primary,
                selectedTextColor: COLORS.textInverse,
              },
            }}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              backgroundColor: COLORS.card,
              calendarBackground: COLORS.card,
              textSectionTitleColor: COLORS.text,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.textInverse,
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.text,
              textDisabledColor: COLORS.textTertiary,
              dotColor: COLORS.primary,
              selectedDotColor: COLORS.textInverse,
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.text,
              indicatorColor: COLORS.primary,
              textDayFontFamily: FONTS.family.regular,
              textMonthFontFamily: FONTS.family.medium,
              textDayHeaderFontFamily: FONTS.family.medium,
              textDayFontWeight: '400' as const,
              textMonthFontWeight: '600' as const,
              textDayHeaderFontWeight: '500' as const,
              textDayFontSize: SIZES.md,
              textMonthFontSize: SIZES.lg,
              textDayHeaderFontSize: SIZES.sm,
            }}
            style={styles.calendar}
          />
        </Card.Content>
      </Card>

      {selected && (
        <Surface style={styles.selectedDateCard} elevation={3}>
          <View style={styles.selectedDateContent}>
            <MaterialCommunityIcons 
              name="calendar-check" 
              size={24} 
              color={COLORS.success} 
            />
            <View style={styles.selectedDateText}>
              <Text style={styles.selectedDateLabel}>{t('selected_date')}</Text>
              <Text style={styles.selectedDateValue}>{formatDate(selected)}</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SelectTimeSlot', { jointType, jointTypeId, date: selected })}
              style={styles.continueButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {t('continue')}
            </Button>
          </View>
        </Surface>
      )}

      <View style={styles.infoContainer}>
        <Card style={styles.infoCard} elevation={2}>
          <Card.Content style={styles.infoContent}>
            <MaterialCommunityIcons 
              name="information" 
              size={24} 
              color={COLORS.info} 
            />
            <Text style={styles.infoText}>
              {t('date_selection_info')}
            </Text>
          </Card.Content>
        </Card>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.lg,
  },
  headerCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    ...SHADOW.light.large,
  },
  headerContent: {
    padding: SIZES.spacing.lg,
  },
  jointTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jointTypeText: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  jointTypeName: {
    fontSize: SIZES.xl,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.sm,
  },
  dateChip: {
    backgroundColor: COLORS.backgroundSecondary,
    alignSelf: 'flex-start',
  },
  dateChipText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  calendarCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    ...SHADOW.light.large,
  },
  calendarContent: {
    padding: SIZES.spacing.md,
  },
  calendar: {
    borderRadius: SIZES.radius.md,
  },
  selectedDateCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    ...SHADOW.light.medium,
  },
  selectedDateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  selectedDateText: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  selectedDateLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  selectedDateValue: {
    fontSize: SIZES.md,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.md,
    ...SHADOW.light.small,
  },
  buttonContent: {
    height: SIZES.button.md,
  },
  buttonLabel: {
    fontSize: SIZES.md,
    fontWeight: '600' as const,
  },
  infoContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    marginTop: 'auto',
    marginBottom: SIZES.spacing.lg,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.md,
  },
  infoText: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default SelectDateScreen;
