// إدارة الإعدادات والمزيد
class SettingsManager {
    constructor() {
        this.currentSection = 'profile';
        this.settings = JSON.parse(localStorage.getItem('appSettings')) || this.getDefaultSettings();
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadSettings();
        this.setupEventListeners();
        this.setupPasswordStrength();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
                
                // تحديث حالة الأزرار
                navButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    showSection(section) {
        // إخفاء جميع الأقسام
        const sections = document.querySelectorAll('.settings-section');
        sections.forEach(sec => sec.classList.remove('active'));
        
        // إظهار القسم المطلوب
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = section;
        }
    }

    getDefaultSettings() {
        return {
            profile: {
                name: 'د. أسامه منصور',
                email: 'ahmed@hospital.com',
                phone: '+966500000000',
                specialty: 'طبيب استشاري',
                clinic: 'مستشفى الملك فهد',
                license: 'MED-123456',
                bio: 'طبيب استشاري متخصص في الأمراض الباطنية والتحاليل الطبية...'
            },
            preferences: {
                language: 'ar',
                theme: 'light',
                timezone: '+3',
                compactMode: true,
                animations: true,
                highContrast: false,
                pageSize: 25,
                autoSave: 5,
                autoLogout: true
            },
            notifications: {
                newPatient: true,
                patientUpdate: true,
                newTest: true,
                criticalResults: true,
                testReminder: false,
                systemUpdates: true,
                backupReminder: false,
                securityAlerts: true,
                email: true,
                browser: true,
                sms: false,
                push: false
            },
            security: {
                lastPasswordChange: new Date().toISOString(),
                sessions: []
            },
            backup: {
                autoBackup: true,
                retention: 30,
                format: 'json',
                schedule: {
                    frequency: 'weekly',
                    day: 1,
                    time: '02:00'
                }
            }
        };
    }

    loadSettings() {
        // تحميل إعدادات الملف الشخصي
        this.loadProfileSettings();
        
        // تحميل التفضيلات
        this.loadPreferenceSettings();
        
        // تحميل إعدادات الإشعارات
        this.loadNotificationSettings();
        
        // تحميل إعدادات النسخ الاحتياطي
        this.loadBackupSettings();
    }

    loadProfileSettings() {
        const profile = this.settings.profile;
        
        document.getElementById('user-name').value = profile.name;
        document.getElementById('user-email').value = profile.email;
        document.getElementById('user-phone').value = profile.phone;
        document.getElementById('user-specialty').value = profile.specialty;
        document.getElementById('user-clinic').value = profile.clinic;
        document.getElementById('user-license').value = profile.license;
        document.getElementById('user-bio').value = profile.bio;
    }

    loadPreferenceSettings() {
        const prefs = this.settings.preferences;
        
        document.getElementById('pref-language').value = prefs.language;
        document.getElementById('pref-theme').value = prefs.theme;
        document.getElementById('pref-timezone').value = prefs.timezone;
        document.getElementById('pref-compact').checked = prefs.compactMode;
        document.getElementById('pref-animations').checked = prefs.animations;
        document.getElementById('pref-highcontrast').checked = prefs.highContrast;
        document.getElementById('pref-page-size').value = prefs.pageSize;
        document.getElementById('pref-auto-save').value = prefs.autoSave;
        document.getElementById('pref-auto-logout').checked = prefs.autoLogout;
    }

    loadNotificationSettings() {
        const notifs = this.settings.notifications;
        
        document.getElementById('notif-new-patient').checked = notifs.newPatient;
        document.getElementById('notif-patient-update').checked = notifs.patientUpdate;
        document.getElementById('notif-new-test').checked = notifs.newTest;
        document.getElementById('notif-critical-results').checked = notifs.criticalResults;
        document.getElementById('notif-test-reminder').checked = notifs.testReminder;
        document.getElementById('notif-system-updates').checked = notifs.systemUpdates;
        document.getElementById('notif-backup-reminder').checked = notifs.backupReminder;
        document.getElementById('notif-security-alerts').checked = notifs.securityAlerts;
        
        document.getElementById('channel-email').checked = notifs.email;
        document.getElementById('channel-browser').checked = notifs.browser;
        document.getElementById('channel-sms').checked = notifs.sms;
        document.getElementById('channel-push').checked = notifs.push;
    }

    loadBackupSettings() {
        const backup = this.settings.backup;
        
        document.getElementById('auto-backup').checked = backup.autoBackup;
        document.getElementById('backup-retention').value = backup.retention;
        document.getElementById('backup-format').value = backup.format;
    }

