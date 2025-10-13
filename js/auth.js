// نظام المصادقة المحسن مع تأثيرات طبية
class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.isProcessing = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.setupPasswordStrength();
        this.setupMedicalAnimations();
    }

    setupEventListeners() {
        // تسجيل الدخول
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // إنشاء حساب
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // قوة كلمة المرور
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }

        // تأكيد كلمة المرور
        const confirmInput = document.getElementById('confirmPassword');
        if (confirmInput) {
            confirmInput.addEventListener('input', (e) => {
                this.validatePasswordMatch();
            });
        }

        // تأثيرات الحقول
        this.setupInputAnimations();
    }

    setupMedicalAnimations() {
        // تأثيرات للشعار
        const logos = document.querySelectorAll('.nav-logo, .auth-logo');
        logos.forEach(logo => {
            logo.classList.add('medical-heartbeat');
        });

        // تأثيرات للأزرار الرئيسية
        const primaryButtons = document.querySelectorAll('.btn-primary');
        primaryButtons.forEach(btn => {
            btn.classList.add('medical-pulse');
        });
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            // تأثير التركيز
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('input-focused');
                input.style.borderColor = 'var(--medical-blue)';
                input.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)';
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('input-focused');
                input.style.borderColor = '';
                input.style.boxShadow = '';
            });

            // تأثير الكتابة
            input.addEventListener('input', () => {
                if (input.value) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirmPassword');
        
        if (passwordInput && confirmInput) {
            confirmInput.addEventListener('input', (e) => {
                this.validatePasswordMatch();
            });
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.getElementById('password-strength');
        const strengthText = document.getElementById('password-text');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let text = 'ضعيفة جداً';
        let color = '#e74c3c';

        // تحليل قوة كلمة المرور
        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/)) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 25;

        // تحديد المستوى واللون
        if (strength <= 25) {
            text = 'ضعيفة';
            color = 'var(--danger)';
        } else if (strength <= 50) {
            text = 'متوسطة';
            color = 'var(--warning)';
        } else if (strength <= 75) {
            text = 'جيدة';
            color = 'var(--info)';
        } else {
            text = 'قوية جداً';
            color = 'var(--success)';
        }

        // تطبيق التحديثات مع تأثيرات
        strengthBar.style.width = strength + '%';
        strengthBar.style.background = color;
        strengthBar.style.transition = 'all 0.5s ease';
        
        strengthText.textContent = text;
        strengthText.style.color = color;
        strengthText.style.transition = 'all 0.3s ease';

        // تأثير النبض للقوة الجيدة
        if (strength >= 75) {
            strengthBar.classList.add('medical-pulse');
        } else {
            strengthBar.classList.remove('medical-pulse');
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (!password || !confirmPassword) return;

        if (confirmPassword.value && password.value !== confirmPassword.value) {
            confirmPassword.style.borderColor = 'var(--danger)';
            confirmPassword.style.animation = 'shake 0.5s';
            this.showFieldError(confirmPassword, 'كلمات المرور غير متطابقة');
        } else if (confirmPassword.value) {
            confirmPassword.style.borderColor = 'var(--success)';
            confirmPassword.style.animation = 'none';
            this.clearFieldError(confirmPassword);
        } else {
            confirmPassword.style.borderColor = '';
            confirmPassword.style.animation = 'none';
            this.clearFieldError(confirmPassword);
        }
    }

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.color = 'var(--danger)';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
    }

    clearFieldError(field) {
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleLogin() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        
        try {
            // تأثير التحميل
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
                submitBtn.disabled = true;
            }

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember')?.checked;

            // التحقق من البيانات
            if (!this.validateLoginData(email, password)) {
                return;
            }

            // محاكاة التأخير للعرض
            await this.delay(1000);

            // البحث عن المستخدم
            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                if (remember) {
                    localStorage.setItem('rememberMe', 'true');
                }

                this.showNotification('تم تسجيل الدخول بنجاح!', 'success');
                
                // الانتقال إلى لوحة التحكم مع تأثير
                await this.playSuccessAnimation();
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
                this.playErrorAnimation();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('حدث خطأ أثناء التسجيل', 'error');
        } finally {
            this.isProcessing = false;
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
                submitBtn.disabled = false;
            }
        }
    }

    async handleRegister() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        
        try {
            // تأثير التحميل
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء الحساب...';
                submitBtn.disabled = true;
            }

            const formData = new FormData(document.getElementById('registerForm'));
            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                specialty: formData.get('specialty'),
                license: formData.get('license'),
                password: formData.get('password'),
                createdAt: new Date().toISOString(),
                id: 'user_' + Date.now()
            };

            // التحقق من البيانات
            if (!this.validateRegisterData(userData)) {
                return;
            }

            // التحقق من عدم وجود حساب مسبق
            if (this.users.find(u => u.email === userData.email)) {
                this.showNotification('هذا البريد الإلكتروني مسجل مسبقاً', 'error');
                this.playErrorAnimation();
                return;
            }

            // محاكاة التأخير للعرض
            await this.delay(1500);

            // إضافة المستخدم
            this.users.push(userData);
            localStorage.setItem('users', JSON.stringify(this.users));

            // تسجيل الدخول تلقائياً
            this.currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(userData));

            this.showNotification('تم إنشاء الحساب بنجاح!', 'success');
            
            // الانتقال إلى لوحة التحكم مع تأثير
            await this.playSuccessAnimation();
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('حدث خطأ أثناء إنشاء الحساب', 'error');
        } finally {
            this.isProcessing = false;
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> إنشاء الحساب';
                submitBtn.disabled = false;
            }
        }
    }

    validateLoginData(email, password) {
        if (!email || !password) {
            this.showNotification('يرجى ملء جميع الحقول', 'error');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('يرجى إدخال بريد إلكتروني صحيح', 'error');
            return false;
        }

        return true;
    }

    validateRegisterData(data) {
        if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.specialty || !data.license || !data.password) {
            this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return false;
        }

        if (!this.isValidEmail(data.email)) {
            this.showNotification('يرجى إدخال بريد إلكتروني صحيح', 'error');
            return false;
        }

        if (data.password.length < 8) {
            this.showNotification('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'error');
            return false;
        }

        const confirmPassword = document.getElementById('confirmPassword').value;
        if (data.password !== confirmPassword) {
            this.showNotification('كلمتا المرور غير متطابقتين', 'error');
            return false;
        }

        if (!document.getElementById('agreeTerms').checked) {
            this.showNotification('يرجى الموافقة على الشروط والأحكام', 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    checkAuthentication() {
        // منع المستخدم المصادق عليه من الوصول لصفحات التسجيل
        if (this.currentUser) {
            if (window.location.pathname.includes('login.html') || 
                window.location.pathname.includes('register.html')) {
                window.location.href = 'dashboard.html';
            }
        }
        
        // إعادة توجيه المستخدم غير المصادق عليه
        if (!this.currentUser && window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }

    logout() {
        this.playLogoutAnimation();
        setTimeout(() => {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }, 1000);
    }

    async playSuccessAnimation() {
        const container = document.querySelector('.auth-container') || document.querySelector('.container');
        if (container) {
            container.style.transform = 'scale(0.95)';
            container.style.opacity = '0.8';
            await this.delay(300);
            container.style.transform = 'scale(1)';
            container.style.opacity = '1';
            container.style.transition = 'all 0.5s ease';
        }
    }

    playErrorAnimation() {
        const form = document.querySelector('form');
        if (form) {
            form.style.animation = 'shake 0.5s';
            setTimeout(() => {
                form.style.animation = 'none';
            }, 500);
        }
    }

    playLogoutAnimation() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'all 0.5s ease';
    }

    showNotification(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} medical-slide-in`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)} medical-heartbeat"></i>
                <span>${message}</span>
            </div>
        `;
        
        // الأنماط الأساسية
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow-lg);
            border-right: 4px solid ${this.getNotificationColor(type)};
            z-index: 3000;
            max-width: 400px;
            direction: rtl;
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 4 ثوان
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            notification.style.transition = 'all 0.5s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// دوال مساعدة عامة
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        // تأثير عند التبديل
        input.style.transform = 'scale(1.02)';
        setTimeout(() => {
            input.style.transform = 'scale(1)';
        }, 200);
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// تهيئة نظام المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});