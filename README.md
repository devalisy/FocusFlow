# FocusFlow

<div align="center">

**تطبيق إدارة الوقت والتركيز**

 Pomodoro Timer | Task Management | Habit Tracking | Reward System

</div>

---

## الميزات

### المؤقت (Pomodoro Timer)
- جلسات تركيز قابلة للتخصيص (25 دقيقة افتراضياً)
- استراحات قصيرة وطويلة
- تتبع الجلسات اليومية
- تأثيرات صوتية قابلة للتخصيص

### إدارة المهام
- إضافة وتعديل وحذف المهام
- مستويات الأولوية (عالية، متوسطة، منخفضة)
- تقدير الوقت المطلوب
- فلترة حسب الحالة

### تتبع العادات
- إنشاء عادات يومية بألوان مخصصة
- تتبع السلسلة (Streak)
- تقويم العادات لمدة 30 يوم
- مكافآت أسبوعية قابلة للتخصيص

### نظام المكافآت
- 10 مستويات (مبتدئ → خارق)
- 10 إنجازات قابل لفتحها
- نقاط تكتسب بإكمال المهام والعادات والجلسات
- سجل النقاط التفصيلي

### إعدادات الصوت
- 5 نغمة مدمجة (جرس، نغمة، لطيف، تنبيه، ألحان)
- إمكانية رفع صوت مخصص
- زر اختبار الصوت

---

## التشغيل كتطبيق سطح مكتب

### المتطلبات

1. **Node.js 22+** - https://nodejs.org/
2. **Rust** - https://rustup.rs/
3. **تبعيات النظام**:
   - **Windows**: Microsoft Visual Studio C++ Build Tools
   - **Linux**: 
     ```bash
     sudo apt install libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
     ```
   - **macOS**: Xcode Command Line Tools

### التثبيت والبناء

```bash
# تثبيت التبعيات
npm install

# تشغيل في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build
```

### بناء عبر GitHub Actions

عند الدفع إلى GitHub، سيتم بناء التطبيق تلقائياً لجميع المنصات:
- Windows (MSI + EXE)
- Linux (DEB + AppImage)
- macOS (DMG + APP)

---

## التشغيل كتطبيق ويب

### PWA (Progressive Web App)

يمكن تثبيت FocusFlow كتطبيق ويب:

1. افتح `index.html` في المتصفح
2. انقر على "تثبيت التطبيق" في شريط العنوان
3. سيتم إضافة اختصار على سطح المكتب

### اختصارات سطح المكتب

بعد التثبيت، يمكنك الوصول المباشر لـ:
- `/#timer` - المؤقت
- `/#tasks` - المهام
- `/#habits` - العادات

---

## هيكل المشروع

```
FocusFlow/
├── index.html          # الصفحة الرئيسية
├── app.js              # المنطق البرمجي
├── style.css           # الأنماط
├── sw.js               # Service Worker للعمل بدون إنترنت
├── manifest.json       # PWA Manifest
├── package.json        # تبعيات Node.js
├── server.js           # خادم محلي للتطوير
├── build.sh            # سكربت بناء (Linux/Mac)
├── build.bat           # سكربت بناء (Windows)
├── rust-toolchain.toml # إعدادات Rust
├── icons/              # أيقونات التطبيق
└── src-tauri/          # إعدادات Tauri
    ├── Cargo.toml      # تبعيات Rust
    ├── tauri.conf.json # إعدادات Tauri
    └── src/main.rs     # نقطة الدخول
```

---

## التقنيات المستخدمة

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Desktop**: Tauri (Rust)
- **PWA**: Service Worker, Web App Manifest
- **Build**: GitHub Actions

---

## الرخصة

MIT

---

<div align="center">

**صُمم بـ ❤️ للإنتاجية العربية**

</div>