    setupEventListeners() {
        // حفظ الملف الشخصي
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // تغيير كلمة المرور
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // تفعيل زر الاستعادة
        const restoreConfirm = document.getElementById('restore-confirm');
        const restoreBtn = document.querySelector('.btn-warning');
        
        if (restoreConfirm && restoreBtn) {
            restoreConfirm.addEventListener('change', (e) => {
                restoreBtn.disabled = !e.target.checked;
            });
        }

        // جدولة النسخ الاحتياطي
        const scheduleForm = document.getElementById('scheduleForm');
        if (scheduleForm) {
            scheduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBackupSchedule();
            });
        }

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModal('scheduleModal');
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('new-password');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');

        if (passwordInput && strengthBar && strengthText) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                const strength = this.calculatePasswordStrength(password);
                
                strengthBar.style.width = strength.percentage + '%';
                strengthBar.style.backgroundColor = strength.color;
                strengthText.textContent = strength.text;
            });
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;
        
        const strengths = [
            { percentage: 20, color: '#e74c3c', text: 'ضعيفة جداً' },
            { percentage: 40, color: '#e67e22', text: 'ضعيفة' },
            { percentage: 60, color: '#f1c40f', text: 'متوسطة' },
            { percentage: 80, color: '#2ecc71', text: 'قوية' },
            { percentage: 100, color: '#27ae60', text: 'قوية جداً' }
        ];
        
        return strengths[Math.min(score, strengths.length - 1)];
    }

    saveProfile() {
        const profile = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            phone: document.getElementById('user-phone').value,
            specialty: document.getElementById('user-specialty').value,
            clinic: document.getElementById('user-clinic').value,
            license: document.getElementById('user-license').value,
            bio: document.getElementById('user-bio').value
        };

        this.settings.profile = profile;
        this.saveSettings();
        this.showNotification('تم حفظ الملف الشخصي بنجاح', 'success');
    }

    savePreferences() {
        const preferences = {
            language: document.getElementById('pref-language').value,
            theme: document.getElementById('pref-theme').value,
            timezone: document.getElementById('pref-timezone').value,
            compactMode: document.getElementById('pref-compact').checked,
            animations: document.getElementById('pref-animations').checked,
            highContrast: document.getElementById('pref-highcontrast').checked,
            pageSize: parseInt(document.getElementById('pref-page-size').value),
            autoSave: parseInt(document.getElementById('pref-auto-save').value),
            autoLogout: document.getElementById('pref-auto-logout').checked
        };

        this.settings.preferences = preferences;
        this.saveSettings();
        
        // تطبيق بعض الإعدادات فوراً
        this.applyPreferences(preferences);
        
        this.showNotification('تم حفظ التفضيلات بنجاح', 'success');
    }

    applyPreferences(preferences) {
        // تطبيق اللغة
        if (preferences.language === 'en') {
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr';
        } else {
            document.documentElement.lang = 'ar';
            document.documentElement.dir = 'rtl';
        }

        // تطبيق السمة
        this.applyTheme(preferences.theme);
    }

    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else if (theme === 'auto') {
            // يمكن إضافة كشف تلقائي للوضع المظلم
            document.body.classList.add('theme-light');
        } else {
            document.body.classList.add('theme-light');
        }
    }

    resetPreferences() {
        if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين جميع التفضيلات إلى الإعدادات الافتراضية؟')) {
            this.settings.preferences = this.getDefaultSettings().preferences;
            this.loadPreferenceSettings();
            this.saveSettings();
            this.showNotification('تم إعادة تعيين التفضيلات', 'success');
        }
    }

    saveNotificationSettings() {
        const notifications = {
            newPatient: document.getElementById('notif-new-patient').checked,
            patientUpdate: document.getElementById('notif-patient-update').checked,
            newTest: document.getElementById('notif-new-test').checked,
            criticalResults: document.getElementById('notif-critical-results').checked,
            testReminder: document.getElementById('notif-test-reminder').checked,
            systemUpdates: document.getElementById('notif-system-updates').checked,
            backupReminder: document.getElementById('notif-backup-reminder').checked,
            securityAlerts: document.getElementById('notif-security-alerts').checked,
            email: document.getElementById('channel-email').checked,
            browser: document.getElementById('channel-browser').checked,
            sms: document.getElementById('channel-sms').checked,
            push: document.getElementById('channel-push').checked
        };

        this.settings.notifications = notifications;
        this.saveSettings();
        this.showNotification('تم حفظ إعدادات الإشعارات بنجاح', 'success');
    }

    changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            this.showNotification('كلمتا المرور غير متطابقتين', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
            return;
        }

        // هنا سيتم التحقق من كلمة المرور الحالية مع الخادم
        // هذا تنفيذ مبسط للعرض

        this.settings.security.lastPasswordChange = new Date().toISOString();
        this.saveSettings();
        
        document.getElementById('passwordForm').reset();
        this.showNotification('تم تغيير كلمة المرور بنجاح', 'success');
    }

    logoutSession(sessionId) {
        if (confirm('هل تريد تسجيل الخروج من هذا الجهاز؟')) {
            // تنفيذ تسجيل الخروج من الجلسة
            this.showNotification('تم تسجيل الخروج من الجلسة', 'success');
        }
    }

    logoutAllSessions() {
        if (confirm('هل تريد تسجيل الخروج من جميع الأجهزة؟ هذا سيؤدي إلى خروجك من الجهاز الحالي أيضاً.')) {
            // تنفيذ تسجيل الخروج من جميع الجلسات
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            this.showNotification('جاري تسجيل الخروج من جميع الأجهزة...', 'info');
        }
    }

    viewFullActivity() {
        this.showNotification('عرض سجل النشاط الكامل', 'info');
    }

    createBackup() {
        this.showNotification('جاري إنشاء نسخة احتياطية...', 'info');
        
        // محاكاة عملية النسخ الاحتياطي
        setTimeout(() => {
            const backupData = {
                patients: JSON.parse(localStorage.getItem('patients')) || [],
                tests: JSON.parse(localStorage.getItem('medicalTests')) || [],
                reports: JSON.parse(localStorage.getItem('savedReports')) || [],
                settings: this.settings,
                timestamp: new Date().toISOString()
            };

            // تنزيل الملف
            this.downloadBackup(backupData);
            this.showNotification('تم إنشاء النسخة الاحتياطية بنجاح', 'success');
        }, 2000);
    }

    downloadBackup(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `pulse_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    scheduleBackup() {
        this.showModal('scheduleModal');
    }

    saveBackupSchedule() {
        const schedule = {
            frequency: document.getElementById('schedule-frequency').value,
            day: parseInt(document.getElementById('schedule-day').value),
            time: document.getElementById('schedule-time').value
        };

        this.settings.backup.schedule = schedule;
        this.saveSettings();
        this.hideModal('scheduleModal');
        this.showNotification('تم حفظ جدولة النسخ الاحتياطي', 'success');
    }

    restoreBackup() {
        if (confirm('هل أنت متأكد من رغبتك في استعادة النسخة الاحتياطية؟ هذا سيحل محل جميع البيانات الحالية.')) {
            this.showNotification('جاري استعادة النسخة الاحتياطية...', 'info');
            
            // في التطبيق الحقيقي، هنا سيتم رفع الملف ومعالجته
            setTimeout(() => {
                this.showNotification('تم استعادة النسخة الاحتياطية بنجاح', 'success');
            }, 3000);
        }
    }

    exportData() {
        this.createBackup(); // يستخدم نفس آلية النسخ الاحتياطي
    }

    checkForUpdates() {
        this.showNotification('جاري التحقق من التحديثات...', 'info');
        
        setTimeout(() => {
            this.showNotification('أنت تستخدم أحدث إصدار من النظام', 'success');
        }, 2000);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
    }

    showNotification(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // إضافة الأنماط
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            border-right: 4px solid ${this.getNotificationColor(type)};
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': 'var(--success)',
            'error': 'var(--danger)',
            'warning': 'var(--warning)',
            'info': 'var(--info)'
        };
        return colors[type] || 'var(--info)';
    }
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.settingsManager = new SettingsManager();
});

// تفعيل تبديل اللغة
function initLanguageSwitcher() {
    const langBtn = document.querySelector('.lang-btn');
    
    if (langBtn) {
        langBtn.addEventListener('click', function() {
            const currentLang = document.documentElement.lang;
            const langText = this.querySelector('span');
            
            if (currentLang === 'ar') {
                switchToEnglish();
                langText.textContent = 'العربية';
            } else {
                switchToArabic();
                langText.textContent = 'English';
            }
        });
    }
}

// تهيئة تبديل اللغة
initLanguageSwitcher();