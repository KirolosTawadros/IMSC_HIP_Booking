# ميزة Push Notifications - Push Notifications Feature

## نظرة عامة
تم إضافة نظام Push Notifications متكامل للتطبيق، مما يسمح بإرسال إشعارات فورية للمستخدمين عن حالة حجوزاتهم.

## الميزات المضافة

### 1. إدارة الإشعارات
- **طلب الإذن:** طلب إذن الإشعارات من المستخدم عند تسجيل الدخول
- **Push Token:** الحصول على وحفظ push token لكل مستخدم
- **إعدادات الإشعارات:** تكوين سلوك الإشعارات (صوت، تنبيه، badge)

### 2. أنواع الإشعارات
- **booking_created:** عند إنشاء حجز جديد
- **booking_approved:** عند الموافقة على الحجز
- **booking_rejected:** عند رفض الحجز
- **booking_cancelled:** عند إلغاء الحجز

### 3. ميزات متقدمة
- **Local Notifications:** إشعارات محلية فورية
- **Scheduled Notifications:** إشعارات مجدولة لمواعيد محددة
- **Badge Count:** عداد الإشعارات غير المقروءة
- **Notification Listeners:** استماع للإشعارات الواردة والتفاعل معها

## كيفية العمل

### 1. طلب الإذن
```javascript
// عند تسجيل الدخول في HomeScreen
const hasPermission = await NotificationService.requestPermissions();
if (hasPermission) {
  const pushToken = await NotificationService.getPushToken();
  // حفظ push token في قاعدة البيانات
}
```

### 2. إرسال إشعار محلي
```javascript
// إرسال إشعار فوري
await NotificationService.sendLocalNotification(
  'تمت الموافقة على الحجز',
  'تمت الموافقة على حجزك بنجاح',
  { screen: 'MyBookings' }
);
```

### 3. جدولة إشعار
```javascript
// إرسال إشعار في وقت محدد
await NotificationService.scheduleNotification(
  'تذكير بالموعد',
  'لديك موعد غداً الساعة 9:00 صباحاً',
  '2024-12-30T09:00:00Z',
  { screen: 'MyBookings' }
);
```

### 4. إدارة Badge Count
```javascript
// تحديث عدد الإشعارات غير المقروءة
const unreadCount = notifications.filter(n => !n.read).length;
await NotificationService.setNotificationCount(unreadCount);
```

## الملفات المضافة/المعدلة

### Backend:
- `backend/models/Notification.js` - تحديث لإضافة نوع "booking_cancelled"

### Frontend:
- `mobile/services/notifications.js` - خدمة إدارة الإشعارات الجديدة
- `mobile/app/screens/HomeScreen.tsx` - إضافة طلب إذن الإشعارات
- `mobile/app/screens/NotificationsScreen.tsx` - إضافة listeners وbadge count
- `mobile/app.json` - إضافة إعدادات expo-notifications
- `mobile/package.json` - إضافة expo-notifications و expo-device
- `mobile/assets/locales/ar.json` - إضافة الترجمات العربية
- `mobile/assets/locales/en.json` - إضافة الترجمات الإنجليزية

## إعدادات التطبيق

### app.json
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#1976d2",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ]
  }
}
```

### المكتبات المطلوبة
```bash
npx expo install expo-notifications expo-device
```

## اختبار الميزة

### 1. اختبار طلب الإذن:
1. فتح التطبيق
2. تسجيل الدخول
3. يجب أن يظهر طلب إذن الإشعارات
4. الموافقة على الإذن

### 2. اختبار الإشعارات المحلية:
1. إنشاء حجز جديد
2. يجب أن تظهر إشعار "تم إنشاء الحجز"
3. الضغط على الإشعار يجب أن يفتح شاشة "حجوزاتي"

### 3. اختبار Badge Count:
1. وجود إشعارات غير مقروءة
2. يجب أن يظهر رقم على أيقونة الإشعارات
3. قراءة الإشعارات يجب أن يقلل العدد

### 4. اختبار الإشعارات المجدولة:
1. جدولة إشعار لموعد محدد
2. يجب أن يظهر الإشعار في الوقت المحدد

## ملاحظات تقنية

### الأمان:
- طلب الإذن من المستخدم قبل إرسال الإشعارات
- حفظ push token بشكل آمن
- التحقق من صحة البيانات قبل إرسال الإشعار

### الأداء:
- إدارة listeners بشكل صحيح لتجنب memory leaks
- تحديث badge count بشكل فعال
- إرسال الإشعارات في الخلفية

### تجربة المستخدم:
- إشعارات واضحة ومفهومة
- إمكانية التنقل من الإشعار للشاشة المناسبة
- عداد الإشعارات غير المقروءة
- إعدادات صوت وتنبيه قابلة للتخصيص

### التوافق:
- يعمل على iOS و Android
- يدعم الإشعارات المحلية والمجدولة
- متوافق مع Expo SDK 53 