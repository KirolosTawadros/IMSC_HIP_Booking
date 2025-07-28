import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';
import { SIZES, SHADOW, FONTS } from '../../constants/theme';
import { getUserNotifications, markNotificationAsRead } from '../../services/api';
import { getUser } from '../../services/auth';
import { t } from '../../i18n';
import { Card, Surface, Chip, Button, FAB, Divider } from 'react-native-paper';

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: 'booking' | 'reminder' | 'system' | 'motivational';
  read: boolean;
  createdAt: string;
  data?: any;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'booking': return 'calendar-check';
    case 'reminder': return 'bell-ring';
    case 'system': return 'cog';
    case 'motivational': return 'heart';
    default: return 'bell';
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'booking': return COLORS.primary;
    case 'reminder': return COLORS.warning;
    case 'system': return COLORS.info;
    case 'motivational': return COLORS.success;
    default: return COLORS.textSecondary;
  }
};

const getNotificationTypeText = (type: string) => {
  switch (type) {
    case 'booking': return t('booking_notification');
    case 'reminder': return t('reminder_notification');
    case 'system': return t('system_notification');
    case 'motivational': return t('motivational_notification');
    default: return t('notification');
  }
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log('🔍 Fetching user for Notifications...');
      const u = await getUser();
      console.log('👤 User for Notifications:', u);
      setUser(u);
    };
    fetchUser();
  }, []);

  const loadNotifications = useCallback(async (setLoadingState = true) => {
    console.log('🔔 Loading notifications for user:', user);
    if (!user?.data?._id) {
      console.log('❌ No user ID found');
      if (setLoadingState) setLoading(false);
      return;
    }
    try {
      console.log('🔍 Fetching notifications from API...');
      const response = await getUserNotifications(user.data._id);
      console.log('✅ Notifications loaded successfully:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.log('❌ Error loading notifications:', error);
      Alert.alert('خطأ', 'فشل في تحميل الإشعارات');
    } finally {
      if (setLoadingState) setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const fetch = async () => {
        if (mounted) await loadNotifications();
      };
      fetch();
      return () => { mounted = false; };
    }, [loadNotifications])
  );

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingAsRead(notificationId);
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      Alert.alert(t('error'), 'فشل في تحديث حالة الإشعار');
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
      Alert.alert(t('info'), t('all_notifications_read'));
      return;
    }

    Alert.alert(
      t('mark_all_read'),
      t('mark_all_read_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('mark_all_read'),
          onPress: async () => {
            try {
              await Promise.all(
                unreadNotifications.map(notif => markNotificationAsRead(notif._id))
              );
              setNotifications(prev => 
                prev.map(notif => ({ ...notif, read: true }))
              );
              Alert.alert(t('success'), t('all_notifications_marked_read'));
            } catch (error) {
              Alert.alert(t('error'), 'فشل في تحديث الإشعارات');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return t('just_now');
    } else if (diffInHours < 24) {
      return `${diffInHours} ${t('hours_ago')}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${t('days_ago')}`;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Card style={[styles.notificationCard, !item.read && styles.unreadCard]} elevation={2}>
      <TouchableOpacity 
        onPress={() => !item.read && handleMarkAsRead(item._id)}
        style={styles.notificationItem}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <MaterialCommunityIcons 
              name={getNotificationIcon(item.type) as any} 
              size={24} 
              color={getNotificationColor(item.type)} 
            />
          </View>
          <View style={styles.notificationContent}>
            <View style={styles.notificationTitleRow}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              {!item.read && (
                <View style={styles.unreadIndicator} />
              )}
            </View>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <View style={styles.notificationMeta}>
              <Chip 
                icon="tag" 
                style={[styles.typeChip, { backgroundColor: getNotificationColor(item.type) }]}
                textStyle={styles.typeChipText}
              >
                {getNotificationTypeText(item.type)}
              </Chip>
              <Text style={styles.notificationTime}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>

        {!item.read && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.notificationActions}>
              <Button
                mode="outlined"
                onPress={() => handleMarkAsRead(item._id)}
                loading={markingAsRead === item._id}
                disabled={markingAsRead === item._id}
                style={styles.markReadButton}
                contentStyle={styles.buttonContent}
                labelStyle={[styles.buttonLabel, { color: COLORS.primary }]}
              >
                {t('mark_as_read')}
              </Button>
            </View>
          </>
        )}
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('notifications')}</Text>
        <Text style={styles.subtitle}>
          {unreadCount > 0 
            ? `${unreadCount} ${t('unread_notifications')}`
            : t('all_notifications_read')
          }
        </Text>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadNotifications(false).finally(() => setRefreshing(false));
            }}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <Surface style={styles.emptyCard} elevation={2}>
            <MaterialCommunityIcons 
              name="bell-off" 
              size={48} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.emptyTitle}>{t('no_notifications')}</Text>
            <Text style={styles.emptySubtitle}>{t('no_notifications_description')}</Text>
          </Surface>
        }
      />

      {unreadCount > 0 && (
        <FAB
          icon="check-all"
          style={styles.fab}
          onPress={handleMarkAllAsRead}
          color={COLORS.textInverse}
          label={t('mark_all_read')}
        />
      )}
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
  listContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
  },
  notificationCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
    ...SHADOW.light.medium,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationItem: {
    padding: SIZES.spacing.lg,
  },
  notificationHeader: {
    flexDirection: 'row',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radius.round,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  notificationTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600' as const,
    color: COLORS.text,
    flex: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SIZES.spacing.sm,
  },
  notificationMessage: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
    lineHeight: 20,
  },
  notificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  typeChipText: {
    color: COLORS.textInverse,
    fontSize: SIZES.xs,
    fontWeight: '500' as const,
  },
  notificationTime: {
    fontSize: SIZES.sm,
    color: COLORS.textTertiary,
  },
  divider: {
    backgroundColor: COLORS.divider,
    marginVertical: SIZES.spacing.md,
  },
  notificationActions: {
    alignItems: 'flex-end',
  },
  markReadButton: {
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius.sm,
  },
  buttonContent: {
    height: SIZES.button.sm,
  },
  buttonLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600' as const,
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
  fab: {
    position: 'absolute',
    margin: SIZES.spacing.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default NotificationsScreen; 