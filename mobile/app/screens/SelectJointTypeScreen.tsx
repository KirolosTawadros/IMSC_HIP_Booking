import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOW } from '../../constants/theme';
import { getJointTypes } from '../../services/api';
import { t } from '../../i18n';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  SelectJointType: undefined;
  SelectDate: { jointType: string; jointTypeId: string } | undefined;
  SelectTimeSlot: undefined;
  Confirmation: undefined;
  MyBookings: undefined;
};

type JointType = {
  _id: string;
  name: string;
  description?: string;
};

const SelectJointTypeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [jointTypes, setJointTypes] = useState<JointType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (!global.currentUser?._id) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
  }, []);

  // Refresh data every time screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (global.currentUser?._id) {
        loadJointTypes();
      }
    }, [])
  );

  const loadJointTypes = async () => {
    try {
      const response = await getJointTypes();
      setJointTypes(response.data);
    } catch (error: any) {
      Alert.alert('خطأ', 'فشل في تحميل أنواع المفاصل');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (jointType: any) => {
    if (!global.currentUser?._id) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
    
    navigation.navigate('SelectDate', { 
      jointType: jointType.name, 
      jointTypeId: jointType._id 
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={COLORS.card} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('select_joint_type')}</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={loadJointTypes}
            disabled={loading}
          >
            <MaterialCommunityIcons 
              name="refresh" 
              size={24} 
              color={COLORS.card} 
            />
          </TouchableOpacity>
        </View>
        <FlatList
          data={jointTypes}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)} activeOpacity={0.85}>
              <MaterialCommunityIcons name="bone" size={SIZES.icon + 10} color={COLORS.primary} style={{ marginBottom: 8 }} />
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: SIZES.padding, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: { 
    fontSize: SIZES.title, 
    fontWeight: 'bold', 
    color: COLORS.card, 
    flex: 1,
    textAlign: 'center',
    textShadowColor: COLORS.shadow, 
    textShadowOffset: { width: 0, height: 2 }, 
    textShadowRadius: 8 
  },
  refreshButton: {
    padding: 8,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 32,
    marginBottom: 18,
    alignItems: 'center',
    ...SHADOW,
  },
  cardText: { fontSize: SIZES.subtitle, fontWeight: 'bold', color: COLORS.primary },
  loadingText: { color: COLORS.card, fontSize: SIZES.text, marginTop: 16 },
});

export default SelectJointTypeScreen;
