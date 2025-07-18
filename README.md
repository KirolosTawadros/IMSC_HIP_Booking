# HIP Booking - نظام حجز عمليات المفاصل

تطبيق موبايل يسمح لأطباء المستشفيات بحجز أنواع مفاصل صناعية من شركة معينة، بتواريخ وأوقات محددة.

## المميزات

### للدكتور:
- تسجيل الدخول باستخدام رقم الموبايل واسم المستشفى
- اختيار نوع المفصل
- اختيار التاريخ والميعاد
- عرض عدد الحالات المتبقية في كل ميعاد
- عرض الحجوزات السابقة

### للمدير:
- إدارة أنواع المفاصل
- تحديد القدرة التشغيلية لكل نوع مفصل
- عرض تقارير الحجوزات

## التقنيات المستخدمة

### Frontend (Mobile):
- React Native (Expo)
- React Navigation
- Axios للـ API calls
- MaterialCommunityIcons

### Backend:
- Node.js (Express)
- MongoDB (Mongoose)
- CORS للسماح بالاتصال من التطبيق

### Admin Panel:
- React (Create React App)

## التثبيت والتشغيل

### 1. تثبيت التبعيات

```bash
# تثبيت تبعيات التطبيق
cd mobile
npm install

# تثبيت تبعيات الـ backend
cd ../backend
npm install

# تثبيت تبعيات لوحة التحكم
cd ../admin
npm install
```

### 2. إعداد قاعدة البيانات

تأكد من تشغيل MongoDB على المنفذ 27017، ثم قم بتشغيل:

```bash
cd backend
npm run seed
```

### 3. تشغيل الـ Backend

```bash
cd backend
npm run dev
```

الـ backend سيعمل على: http://localhost:3000

### 4. تشغيل التطبيق

```bash
cd mobile
npm start
```

### 5. تشغيل لوحة التحكم

```bash
cd admin
npm start

```

لوحة التحكم ستعمل على: http://localhost:3001

## API Endpoints

### Users
- `POST /api/users/login` - تسجيل الدخول
- `POST /api/users/register` - تسجيل مستخدم جديد

### Joint Types
- `GET /api/joint-types` - جلب جميع أنواع المفاصل
- `POST /api/joint-types` - إضافة نوع مفصل جديد

### Time Slots
- `GET /api/time-slots` - جلب جميع المواعيد
- `POST /api/time-slots` - إضافة ميعاد جديد

### Bookings
- `GET /api/bookings/user/:userId` - جلب حجوزات المستخدم
- `POST /api/bookings` - إنشاء حجز جديد
- `GET /api/bookings/availability` - جلب المواعيد المتاحة

## هيكل قاعدة البيانات

### Users
- name: اسم المستخدم
- phone_number: رقم الموبايل
- hospital_name: اسم المستشفى

### JointTypes
- name: اسم نوع المفصل
- description: وصف نوع المفصل

### TimeSlots
- start_time: وقت البداية
- end_time: وقت النهاية

### JointCapacity
- joint_type_id: معرف نوع المفصل
- time_slot_id: معرف الميعاد
- capacity: القدرة التشغيلية

### Bookings
- user_id: معرف المستخدم
- joint_type_id: معرف نوع المفصل
- date: التاريخ
- time_slot_id: معرف الميعاد

## المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الـ branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT. 



د. أحمد محمد - 01012345678 - مستشفى القصر العيني - القاهرة الكبرى
د. فاطمة علي - 01123456789 - مستشفى دار الشفاء - أسيوط
د. محمد حسن - 01234567890 - مستشفى المقطم - القاهرة الكبرى
د. سارة أحمد - 01345678901 - مستشفى سوهاج العام - سوهاج
د. علي محمود - 01456789012 - مستشفى طنطا الجامعي - طنطا
د. نادية كمال - 01567890123 - مستشفى المنصورة العام - المنصورة
د. فاطمة علي - 01123456789 - مستشفى دار الشفاء - أسيوط

الإدارة:
Admin: admin@imsc.com / admin123
Staff: staff@imsc.com / staff123


د. أحمد محمد - 01012345678 - مستشفى القصر العيني - القاهرة الكبرى
د. فاطمة علي - 01123456789 - مستشفى دار الشفاء - أسيوط
د. محمد حسن - 01234567890 - مستشفى المقطم - القاهرة الكبرى
د. سارة أحمد - 01345678901 - مستشفى سوهاج العام - سوهاج
د. علي محمود - 01456789012 - مستشفى طنطا الجامعي - طنطا
د. نادية كمال - 01567890123 - مستشفى المنصورة العام - المنصورة



رقم الهاتف: 01012345678
اسم المستشفى: مستشفى القصر العيني
المحافظة: القاهرة الكبرى







kirolostawadros
VqdbVd7MT48SXqLB