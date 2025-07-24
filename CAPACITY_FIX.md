# إصلاح مشكلة السعات بعد الإلغاء - Capacity Fix After Cancellation

## المشكلة
بعد إضافة ميزة إلغاء الحجز مع الاحتفاظ بالحجوزات الملغية في القائمة، كانت السعات المتاحة لا تزيد عند الإلغاء لأن الحجوزات الملغية كانت لا تزال تُحسب في عدد الحجوزات الحالية.

## الحل
تم تحديث جميع endpoints التي تحسب السعات المتاحة لاستبعاد الحجوزات الملغية من العد.

## الإصلاحات المطبقة

### 1. `/api/bookings/availability`
**الملف:** `backend/routes/bookings.js`
**التغيير:** إضافة `status: { $ne: 'cancelled' }` لاستبعاد الحجوزات الملغية

```javascript
const existingBookings = await Booking.find({
  date: date,
  joint_type_id: joint_type_id,
  governorate: user.governorate,
  status: { $ne: 'cancelled' } // استبعاد الحجوزات الملغية
});
```

### 2. `/api/joint-types/:id/capacities/with-slots`
**الملف:** `backend/routes/joint-types.js`
**التغيير:** إضافة `status: { $ne: 'cancelled' }` لاستبعاد الحجوزات الملغية

```javascript
const bookingsCount = await Booking.countDocuments({
  joint_type_id: jointTypeId,
  time_slot_id: slot._id,
  date: date,
  governorate,
  status: { $ne: 'cancelled' } // استبعاد الحجوزات الملغية
});
```

### 3. `/api/bookings` (إنشاء حجز جديد)
**الملف:** `backend/routes/bookings.js`
**التغيير:** إضافة `status: { $ne: 'cancelled' }` عند التحقق من السعة المتاحة

```javascript
const existingBookings = await Booking.find({
  date: req.body.date,
  joint_type_id: req.body.joint_type_id,
  time_slot_id: req.body.time_slot_id,
  governorate: user.governorate,
  status: { $ne: 'cancelled' } // استبعاد الحجوزات الملغية
});
```

## النتيجة
الآن عند إلغاء حجز:
1. ✅ **السعة تزيد:** الحجوزات الملغية لا تُحسب في السعة المتاحة
2. ✅ **الحجز يبقى مرئي:** الحجز الملغي يظهر في قائمة الحجوزات بحالة "ملغي"
3. ✅ **Admin Panel:** يرى جميع الحجوزات بما فيها الملغية
4. ✅ **Mobile App:** يرى جميع حجوزاته بما فيها الملغية

## مثال عملي
- **قبل الإلغاء:** سعة 3، محجوز 2، متاح 1
- **بعد الإلغاء:** سعة 3، محجوز 1، متاح 2 (الحجز الملغي لا يُحسب)

## الاختبار
يمكن اختبار الإصلاح عبر:
1. إنشاء حجز جديد
2. إلغاء الحجز
3. التحقق من زيادة السعة المتاحة
4. التحقق من بقاء الحجز الملغي في القائمة 