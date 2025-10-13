// إدارة البيانات الحقيقية من المستخدم
class MedicalDashboard {
    constructor() {
        this.patients = JSON.parse(localStorage.getItem('patients')) || [];
        this.tests = JSON.parse(localStorage.getItem('medicalTests')) || [];
        this.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.updateStats();
        this.loadRecentData();
        this.setupSearch();
    }

    setupEventListeners() {
        // تبديل الشريط الجانبي للهواتف
        const menuToggle = document.querySelector('.menu-toggle');
        const closeSidebar = document.querySelector('.close-sidebar');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('show');
                overlay.style.display = 'block';
            });
        }

        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
            });
        }

        // إغلاق النماذج
        const closeModalButtons = document.querySelectorAll('.close-modal');
        closeModalButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideAppointmentModal();
            });
        });

        // نموذج حجز الموعد
        const appointmentForm = document.getElementById('appointmentForm');
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAppointment();
            });
        }

        // تفعيل الإحصائيات كأزرار
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.handleStatCardClick(index);
            });
        });
    }

    loadDashboardData() {
        // تحديث رسالة الترحيب
        const user = JSON.parse(localStorage.getItem('currentUser')) || { name: 'د. أحمد' };
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = `مرحباً بعودتك، ${user.name}`;
        }

        // تحديث عدد الإشعارات
        const newNotifications = this.notifications.filter(n => !n.read).length;
        const newTests = this.tests.filter(t => t.status === 'pending').length;

        document.querySelector('.new-notifications').textContent = newNotifications;
        document.querySelector('.new-tests').textContent = newTests;
    }

    updateStats() {
        document.getElementById('total-patients').textContent = this.patients.length;
        document.getElementById('total-tests').textContent = this.tests.length;
        
        const pendingReviews = this.tests.filter(t => 
            t.status === 'critical' || t.status === 'warning'
        ).length;
        document.getElementById('pending-reviews').textContent = pendingReviews;

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcoming = this.appointments.filter(a => {
            const appDate = new Date(a.date);
            return appDate <= nextWeek && appDate >= new Date();
        }).length;
        document.getElementById('upcoming-appointments').textContent = upcoming;
    }

    loadRecentData() {
        this.loadRecentPatients();
        this.loadRecentTests();
        this.loadNotifications();
    }

    loadRecentPatients() {
        const container = document.getElementById('recent-patients-list');
        if (!container) return;

        const recentPatients = this.patients.slice(-5).reverse();

        if (recentPatients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <p>لا يوجد مرضى مسجلين بعد</p>
                    <button class="btn-primary" onclick="location.href='add-patient.html'">إضافة أول مريض</button>
                </div>
            `;
            return;
        }

        container.innerHTML = recentPatients.map(patient => `
            <div class="patient-item">
                <div class="patient-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="patient-info">
                    <h4>${patient.name}</h4>
                    <p>الرقم الطبي: ${patient.medicalId}</p>
                    <small>تم الإضافة: ${this.formatDate(patient.createdAt)}</small>
                </div>
                <div class="patient-status">
                    <span class="status-badge new">جديد</span>
                </div>
            </div>
        `).join('');
    }

    loadRecentTests() {
        const container = document.getElementById('recent-tests-list');
        if (!container) return;

        const recentTests = this.tests.slice(-5).reverse();

        if (recentTests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-vial"></i>
                    <p>لا توجد تحاليل مسجلة بعد</p>
                    <button class="btn-primary" onclick="location.href='add-test.html'">تسجيل أول تحليل</button>
                </div>
            `;
            return;
        }

        container.innerHTML = recentTests.map(test => {
            const patient = this.patients.find(p => p.id === test.patientId);
            const statusClass = this.getTestStatusClass(test.status);
            const statusIcon = this.getTestStatusIcon(test.status);
            const statusText = this.getTestStatusText(test.status);

            return `
                <div class="test-item">
                    <div class="test-type">
                        <i class="fas ${this.getTestTypeIcon(test.testType)}"></i>
                        <span>${test.testType}</span>
                    </div>
                    <div class="test-patient">
                        <strong>${patient ? patient.name : 'مريض محذوف'}</strong>
                        <span>${patient ? patient.medicalId : 'N/A'}</span>
                    </div>
                    <div class="test-date">
                        <i class="far fa-calendar"></i>
                        <span>${this.formatDate(test.testDate)}</span>
                    </div>
                    <div class="test-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        <span>${statusText}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadNotifications() {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        const importantNotifications = this.notifications
            .filter(n => n.important)
            .slice(-5)
            .reverse();

        if (importantNotifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>لا توجد إشعارات حالياً</p>
                </div>
            `;
            return;
        }

        container.innerHTML = importantNotifications.map(notification => {
            const typeClass = this.getNotificationTypeClass(notification.type);
            const typeIcon = this.getNotificationTypeIcon(notification.type);

            return `
                <div class="notification-item ${typeClass}">
                    <div class="notification-icon">
                        <i class="fas ${typeIcon}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notification.title}</h4>
                        <p>${notification.message}</p>
                        <span class="notification-time">${this.formatTime(notification.date)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupSearch() {
        const searchInput = document.getElementById('global-search');
        const searchClear = document.querySelector('.search-clear');

        if (searchInput && searchClear) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 0) {
                    searchClear.style.display = 'block';
                    this.performSearch(e.target.value);
                } else {
                    searchClear.style.display = 'none';
                    this.clearSearch();
                }
            });

            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.style.display = 'none';
                this.clearSearch();
            });
        }
    }

    performSearch(query) {
        query = query.toLowerCase();
        
        // البحث في المرضى
        const patientResults = this.patients.filter(patient =>
            patient.name.toLowerCase().includes(query) ||
            patient.medicalId.toLowerCase().includes(query)
        );

        // البحث في التحاليل
        const testResults = this.tests.filter(test =>
            test.testType.toLowerCase().includes(query)
        );

        // عرض نتائج البحث (يمكن تطوير هذا الجزء)
        console.log('نتائج البحث:', { patientResults, testResults });
    }

    clearSearch() {
        // إعادة تحميل البيانات العادية
        this.loadRecentData();
    }

    // دالة مساعدة للحصول على أيقونة نوع التحليل
    getTestTypeIcon(testType) {
        const icons = {
            'سكر الدم': 'fa-tint',
            'وظائف الكبد': 'fa-liver',
            'وظائف الكلى': 'fa-kidney',
            'تحليل الدم الكامل': 'fa-vial'
        };
        return icons[testType] || 'fa-vial';
    }

    // دوال مساعدة للحالة
    getTestStatusClass(status) {
        const classes = {
            'normal': 'normal',
            'warning': 'warning',
            'critical': 'critical',
            'pending': 'warning'
        };
        return classes[status] || 'warning';
    }

    getTestStatusIcon(status) {
        const icons = {
            'normal': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle',
            'critical': 'fa-exclamation-circle',
            'pending': 'fa-clock'
        };
        return icons[status] || 'fa-clock';
    }

    getTestStatusText(status) {
        const texts = {
            'normal': 'طبيعي',
            'warning': 'يحتاج مراجعة',
            'critical': 'حرج',
            'pending': 'قيد الانتظار'
        };
        return texts[status] || 'قيد الانتظار';
    }

    // دوال مساعدة للإشعارات
    getNotificationTypeClass(type) {
        const classes = {
            'urgent': 'urgent',
            'reminder': 'reminder',
            'info': 'info'
        };
        return classes[type] || 'info';
    }

    getNotificationTypeIcon(type) {
        const icons = {
            'urgent': 'fa-exclamation-triangle',
            'reminder': 'fa-calendar-alt',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    // دوال مساعدة للتنسيق
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG');
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) {
            return `منذ ${minutes} دقيقة`;
        } else if (hours < 24) {
            return `منذ ${hours} ساعة`;
        } else {
            return `منذ ${days} يوم`;
        }
    }

    // معالجة النقر على بطاقات الإحصائيات
    handleStatCardClick(index) {
        const actions = [
            () => location.href = 'patients.html',
            () => location.href = 'add-test.html',
            () => location.href = 'analysis.html?filter=pending',
            () => this.showAppointmentModal()
        ];
        
        if (actions[index]) {
            actions[index]();
        }
    }

    // إدارة نموذج حجز الموعد
    showAppointmentModal() {
        const modal = document.getElementById('appointmentModal');
        const patientSelect = document.getElementById('patientSelect');
        
        // تعبئة قائمة المرضى
        patientSelect.innerHTML = '<option value="">اختر المريض</option>' +
            this.patients.map(patient => 
                `<option value="${patient.id}">${patient.name} - ${patient.medicalId}</option>`
            ).join('');
        
        // تعيين التاريخ الافتراضي (غداً)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('appointmentDate').value = tomorrow.toISOString().split('T')[0];
        
        modal.classList.add('show');
    }

    hideAppointmentModal() {
        const modal = document.getElementById('appointmentModal');
        modal.classList.remove('show');
    }

    saveAppointment() {
        const form = document.getElementById('appointmentForm');
        const formData = new FormData(form);
        
        const appointment = {
            id: 'appt_' + Date.now(),
            patientId: formData.get('patientSelect'),
            date: formData.get('appointmentDate'),
            time: formData.get('appointmentTime'),
            type: formData.get('appointmentType'),
            createdAt: new Date().toISOString(),
            status: 'scheduled'
        };

        this.appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
        
        // إضافة إشعار
        const patient = this.patients.find(p => p.id === appointment.patientId);
        this.addNotification({
            title: 'موعد جديد',
            message: `تم حجز موعد ${appointment.type} للمريض ${patient?.name || 'غير معروف'}`,
            type: 'reminder',
            important: true,
            date: new Date().toISOString(),
            read: false
        });

        this.hideAppointmentModal();
        form.reset();
        this.updateStats();
        
        alert('تم حجز الموعد بنجاح!');
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        this.loadNotifications();
        
        // تحديث العداد
        const badge = document.querySelector('.new-notifications');
        if (badge) {
            const count = parseInt(badge.textContent) + 1;
            badge.textContent = count;
        }
    }
}

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

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new MedicalDashboard();
    initLanguageSwitcher();
});