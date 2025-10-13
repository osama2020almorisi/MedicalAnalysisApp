// إدارة الإشعارات والتنبيهات
class NotificationsManager {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || this.getSampleNotifications();
        this.filteredNotifications = [];
        this.currentView = 'list';
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.filters = {
            status: 'all',
            type: 'all',
            date: 'all'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyFilters();
        this.updateStats();
        this.setupViewToggle();
    }

    setupEventListeners() {
        // التصفية
        const statusFilter = document.getElementById('status-filter');
        const typeFilter = document.getElementById('type-filter');
        const dateFilter = document.getElementById('date-filter');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.date = e.target.value;
            });
        }

        // التصفح
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('settingsModal');
                this.hideModal('detailModal');
            });
        });

        // تبويبات الإعدادات
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showTab(tab);
                
                tabButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    setupViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const container = document.getElementById('notifications-container');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentView = btn.dataset.view;
                container.className = `notifications-container ${this.currentView}-view`;
                
                this.renderNotifications();
            });
        });
    }

    getSampleNotifications() {
        return [
            {
                id: 'notif_1',
                type: 'critical',
                title: 'نتيجة حرجة تحتاج مراجعة',
                message: 'مريض محمد عبدالله - تحليل سكر الدم أظهر نتائج حرجة تحتاج إلى مراجعة فورية',
                patientId: 'patient_001',
                testId: 'test_001',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // منذ ساعتين
                read: false,
                priority: 'high'
            },
            {
                id: 'notif_2',
                type: 'warning',
                title: 'موعد تحليل دوري',
                message: 'مريض فاطمة أحمد - موعد التحليل الدوري غداً في الساعة 10:00 صباحاً',
                patientId: 'patient_002',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // منذ 5 ساعات
                read: false,
                priority: 'medium'
            },
            {
                id: 'notif_3',
                type: 'info',
                title: 'تحديث النظام',
                message: 'تم إضافة ميزات جديدة لإدارة المرضى والتقارير الطبية',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // منذ يوم
                read: true,
                priority: 'low'
            },
            {
                id: 'notif_4',
                type: 'success',
                title: 'تحليل مكتمل',
                message: 'تم تحليل نتائج مريض خالد سعيد بنجاح - جميع النتائج ضمن المعدل الطبيعي',
                patientId: 'patient_003',
                testId: 'test_002',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // منذ يومين
                read: true,
                priority: 'low'
            },
            {
                id: 'notif_5',
                type: 'reminder',
                title: 'تذكير النسخ الاحتياطي',
                message: 'لم تقم بعمل نسخة احتياطية للنظام منذ أسبوع. نوصي بعمل نسخة احتياطية الآن',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // منذ 3 أيام
                read: true,
                priority: 'medium'
            }
        ];
    }

    applyFilters() {
        this.filteredNotifications = this.notifications.filter(notification => {
            // تصفية حسب الحالة
            const statusMatch = this.filters.status === 'all' || 
                (this.filters.status === 'unread' && !notification.read) ||
                (this.filters.status === 'read' && notification.read);
            
            // تصفية حسب النوع
            const typeMatch = this.filters.type === 'all' || notification.type === this.filters.type;
            
            // تصفية حسب التاريخ
            const dateMatch = this.filterByDate(notification.timestamp, this.filters.date);
            
            return statusMatch && typeMatch && dateMatch;
        });

        // الترتيب حسب الوقت (الأحدث أولاً)
        this.filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        this.currentPage = 1;
        this.renderNotifications();
        this.updatePagination();
        this.updateStats();
    }

    filterByDate(timestamp, filter) {
        if (!filter || filter === 'all') return true;

        const date = new Date(timestamp);
        const now = new Date();
        
        switch (filter) {
            case 'today':
                return date.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return date >= monthAgo;
            default:
                return true;
        }
    }

    resetFilters() {
        document.getElementById('status-filter').value = 'all';
        document.getElementById('type-filter').value = 'all';
        document.getElementById('date-filter').value = 'all';
        
        this.filters = {
            status: 'all',
            type: 'all',
            date: 'all'
        };
        
        this.applyFilters();
    }

    renderNotifications() {
        const container = document.getElementById('notifications-container');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentNotifications = this.filteredNotifications.slice(startIndex, endIndex);

        if (currentNotifications.length === 0) {
            container.innerHTML = this.getEmptyState();
            document.querySelector('.pagination-footer').style.display = 'none';
            return;
        }

        if (this.currentView === 'list') {
            container.innerHTML = currentNotifications.map(notification => this.createNotificationItem(notification)).join('');
        } else {
            container.innerHTML = currentNotifications.map(notification => this.createNotificationCard(notification)).join('');
        }

        document.querySelector('.pagination-footer').style.display = 'flex';
    }

    createNotificationItem(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const iconClass = notification.type;
        const unreadClass = !notification.read ? 'unread' : '';

        return `
            <div class="notification-item ${unreadClass} ${notification.type}" data-notification-id="${notification.id}">
                ${!notification.read ? '<div class="unread-badge"></div>' : ''}
                <div class="notification-icon ${iconClass}">
                    <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <h3 class="notification-title">${notification.title}</h3>
                        <span class="notification-time">${timeAgo}</span>
                    </div>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-meta">
                        <span>${this.getTypeText(notification.type)}</span>
                        ${notification.patientId ? '<span>مرتبط بمريض</span>' : ''}
                        ${notification.priority === 'high' ? '<span>عالي الأولوية</span>' : ''}
                    </div>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `
                        <button class="btn-icon" onclick="notificationsManager.markAsRead('${notification.id}')" title="تعليم كمقروء">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon" onclick="notificationsManager.viewDetails('${notification.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="notificationsManager.deleteNotification('${notification.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createNotificationCard(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const iconClass = notification.type;
        const unreadClass = !notification.read ? 'unread' : '';

        return `
            <div class="notification-card ${unreadClass} ${notification.type}" data-notification-id="${notification.id}">
                <div class="notification-card-header">
                    <div class="notification-card-icon ${iconClass}">
                        <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <h3 class="notification-card-title">${notification.title}</h3>
                    <span class="notification-card-time">${timeAgo}</span>
                </div>
                <p class="notification-card-message">${notification.message}</p>
                <div class="notification-card-meta">
                    <span>${this.getTypeText(notification.type)}</span>
                    <div class="notification-card-actions">
                        ${!notification.read ? `
                            <button class="btn-icon" onclick="notificationsManager.markAsRead('${notification.id}')" title="تعليم كمقروء">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn-icon" onclick="notificationsManager.viewDetails('${notification.id}')" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="notificationsManager.deleteNotification('${notification.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            'critical': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle',
            'success': 'fa-check-circle',
            'reminder': 'fa-bell'
        };
        return icons[type] || 'fa-bell';
    }

    getTypeText(type) {
        const types = {
            'critical': 'حرج',
            'warning': 'تحذير',
            'info': 'معلومات',
            'success': 'نجاح',
            'reminder': 'تذكير'
        };
        return types[type] || 'إشعار';
    }

    getTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return 'الآن';
        } else if (minutes < 60) {
            return `منذ ${minutes} دقيقة`;
        } else if (hours < 24) {
            return `منذ ${hours} ساعة`;
        } else if (days < 7) {
            return `منذ ${days} يوم`;
        } else {
            return date.toLocaleDateString('ar-EG');
        }
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h3>لا توجد إشعارات</h3>
                <p>ستظهر هنا جميع الإشعارات والتنبيهات الخاصة بنظامك</p>
            </div>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
        const currentCount = Math.min(this.itemsPerPage, this.filteredNotifications.length - ((this.currentPage - 1) * this.itemsPerPage));
        
        document.getElementById('current-count').textContent = currentCount;
        document.getElementById('total-count').textContent = this.filteredNotifications.length;
        
        document.getElementById('prev-btn').disabled = this.currentPage === 1;
        document.getElementById('next-btn').disabled = this.currentPage === totalPages;
        
        this.updatePageNumbers(totalPages);
    }

    updatePageNumbers(totalPages) {
        const pageNumbers = document.querySelector('.page-numbers');
        let pagesHtml = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const active = i === this.currentPage ? 'active' : '';
            pagesHtml += `<span class="page-number ${active}" onclick="notificationsManager.goToPage(${i})">${i}</span>`;
        }
        
        pageNumbers.innerHTML = pagesHtml;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderNotifications();
        this.updatePagination();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderNotifications();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderNotifications();
            this.updatePagination();
        }
    }

    updateStats() {
        const total = this.notifications.length;
        const unread = this.notifications.filter(n => !n.read).length;
        const critical = this.notifications.filter(n => n.type === 'critical').length;
        const today = this.notifications.filter(n => {
            const date = new Date(n.timestamp);
            return date.toDateString() === new Date().toDateString();
        }).length;

        document.getElementById('total-notifications').textContent = total;
        document.getElementById('unread-notifications').textContent = unread;
        document.getElementById('critical-notifications').textContent = critical;
        document.getElementById('today-notifications').textContent = today;

        // تحديث العداد في الشريط الجانبي
        const sidebarBadge = document.querySelector('.new-notifications');
        if (sidebarBadge) {
            sidebarBadge.textContent = unread;
        }
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.applyFilters();
            this.showNotification('تم تعليم الإشعار كمقروء', 'success');
        }
    }

    markAllAsRead() {
        if (this.notifications.length === 0) {
            this.showNotification('لا توجد إشعارات', 'info');
            return;
        }

        if (confirm('هل تريد تعليم جميع الإشعارات كمقروءة؟')) {
            this.notifications.forEach(notification => {
                notification.read = true;
            });
            
            this.saveNotifications();
            this.applyFilters();
            this.showNotification('تم تعليم جميع الإشعارات كمقروءة', 'success');
        }
    }

    deleteNotification(notificationId) {
        if (confirm('هل تريد حذف هذا الإشعار؟')) {
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            this.saveNotifications();
            this.applyFilters();
            this.showNotification('تم حذف الإشعار', 'success');
        }
    }

    clearAll() {
        if (this.notifications.length === 0) {
            this.showNotification('لا توجد إشعارات', 'info');
            return;
        }

        if (confirm('هل تريد حذف جميع الإشعارات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            this.notifications = [];
            this.saveNotifications();
            this.applyFilters();
            this.showNotification('تم حذف جميع الإشعارات', 'success');
        }
    }

    viewDetails(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        const modal = document.getElementById('detailModal');
        const title = document.getElementById('notification-title');
        const detail = document.getElementById('notification-detail');

        title.textContent = notification.title;
        
        detail.innerHTML = `
            <div class="detail-header">
                <div class="detail-icon ${notification.type}">
                    <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="detail-title">
                    <h4>${notification.title}</h4>
                    <div class="detail-meta">
                        <span>${this.getTimeAgo(notification.timestamp)}</span>
                        <span>${this.getTypeText(notification.type)}</span>
                        ${notification.priority === 'high' ? '<span>عالي الأولوية</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="detail-content">
                <p>${notification.message}</p>
                ${notification.patientId ? `<p><strong>مرتبط بالمريض:</strong> ${notification.patientId}</p>` : ''}
                ${notification.testId ? `<p><strong>رقم التحليل:</strong> ${notification.testId}</p>` : ''}
            </div>
            <div class="detail-actions">
                ${!notification.read ? `
                    <button class="btn-primary" onclick="notificationsManager.markAsRead('${notification.id}')">
                        <i class="fas fa-check"></i>
                        تعليم كمقروء
                    </button>
                ` : ''}
                <button class="btn-secondary" onclick="notificationsManager.hideModal('detailModal')">
                    <i class="fas fa-times"></i>
                    إغلاق
                </button>
            </div>
        `;

        modal.classList.add('show');

        // تعليم كمقروء عند العرض
        if (!notification.read) {
            this.markAsRead(notificationId);
        }
    }

    showTab(tab) {
        const panes = document.querySelectorAll('.tab-pane');
        panes.forEach(pane => pane.classList.remove('active'));
        
        const targetPane = document.getElementById(`${tab}-tab`);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }

    showSettings() {
        this.showModal('settingsModal');
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
        // حفظ إعدادات الإشعارات
        this.showNotification('تم حفظ الإعدادات بنجاح', 'success');
        this.hideModal('settingsModal');
    }

    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
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

    getNotificationColor(type) {
        const colors = {
            'success': 'var(--success)',
            'error': 'var(--danger)',
            'warning': 'var(--warning)',
            'info': 'var(--info)'
        };
        return colors[type] || 'var(--info)';
    }

    // دالة لإضافة إشعار جديد (يمكن استدعاؤها من أجزاء أخرى في النظام)
    addNotification(notification) {
        const newNotification = {
            id: 'notif_' + Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        this.notifications.unshift(newNotification);
        this.saveNotifications();
        this.applyFilters();
        
        // إظهار إشعار للمستخدم
        this.showDesktopNotification(newNotification);
    }

    showDesktopNotification(notification) {
        // التحقق من دعم الإشعارات في المتصفح
        if (!("Notification" in window)) {
            return;
        }

        // طلب الإذن لعرض الإشعارات
        if (Notification.permission === "granted") {
            this.createDesktopNotification(notification);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    this.createDesktopNotification(notification);
                }
            });
        }
    }

    createDesktopNotification(notification) {
        const options = {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: notification.id,
            requireInteraction: notification.priority === 'high'
        };

        const desktopNotification = new Notification(notification.title, options);
        
        desktopNotification.onclick = () => {
            window.focus();
            this.viewDetails(notification.id);
            desktopNotification.close();
        };

        // إغلاق الإشعار تلقائياً بعد 5 ثوان (ما لم يكن عالي الأولوية)
        if (notification.priority !== 'high') {
            setTimeout(() => {
                desktopNotification.close();
            }, 5000);
        }
    }
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.notificationsManager = new NotificationsManager();
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