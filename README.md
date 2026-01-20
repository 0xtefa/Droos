# منصة إجتهد (Ejtahd Platform)

<div align="center">

![Logo](public/images/logo.png)

**منصة تعليمية إسلامية متكاملة**

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[English](#english) | [العربية](#arabic)

</div>

---

<a name="arabic"></a>
## 📖 نظرة عامة

منصة إجتهد هي منصة تعليمية إسلامية تهدف إلى تقديم دورات علمية شرعية بطريقة تفاعلية وممتعة. تتضمن المنصة نظام نقاط ومنافسة بين الطلاب لتشجيعهم على المتابعة والتعلم.

## ✨ المميزات

### للطلاب
- 📚 **دورات متنوعة** - في الفقه والتفسير والعقيدة والرقائق
- 🎥 **محاضرات تفاعلية** - فيديو وصوت مع إمكانية تسجيل الحضور
- 📝 **اختبارات قصيرة** - اختبارات بعد كل محاضرة للتأكد من الفهم
- 🏆 **لوحة الصدارة** - نظام نقاط ومنافسة بين الطلاب
- 🗳️ **نظام التصويت** - تصويت على مواعيد المحاضرات
- 👤 **الملف الشخصي** - إدارة الحساب وتتبع التقدم
- ⏰ **تنبيهات المحاضرات** - إشعارات بمواعيد المحاضرات القادمة

### للمسؤول (Admin)
- 📊 **لوحة تحكم** - إحصائيات شاملة عن المنصة
- 📚 **إدارة الدورات** - إضافة وتعديل وحذف الدورات والمحاضرات
- 👥 **إدارة المستخدمين** - ترقية الطلاب لمتابعين
- 📢 **الإعلانات** - إضافة مواعيد المحاضرات وإرسال التذكيرات

### للمتابع (Moderator)
- 👁️ **متابعة الطلاب** - مراقبة تقدم الطلاب المعينين
- 📈 **إحصائيات الحضور** - تقارير حضور الطلاب

### مميزات تقنية
- 📱 **تصميم متجاوب** - يعمل على جميع الأجهزة
- 🔄 **PWA** - يمكن تثبيته كتطبيق على الهاتف
- 🌙 **واجهة RTL** - دعم كامل للغة العربية

## 🛠️ التقنيات المستخدمة

### Backend
| التقنية | الإصدار | الوصف |
|---------|---------|-------|
| Laravel | 12 | إطار العمل الأساسي |
| Laravel Sanctum | - | المصادقة والحماية |
| SQLite/MySQL | - | قاعدة البيانات |
| PHP | >= 8.2 | لغة البرمجة |

### Frontend
| التقنية | الإصدار | الوصف |
|---------|---------|-------|
| React | 18 | مكتبة واجهة المستخدم |
| React Router | 7 | التنقل بين الصفحات |
| Tailwind CSS | 4 | تنسيق الواجهة |
| Vite | 7 | أداة البناء والتطوير |
| Axios | - | طلبات HTTP |

## 📁 هيكل المشروع

```
Droos/
├── app/
│   ├── Http/
│   │   ├── Controllers/         # Controllers للـ API
│   │   │   ├── Admin/           # Controllers لوحة التحكم
│   │   │   └── ...
│   │   └── Middleware/          # Middleware للصلاحيات
│   ├── Models/                  # نماذج قاعدة البيانات
│   ├── Policies/                # سياسات الصلاحيات
│   └── Providers/               # مزودي الخدمات
├── database/
│   ├── factories/               # Factories للاختبارات
│   ├── migrations/              # ملفات الهجرة
│   └── seeders/                 # بيانات تجريبية
├── routes/
│   ├── api.php                  # مسارات API
│   └── web.php                  # مسارات الويب
├── src/                         # React Frontend
│   ├── api/                     # API client
│   ├── auth/                    # مكونات المصادقة
│   │   ├── AuthProvider.jsx     # Context للمصادقة
│   │   ├── AdminRoute.jsx       # حماية صفحات Admin
│   │   └── ModeratorRoute.jsx   # حماية صفحات Moderator
│   ├── components/              # مكونات مشتركة
│   ├── pages/                   # صفحات التطبيق
│   │   ├── admin/               # صفحات لوحة التحكم
│   │   └── moderator/           # صفحات المتابع
│   └── utils/                   # أدوات مساعدة
├── public/                      # ملفات عامة
│   ├── images/                  # الصور
│   └── icons/                   # أيقونات PWA
├── storage/                     # الملفات المرفوعة
└── tests/                       # الاختبارات
```

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18
- **npm** >= 9 أو **yarn** >= 1.22

### خطوات التثبيت

#### 1. استنساخ المشروع
```bash
git clone https://github.com/yourusername/ejtahd-platform.git
cd ejtahd-platform
```

#### 2. تثبيت حزم PHP
```bash
composer install
```

#### 3. تثبيت حزم JavaScript
```bash
npm install
```

#### 4. إعداد ملف البيئة
```bash
cp .env.example .env
php artisan key:generate
```

#### 5. تعديل ملف `.env`
```env
APP_NAME="منصة إجتهد"
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# أو لـ MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ejtahd
# DB_USERNAME=root
# DB_PASSWORD=
```

#### 6. إنشاء قاعدة البيانات
```bash
# لـ SQLite
touch database/database.sqlite

# تشغيل الـ migrations
php artisan migrate

# إضافة البيانات التجريبية
php artisan db:seed
```

#### 7. إنشاء رابط التخزين
```bash
php artisan storage:link
```

#### 8. تشغيل السيرفر
```bash
# الطريقة السهلة (تشغيل كلاهما معاً)
./dev.sh

# أو يدوياً
php artisan serve --host=0.0.0.0 --port=8000 &
npm run dev
```

#### 9. فتح التطبيق
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api

## 🔐 الحسابات التجريبية

| الدور | البريد الإلكتروني | كلمة المرور | الصلاحيات |
|-------|-------------------|-------------|-----------|
| مسؤول (Admin) | admin@ejtahd.com | admin123 | كل الصلاحيات |
| متابع (Moderator) | moderator@ejtahd.com | moderator123 | متابعة الطلاب |
| طالب | student@example.com | password | الدورات والاختبارات |

## 📡 API Endpoints

### المصادقة (Auth)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/register` | إنشاء حساب جديد |
| POST | `/api/login` | تسجيل الدخول |
| POST | `/api/logout` | تسجيل الخروج |
| GET | `/api/me` | بيانات المستخدم الحالي |

### الدورات (Courses)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/courses` | قائمة الدورات |
| GET | `/api/courses/{id}/lectures` | محاضرات الدورة |
| GET | `/api/courses/{id}/progress` | تقدم الطالب في الدورة |

### المحاضرات (Lectures)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/lectures/{id}` | تفاصيل محاضرة |
| POST | `/api/lectures/{id}/attend` | تسجيل الحضور |
| POST | `/api/lectures/{id}/complete` | إكمال المحاضرة |
| GET | `/api/lectures/{id}/quiz` | اختبار المحاضرة |

### الاختبارات (Quizzes)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/quizzes/{id}` | تفاصيل اختبار |
| POST | `/api/quizzes/{id}/submit` | تسليم الاختبار |

### لوحة الصدارة والتصويت
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/leaderboard` | ترتيب الطلاب |
| GET | `/api/votes` | قائمة التصويتات |
| POST | `/api/votes` | إنشاء تصويت |

### Admin API (تحتاج صلاحية admin)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/admin/dashboard` | إحصائيات لوحة التحكم |
| GET | `/api/admin/courses` | إدارة الدورات |
| GET | `/api/admin/users` | إدارة المستخدمين |
| GET | `/api/admin/announcements` | الإعلانات |
| POST | `/api/admin/users/{id}/promote` | ترقية لمتابع |

### Moderator API (تحتاج صلاحية moderator)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/moderator/dashboard` | لوحة المتابع |
| GET | `/api/moderator/students` | الطلاب المعينين |

## 🧪 الاختبارات

```bash
# تشغيل جميع الاختبارات
php artisan test

# تشغيل اختبارات محددة
php artisan test --filter=CourseApiTest

# تشغيل مع التغطية
php artisan test --coverage
```

## 🔧 أوامر مفيدة

```bash
# مسح الكاش
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# إعادة بناء قاعدة البيانات
php artisan migrate:fresh --seed

# بناء الـ Frontend للإنتاج
npm run build

# فحص الكود
npm run lint
```

## 📝 دليل المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

### 1. Fork المشروع
انقر على زر Fork في أعلى الصفحة

### 2. استنساخ نسختك
```bash
git clone https://github.com/YOUR_USERNAME/ejtahd-platform.git
cd ejtahd-platform
```

### 3. إنشاء branch جديد
```bash
git checkout -b feature/amazing-feature
# أو
git checkout -b fix/bug-description
```

### 4. قواعد كتابة الكود
- اتبع معايير PSR-12 لـ PHP
- استخدم ESLint لـ JavaScript
- أضف تعليقات للكود المعقد
- اكتب اختبارات للميزات الجديدة

### 5. Commit التغييرات
```bash
git add .
git commit -m "feat: add amazing feature"
# أو
git commit -m "fix: resolve bug in login"
```

#### أنواع Commits:
- `feat:` - ميزة جديدة
- `fix:` - إصلاح خطأ
- `docs:` - تحديث التوثيق
- `style:` - تنسيق الكود
- `refactor:` - إعادة هيكلة
- `test:` - إضافة اختبارات

### 6. Push و Pull Request
```bash
git push origin feature/amazing-feature
```
ثم افتح Pull Request من GitHub

## 🐛 الإبلاغ عن المشاكل

إذا وجدت مشكلة، يرجى فتح Issue جديد مع:
- وصف واضح للمشكلة
- خطوات إعادة إنتاج المشكلة
- لقطات شاشة (إن أمكن)
- معلومات البيئة (المتصفح، نظام التشغيل)

## 📄 الرخصة

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

<a name="english"></a>
## 📖 Overview (English)

Ejtahd Platform is an Islamic educational platform that aims to provide interactive religious courses. The platform includes a points system and competition between students to encourage them to follow up and learn.

### Quick Start
```bash
# Clone
git clone https://github.com/yourusername/ejtahd-platform.git
cd ejtahd-platform

# Install
composer install && npm install

# Setup
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed

# Run
./dev.sh
```

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ejtahd.com | admin123 |
| Moderator | moderator@ejtahd.com | moderator123 |
| Student | student@example.com | password |

---

<div align="center">

**بُني بـ ❤️ لخدمة طلاب العلم**

Made with ❤️ for Islamic knowledge seekers

</div>
