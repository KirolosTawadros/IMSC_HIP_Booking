import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes } from '../theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="hospital-building" 
            size={80} 
            color={colors.white} 
          />
        </View>
        
        <Text style={styles.title}>IMSC</Text>
        <Text style={styles.subtitle}>المركز الدولي للخدمات الطبية</Text>
        <Text style={styles.description}>International Medical Services Center</Text>
        
        <View style={styles.featureContainer}>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="calendar-check" size={24} color={colors.white} />
            <Text style={styles.featureText}>حجز العمليات الجراحية</Text>
          </View>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="doctor" size={24} color={colors.white} />
            <Text style={styles.featureText}>خدمات طبية متخصصة</Text>
          </View>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="shield-check" size={24} color={colors.white} />
            <Text style={styles.featureText}>جودة عالية وموثوقية</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: sizes.padding,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sizes.margin * 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: sizes.margin,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: colors.white,
    marginBottom: sizes.margin / 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: colors.white,
    marginBottom: sizes.margin * 2,
    textAlign: 'center',
    opacity: 0.9,
  },
  featureContainer: {
    marginTop: sizes.margin * 2,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sizes.margin,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: sizes.padding,
    paddingVertical: sizes.padding / 2,
    borderRadius: sizes.borderRadius,
  },
  featureText: {
    color: colors.white,
    fontSize: 16,
    marginLeft: sizes.margin,
    fontWeight: '500',
  },
});

export default SplashScreen; 