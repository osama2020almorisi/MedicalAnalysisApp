// نظام إدارة اللغة المحسن
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'ar';
        this.translations = {};
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadTranslations();
            this.applyLanguage(this.currentLang);
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('LanguageManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize LanguageManager:', error);
        }
    }

    async loadTranslations() {
        this.translations = {
            ar: {
                // التنقل
                "features": "المميزات",
                "about": "عن النظام",
                "contact": "اتصل بنا",
                "login": "تسجيل الدخول",
                "register": "إنشاء حساب",
                "language": "English",
                
                // القسم الرئيسي
                "hero_title": "النظام الصحي الذكي",
                "hero_highlight": "لتحليل التحاليل الطبية",
                "hero_description": "نظام متكامل لإدارة المرضى وتحليل التحاليل الطبية وتقديم توصيات ذكية مخصصة. سجل الآن وتمتع بأحدث أدوات الرعاية الصحية.",
                "get_started": "ابدأ مجاناً",
                "watch_demo": "شاهد الفيديو",
                "doctors_registered": "طبيب مسجل",
                "monthly_tests": "تحليل شهري",
                "satisfaction_rate": "رضا العملاء",
                
                // معاينة اللوحة
                "dashboard": "لوحة التحكم",
                "patients": "المرضى",
                "analysis": "التحاليل",
                "total_patients": "إجمالي المرضى",
                "tests_today": "تحليل اليوم",
                "live_preview": "عرض حي للنظام",
                
                // المميزات
                "features_title": "مميزات النظام",
                "features_subtitle": "اكتشف القوة الكاملة لنظام Pulse الصحي",
                "feature1_title": "إدارة المرضى",
                "feature1_desc": "نظام متكامل لإدارة سجلات المرضى ومعلوماتهم الطبية بشكل آمن ومنظم",
                "feature2_title": "تحليل التحاليل",
                "feature2_desc": "تحليل ذكي للتحاليل الطبية مع تقديم توصيات مخصصة حسب حالة كل مريض",
                "feature3_title": "التنبيهات الذكية",
                "feature3_desc": "نظام تنبيهات ذكي للإشعارات المهمة والنتائج الحرجة التي تحتاج متابعة",
                "feature4_title": "التقارير والإحصائيات",
                "feature4_desc": "تقارير شاملة وإحصائيات تفصيلية لمتابعة تطور الحالات الصحية",
                "feature5_title": "واجهة متجاوبة",
                "feature5_desc": "تصميم متكامل يعمل على جميع الأجهزة من حواسيب وهواتف وأجهزة لوحية",
                "feature6_title": "أمان وحماية",
                "feature6_desc": "نظام أمان متكامل يحمي بيانات المرضى ويضمن الخصوصية التامة",
                
                // كيفية العمل
                "how_it_works_title": "كيف يعمل النظام؟",
                "how_it_works_subtitle": "3 خطوات بسيطة لبدء استخدام Pulse",
                "step1_title": "أنشئ حسابك",
                "step1_desc": "سجل في النظام خلال دقائق باستخدام بريدك الإلكتروني",
                "step2_title": "أضف مرضاك",
                "step2_desc": "ابدأ بإضافة مرضاك وإنشاء سجلاتهم الطبية",
                "step3_title": "حلل النتائج",
                "step3_desc": "استخدم أدوات التحليل الذكية للحصول على توصيات مخصصة",
                
                // الدعوة للعمل
                "cta_title": "جاهز للبدء؟",
                "cta_subtitle": "انضم إلى آلاف الأطباء الذين يثقون في Pulse لإدارة عياداتهم",
                "create_account": "أنشئ حسابك المجاني الآن",
                "signup_time": "يسغرق التسجيل أقل من دقيقتين",
                
                // التذييل
                "footer_description": "نظام طبي ذكي متكامل لتحليل التحاليل الطبية وإدارة الرعاية الصحية",
                "quick_links": "روابط سريعة",
                "home": "الرئيسية",
                "support": "الدعم",
                "help": "المساعدة",
                "faq": "الأسئلة الشائعة",
                "terms": "الشروط والأحكام",
                "privacy": "الخصوصية",
                "contact_us": "اتصل بنا",
                "location": "الرياض، السعودية",
                "all_rights_reserved": "جميع الحقوق محفوظة.",
                
                // صفحات المصادقة
                "back_home": "العودة للرئيسية",
                "welcome_back": "مرحباً بعودتك!",
                "login_subtitle": "سجل الدخول للمتابعة إلى حسابك",
                "email": "البريد الإلكتروني",
                "email_placeholder": "ادخل بريدك الإلكتروني",
                "password": "كلمة المرور",
                "password_placeholder": "ادخل كلمة المرور",
                "remember_me": "تذكرني",
                "forgot_password": "نسيت كلمة المرور؟",
                "login_button": "تسجيل الدخول",
                "or": "أو",
                "continue_google": "متابعة مع Google",
                "no_account": "ليس لديك حساب؟",
                "create_account": "أنشئ حساب جديد",
                "system_name": "نظام Pulse الصحي",
                "system_description": "انضم إلى آلاف الأطباء الذين يثقون في نظامنا لإدارة عياداتهم وتحليل التحاليل الطبية",
                "testimonial_text": "Pulse غير طريقة عملي تماماً. وفر لي ساعات من العمل وأعطاني رؤى لم أكن أحلم بها",
                "doctor_name": "د. أحمد محمد",
                "doctor_specialty": "طبيب استشاري",
                
                // صفحة التسجيل
                "create_account_title": "أنشئ حسابك!",
                "create_account_subtitle": "انضم إلى نظام Pulse الصحي الذكي",
                "first_name": "الاسم الأول",
                "first_name_placeholder": "ادخل الاسم الأول",
                "last_name": "اسم العائلة",
                "last_name_placeholder": "ادخل اسم العائلة",
                "phone": "رقم الهاتف",
                "phone_placeholder": "ادخل رقم الهاتف",
                "specialty": "التخصص الطبي",
                "choose_specialty": "اختر تخصصك",
                "general_medicine": "طب عام",
                "internal_medicine": "باطنية",
                "cardiology": "قلب",
                "endocrinology": "غدد صماء",
                "other_specialty": "تخصص آخر",
                "license": "رقم الترخيص الطبي",
                "license_placeholder": "ادخل رقم الترخيص",
                "confirm_password": "تأكيد كلمة المرور",
                "confirm_password_placeholder": "أعد إدخال كلمة المرور",
                "password_strength": "قوة كلمة المرور",
                "agree_terms": "أوافق على",
                "terms": "الشروط والأحكام",
                "privacy": "سياسة الخصوصية",
                "create_account_button": "إنشاء الحساب",
                "signup_google": "التسجيل مع Google",
                "have_account": "لديك حساب بالفعل؟",
                "login_link": "سجل الدخول",
                "start_journey": "ابدأ رحلتك مع Pulse",
                "journey_description": "انضم إلى مجتمعنا الطبي واستفد من أحدث تقنيات الذكاء الاصطناعي في تحليل التحاليل الطبية",
                "benefit1": "إدارة كاملة للمرضى",
                "benefit2": "تحليل ذكي للتحاليل",
                "benefit3": "توصيات مخصصة",
                "benefit4": "تقارير متقدمة",
                "benefit5": "دعم فني 24/7",
                "testimonial_text_register": "منذ أن بدأت استخدام Pulse، تمكنت من تحسين جودة الرعاية التي أقدمها لمرضاي بشكل ملحوظ",
                "doctor_name_female": "د. فاطمة أحمد",
                "doctor_specialty_female": "أخصائية باطنية"
            },
            en: {
                // Navigation
                "features": "Features",
                "about": "About",
                "contact": "Contact",
                "login": "Login",
                "register": "Register",
                "language": "العربية",
                
                // Hero Section
                "hero_title": "Smart Health System",
                "hero_highlight": "For Medical Analysis",
                "hero_description": "A comprehensive system for patient management, medical test analysis, and personalized smart recommendations. Register now and enjoy the latest healthcare tools.",
                "get_started": "Get Started Free",
                "watch_demo": "Watch Demo",
                "doctors_registered": "Doctors Registered",
                "monthly_tests": "Monthly Tests",
                "satisfaction_rate": "Satisfaction Rate",
                
                // Dashboard Preview
                "dashboard": "Dashboard",
                "patients": "Patients",
                "analysis": "Analysis",
                "total_patients": "Total Patients",
                "tests_today": "Tests Today",
                "live_preview": "Live System Preview",
                
                // Features
                "features_title": "System Features",
                "features_subtitle": "Discover the full power of Pulse Health System",
                "feature1_title": "Patient Management",
                "feature1_desc": "Complete system for managing patient records and medical information securely and organized",
                "feature2_title": "Test Analysis",
                "feature2_desc": "Smart analysis of medical tests with personalized recommendations for each patient",
                "feature3_title": "Smart Notifications",
                "feature3_desc": "Intelligent alert system for important notifications and critical results needing follow-up",
                "feature4_title": "Reports & Statistics",
                "feature4_desc": "Comprehensive reports and detailed statistics to track health progress",
                "feature5_title": "Responsive Interface",
                "feature5_desc": "Complete design that works on all devices from computers to phones and tablets",
                "feature6_title": "Security & Protection",
                "feature6_desc": "Complete security system that protects patient data and ensures complete privacy",
                
                // How it Works
                "how_it_works_title": "How It Works?",
                "how_it_works_subtitle": "3 simple steps to start using Pulse",
                "step1_title": "Create Your Account",
                "step1_desc": "Register in the system in minutes using your email",
                "step2_title": "Add Your Patients",
                "step2_desc": "Start adding your patients and creating their medical records",
                "step3_title": "Analyze Results",
                "step3_desc": "Use smart analysis tools to get personalized recommendations",
                
                // Call to Action
                "cta_title": "Ready to Start?",
                "cta_subtitle": "Join thousands of doctors who trust Pulse to manage their clinics",
                "create_account": "Create Your Free Account Now",
                "signup_time": "Registration takes less than 2 minutes",
                
                // Footer
                "footer_description": "Smart medical system for medical test analysis and healthcare management",
                "quick_links": "Quick Links",
                "home": "Home",
                "support": "Support",
                "help": "Help",
                "faq": "FAQ",
                "terms": "Terms & Conditions",
                "privacy": "Privacy",
                "contact_us": "Contact Us",
                "location": "Riyadh, Saudi Arabia",
                "all_rights_reserved": "All rights reserved.",
                
                // Authentication Pages
                "back_home": "Back to Home",
                "welcome_back": "Welcome Back!",
                "login_subtitle": "Sign in to continue to your account",
                "email": "Email Address",
                "email_placeholder": "Enter your email",
                "password": "Password",
                "password_placeholder": "Enter your password",
                "remember_me": "Remember me",
                "forgot_password": "Forgot password?",
                "login_button": "Sign In",
                "or": "Or",
                "continue_google": "Continue with Google",
                "no_account": "Don't have an account?",
                "create_account": "Create new account",
                "system_name": "Pulse Health System",
                "system_description": "Join thousands of doctors who trust our system to manage their clinics and analyze medical tests",
                "testimonial_text": "Pulse completely changed my workflow. It saved me hours of work and gave me insights I never dreamed of",
                "doctor_name": "Dr. Ahmed Mohamed",
                "doctor_specialty": "Consultant Physician",
                
                // Register Page
                "create_account_title": "Create Your Account!",
                "create_account_subtitle": "Join the Pulse smart health system",
                "first_name": "First Name",
                "first_name_placeholder": "Enter first name",
                "last_name": "Last Name",
                "last_name_placeholder": "Enter last name",
                "phone": "Phone Number",
                "phone_placeholder": "Enter phone number",
                "specialty": "Medical Specialty",
                "choose_specialty": "Choose your specialty",
                "general_medicine": "General Medicine",
                "internal_medicine": "Internal Medicine",
                "cardiology": "Cardiology",
                "endocrinology": "Endocrinology",
                "other_specialty": "Other Specialty",
                "license": "Medical License Number",
                "license_placeholder": "Enter license number",
                "confirm_password": "Confirm Password",
                "confirm_password_placeholder": "Re-enter password",
                "password_strength": "Password Strength",
                "agree_terms": "I agree to the",
                "terms": "Terms & Conditions",
                "privacy": "Privacy Policy",
                "create_account_button": "Create Account",
                "signup_google": "Sign up with Google",
                "have_account": "Already have an account?",
                "login_link": "Sign In",
                "start_journey": "Start Your Journey with Pulse",
                "journey_description": "Join our medical community and benefit from the latest AI technologies in medical test analysis",
                "benefit1": "Complete patient management",
                "benefit2": "Smart test analysis",
                "benefit3": "Personalized recommendations",
                "benefit4": "Advanced reports",
                "benefit5": "24/7 technical support",
                "testimonial_text_register": "Since I started using Pulse, I've been able to significantly improve the quality of care I provide to my patients",
                "doctor_name_female": "Dr. Fatima Ahmed",
                "doctor_specialty_female": "Internal Medicine Specialist"
            }
        };
    }

    setupEventListeners() {
        // تبديل اللغة
        const langToggle = document.getElementById('langToggle');
        const langOptions = document.querySelectorAll('.lang-option');

        if (langToggle) {
            langToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = langToggle.closest('.language-switcher').querySelector('.lang-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('show');
                }
            });
        }

        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lang = option.dataset.lang;
                if (lang) {
                    this.switchLanguage(lang);
                }
                const dropdown = option.closest('.lang-dropdown');
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
            });
        });

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-switcher')) {
                const dropdowns = document.querySelectorAll('.lang-dropdown');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });

        // إعادة تطبيق اللغة عند تغيير الصفحة
        document.addEventListener('pageChanged', () => {
            this.applyLanguage(this.currentLang);
        });
    }

    switchLanguage(lang) {
        if (this.currentLang !== lang && this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.applyLanguage(lang);
            this.updatePageDirection(lang);
            this.dispatchLanguageChangeEvent(lang);
            
            // تأثير بصري عند تغيير اللغة
            this.playLanguageSwitchAnimation();
        }
    }

    applyLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Translations for language "${lang}" not found`);
            return;
        }

        // تحديث العناصر ذات data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            this.updateElementText(element, lang);
        });

        // تحديث العناصر ذات data-i18n-ph (placeholders)
        const placeholderElements = document.querySelectorAll('[data-i18n-ph]');
        placeholderElements.forEach(element => {
            this.updateElementPlaceholder(element, lang);
        });

        // تحديث محتوى options في select
        const selectOptions = document.querySelectorAll('select option[data-i18n]');
        selectOptions.forEach(option => {
            this.updateElementText(option, lang);
        });

        // تحديث زر اللغة
        this.updateLanguageButton(lang);
    }

    updateElementText(element, lang) {
        const key = element.getAttribute('data-i18n');
        const translation = this.translations[lang]?.[key];
        
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
            
            // تأثير عند تغيير النص
            element.style.opacity = '0';
            element.style.transform = 'translateY(10px)';
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.style.transition = 'all 0.3s ease';
            }, 50);
        }
    }

    updateElementPlaceholder(element, lang) {
        const key = element.getAttribute('data-i18n-ph');
        const translation = this.translations[lang]?.[key];
        
        if (translation) {
            element.placeholder = translation;
        }
    }

    updateLanguageButton(lang) {
        const langBtn = document.querySelector('.lang-btn span');
        const translation = this.translations[lang]?.['language'];
        
        if (langBtn && translation) {
            langBtn.textContent = translation;
        }
    }

    updatePageDirection(lang) {
        const html = document.documentElement;
        
        if (lang === 'ar') {
            html.dir = 'rtl';
            html.lang = 'ar';
            html.classList.add('rtl');
            html.classList.remove('ltr');
        } else {
            html.dir = 'ltr';
            html.lang = 'en';
            html.classList.add('ltr');
            html.classList.remove('rtl');
        }
    }

    playLanguageSwitchAnimation() {
        const mainContent = document.querySelector('.auth-container') || document.querySelector('.container');
        if (mainContent) {
            mainContent.style.opacity = '0.7';
            mainContent.style.transform = 'scale(0.98)';
            mainContent.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                mainContent.style.opacity = '1';
                mainContent.style.transform = 'scale(1)';
            }, 300);
        }
    }

    dispatchLanguageChangeEvent(lang) {
        const event = new CustomEvent('languageChanged', {
            detail: { language: lang }
        });
        document.dispatchEvent(event);
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    translate(key, lang = this.currentLang) {
        return this.translations[lang]?.[key] || key;
    }

    addTranslation(lang, key, value) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang][key] = value;
        
        if (lang === this.currentLang) {
            this.applyLanguage(lang);
        }
    }

    isReady() {
        return this.isInitialized;
    }
}

// تهيئة مدير اللغة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.languageManager = new LanguageManager();
});