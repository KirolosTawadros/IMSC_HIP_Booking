import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { getJointTypes } from '../../services/api';
import { getUser } from '../../services/auth';
import { t } from '../../i18n';
import { Card, Surface, Chip, Searchbar } from 'react-native-paper';

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

type JointType = {
  _id: string;
  name: string;
  description?: string;
};

const SelectJointTypeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [jointTypes, setJointTypes] = useState<JointType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJointTypes, setFilteredJointTypes] = useState<JointType[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('🔍 Fetching user for SelectJointType...');
      const u = await getUser();
      console.log('👤 User for SelectJointType:', u);
      setUser(u);
      
      // Check user after loading
      if (!u?.data?._id) {
        console.log('❌ No user ID found in SelectJointType');
        Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
        navigation.navigate('Login');
        return;
      }
    };
    fetchUser();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.data?._id) {
        console.log('✅ User authenticated, loading joint types');
        loadJointTypes();
      }
    }, [user])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJointTypes(jointTypes);
    } else {
      const filtered = jointTypes.filter(jointType =>
        jointType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jointType.description && jointType.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredJointTypes(filtered);
    }
  }, [searchQuery, jointTypes]);

  const loadJointTypes = async () => {
    try {
      const response = await getJointTypes();
      setJointTypes(response.data);
      setFilteredJointTypes(response.data);
    } catch (error: any) {
      Alert.alert('خطأ', 'فشل في تحميل أنواع المفاصل');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (jointType: any) => {
    const currentUser = user?.data?._id;
    if (!currentUser) {
      Alert.alert('خطأ', 'يرجى تسجيل الدخول أولاً');
      navigation.navigate('Login');
      return;
    }
    
    navigation.navigate('SelectDate', { 
      jointType: jointType.name, 
      jointTypeId: jointType._id 
    });
  };

  const renderJointType = ({ item }: { item: JointType }) => (
    <Card style={styles.jointTypeCard} elevation={3}>
      <TouchableOpacity onPress={() => handleSelect(item)} style={styles.jointTypeItem}>
        <View style={styles.jointTypeIcon}>
          <MaterialCommunityIcons 
            name="bone" 
            size={32} 
            color={COLORS.primary} 
          />
        </View>
        <View style={styles.jointTypeContent}>
          <Text style={styles.jointTypeName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.jointTypeDescription}>{item.description}</Text>
          )}
          <Chip 
            icon="arrow-right" 
            style={styles.selectChip}
            textStyle={styles.selectChipText}
          >
            {t('select')}
          </Chip>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={24} 
          color={COLORS.textSecondary} 
        />
      </TouchableOpacity>
    </Card>
  );

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.loadingContainer}>
        <Surface style={styles.loadingCard} elevation={4}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </Surface>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('select_joint_type')}</Text>
        <Text style={styles.subtitle}>{t('select_joint_type_description')}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('search_joint_types')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredJointTypes}
        renderItem={renderJointType}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Surface style={styles.emptyCard} elevation={2}>
            <MaterialCommunityIcons 
              name="magnify" 
              size={48} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.emptyTitle}>{t('no_joint_types_found')}</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? t('try_different_search') : t('no_joint_types_available')}
            </Text>
          </Surface>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  loadingCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    ...SHADOW.light.large,
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  header: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.largeTitle,
    fontWeight: '700' as const,
    color: COLORS.textInverse,
    marginBottom: SIZES.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textInverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  searchBar: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    elevation: 2,
  },
  searchInput: {
    fontSize: SIZES.md,
    color: COLORS.text,
  },
  listContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
  },
  jointTypeCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOW.light.medium,
  },
  jointTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
  },
  jointTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  jointTypeContent: {
    flex: 1,
  },
  jointTypeName: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: SIZES.spacing.xs,
  },
  jointTypeDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  selectChip: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
  },
  selectChipText: {
    color: COLORS.textInverse,
    fontSize: SIZES.sm,
    fontWeight: '500' as const,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    marginTop: SIZES.spacing.xl,
    ...SHADOW.light.medium,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default SelectJointTypeScreen;
