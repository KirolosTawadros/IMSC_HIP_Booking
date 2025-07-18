import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { t } from '../../i18n';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SelectJointType: undefined;
  SelectDate: { jointType: string; jointTypeId: string } | undefined;
  SelectTimeSlot: { jointType: string; jointTypeId: string; date: string } | undefined;
  Confirmation: undefined;
  MyBookings: undefined;
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

  useEffect(() => {
    // Check if user is logged in
    if (!global.currentUser?._id) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
  }, [navigation]);

  const handleDayPress = (day: any) => {
    if (!global.currentUser?._id) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
    
    setSelected(day.dateString);
    navigation.navigate('SelectTimeSlot', { jointType, jointTypeId, date: day.dateString });
  };

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('select_date')}</Text>
        <View style={styles.card}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              [selected]: { selected: true, selectedColor: COLORS.primary },
            }}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              backgroundColor: COLORS.card,
              calendarBackground: COLORS.card,
              textSectionTitleColor: COLORS.primary,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: '#fff',
              todayTextColor: COLORS.secondary,
              dayTextColor: COLORS.text,
              textDisabledColor: COLORS.muted,
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.primary,
              indicatorColor: COLORS.primary,
            }}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: SIZES.padding, paddingTop: 60 },
  title: { fontSize: SIZES.title, fontWeight: 'bold', color: COLORS.card, marginBottom: 32, alignSelf: 'center', textShadowColor: COLORS.shadow, textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    ...SHADOW,
  },
});

export default SelectDateScreen;
