// إدارة بيانات المرضى
class PatientsManager {
    constructor() {
        this.patients = JSON.parse(localStorage.getItem('patients')) || [];
        this.currentView = 'grid';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filteredPatients = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPatients();
        this.updateStats();
        this.setupViewToggle();
    }

    setupEventListeners() {
        // البحث
        const searchInput = document.getElementById('patient-search');
        const searchClear = document.querySelector('.search-clear');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.length > 0) {
                    searchClear.style.display = 'block';
                } else {
                    searchClear.style.display = 'none';
                }
                this.filterPatients();
            });

            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.style.display = 'none';
                this.filterPatients();
            });
        }

        // التصفية
        const genderFilter = document.getElementById('gender-filter');
        const sortBy = document.getElementById('sort-by');

        if (genderFilter) {
            genderFilter.addEventListener('change', () => this.filterPatients());
        }

        if (sortBy) {
            sortBy.addEventListener('change', () => this.filterPatients());
        }

        // التصدير
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPatients());
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

        // نموذج المريض
        const patientForm = document.getElementById('patientForm');
        if (patientForm) {
            patientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePatient();
            });
        }

        // تأكيد الحذف
        const confirmDelete = document.getElementById('confirm-delete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deletePatient());
        }

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hidePatientModal();
                this.hideDeleteModal();
            });
        });
    }

    setupViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const patientsContainer = document.getElementById('patients-container');

        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentView = btn.dataset.view;
                patientsContainer.className = `patients-container ${this.currentView}-view`;
                
                this.renderPatients();
            });
        });
    }

    loadPatients() {
        this.filterPatients();
    }

    filterPatients() {
        const searchTerm = document.getElementById('patient-search').value.toLowerCase();
        const genderFilter = document.getElementById('gender-filter').value;
        const sortBy = document.getElementById('sort-by').value;

        this.filteredPatients = this.patients.filter(patient => {
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.medicalId.toLowerCase().includes(searchTerm);
            
            const matchesGender = !genderFilter || patient.gender === genderFilter;
            
            return matchesSearch && matchesGender;
        });

        // الترتيب
        this.sortPatients(sortBy);
        
        this.currentPage = 1;
        this.renderPatients();
        this.updatePagination();
    }

    sortPatients(sortBy) {
        switch (sortBy) {
            case 'newest':
                this.filteredPatients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                this.filteredPatients.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name':
                this.filteredPatients.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
                break;
        }
    }

    renderPatients() {
        const container = document.getElementById('patients-container');
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPatients = this.filteredPatients.slice(startIndex, endIndex);

        if (currentPatients.length === 0) {
            container.innerHTML = this.getEmptyState();
            document.querySelector('.pagination-footer').style.display = 'none';
            return;
        }

        if (this.currentView === 'grid') {
            container.innerHTML = currentPatients.map(patient => this.createPatientCard(patient)).join('');
        } else {
            container.innerHTML = currentPatients.map(patient => this.createPatientListItem(patient)).join('');
        }

        document.querySelector('.pagination-footer').style.display = 'flex';
    }

    createPatientCard(patient) {
        const age = this.calculateAge(patient.birthDate);
        const createdAt = new Date(patient.createdAt).toLocaleDateString('ar-EG');

        return `
            <div class="patient-card" data-patient-id="${patient.id}">
                <div class="patient-header">
                    <div class="patient-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <h3 class="patient-name">${patient.name}</h3>
                    <div class="patient-medical-id">${patient.medicalId}</div>
                </div>
                <div class="patient-body">
                    <div class="patient-info">
                        <div class="info-item">
                            <span class="info-label">العمر</span>
                            <span class="info-value">${age} سنة</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">الجنس</span>
                            <span class="info-value">${patient.gender}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">فصيلة الدم</span>
                            <span class="info-value">${patient.bloodType || 'غير محدد'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">تاريخ الإضافة</span>
                            <span class="info-value">${createdAt}</span>
                        </div>
                    </div>
                </div>
                <div class="patient-footer">
                    <button class="btn-icon btn-edit" onclick="patientsManager.editPatient('${patient.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-tests" onclick="patientsManager.viewTests('${patient.id}')" title="التحاليل">
                        <i class="fas fa-vial"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="patientsManager.showDeleteModal('${patient.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createPatientListItem(patient) {
        const age = this.calculateAge(patient.birthDate);
        const createdAt = new Date(patient.createdAt).toLocaleDateString('ar-EG');

        return `
            <div class="patient-item" data-patient-id="${patient.id}">
                <div class="list-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="list-info">
                    <div class="list-name">${patient.name}</div>
                    <div class="list-medical-id">${patient.medicalId}</div>
                    <div class="list-detail">${age} سنة</div>
                    <div class="list-detail">${patient.gender}</div>
                    <div class="list-detail">${patient.bloodType || 'غير محدد'}</div>
                </div>
                <div class="list-actions">
                    <button class="btn-icon btn-edit" onclick="patientsManager.editPatient('${patient.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-tests" onclick="patientsManager.viewTests('${patient.id}')" title="التحاليل">
                        <i class="fas fa-vial"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="patientsManager.showDeleteModal('${patient.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-user-plus"></i>
                <h3>لا يوجد مرضى مسجلين بعد</h3>
                <p>ابدأ بإضافة أول مريض إلى النظام</p>
                <button class="btn-primary" onclick="showPatientModal()">إضافة أول مريض</button>
            </div>
        `;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredPatients.length / this.itemsPerPage);
        const currentCount = Math.min(this.itemsPerPage, this.filteredPatients.length - ((this.currentPage - 1) * this.itemsPerPage));
        
        document.getElementById('current-count').textContent = currentCount;
        document.getElementById('total-count').textContent = this.filteredPatients.length;
        
        document.getElementById('prev-btn').disabled = this.currentPage === 1;
        document.getElementById('next-btn').disabled = this.currentPage === totalPages;
        
        this.updatePageNumbers(totalPages);
    }

    updatePageNumbers(totalPages) {
        const pageNumbers = document.querySelector('.page-numbers');
        let pagesHtml = '';
        
        for (let i = 1; i <= totalPages; i++) {
            const active = i === this.currentPage ? 'active' : '';
            pagesHtml += `<span class="page-number ${active}" onclick="patientsManager.goToPage(${i})">${i}</span>`;
        }
        
        pageNumbers.innerHTML = pagesHtml;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderPatients();
        this.updatePagination();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPatients();
            this.updatePagination();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.filteredPatients.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderPatients();
            this.updatePagination();
        }
    }

    updateStats() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const recentPatients = this.patients.filter(patient => {
            const patientDate = new Date(patient.createdAt);
            return patientDate.getMonth() === thisMonth && patientDate.getFullYear() === thisYear;
        });

        const malePatients = this.patients.filter(p => p.gender === 'ذكر').length;
        const femalePatients = this.patients.filter(p => p.gender === 'أنثى').length;

        document.getElementById('total-patients-count').textContent = this.patients.length;
        document.getElementById('male-patients-count').textContent = malePatients;
        document.getElementById('female-patients-count').textContent = femalePatients;
        document.getElementById('recent-patients-count').textContent = recentPatients.length;
    }

    calculateAge(birthDate) {
        if (!birthDate) return 'غير محدد';
        
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    showPatientModal(patientId = null) {
        const modal = document.getElementById('patientModal');
        const title = document.getElementById('patient-modal-title');
        const submitText = document.getElementById('submit-btn-text');
        
        if (patientId) {
            // وضع التعديل
            title.textContent = 'تعديل بيانات المريض';
            submitText.textContent = 'حفظ التعديلات';
            this.fillPatientForm(patientId);
        } else {
            // وضع الإضافة
            title.textContent = 'إضافة مريض جديد';
            submitText.textContent = 'إضافة المريض';
            this.clearPatientForm();
        }
        
        modal.classList.add('show');
    }

    hidePatientModal() {
        const modal = document.getElementById('patientModal');
        modal.classList.remove('show');
    }

    clearPatientForm() {
        document.getElementById('patientForm').reset();
        document.getElementById('patient-id').value = '';
        
        // تعيين الرقم الطبي التلقائي
        const nextId = this.generateMedicalId();
        document.getElementById('patient-medical-id').value = nextId;
    }

    fillPatientForm(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        document.getElementById('patient-id').value = patient.id;
        document.getElementById('patient-name').value = patient.name;
        document.getElementById('patient-medical-id').value = patient.medicalId;
        document.getElementById('patient-gender').value = patient.gender;
        document.getElementById('patient-birthdate').value = patient.birthDate;
        document.getElementById('patient-email').value = patient.email || '';
        document.getElementById('patient-phone').value = patient.phone || '';
        document.getElementById('patient-height').value = patient.height || '';
        document.getElementById('patient-weight').value = patient.weight || '';
        document.getElementById('patient-blood-type').value = patient.bloodType || '';
        document.getElementById('patient-address').value = patient.address || '';
        document.getElementById('patient-notes').value = patient.notes || '';
    }

    generateMedicalId() {
        const lastPatient = this.patients[this.patients.length - 1];
        if (!lastPatient || !lastPatient.medicalId) return 'MED000001';
        
        const lastNumber = parseInt(lastPatient.medicalId.replace('MED', '')) || 0;
        const nextNumber = lastNumber + 1;
        return 'MED' + nextNumber.toString().padStart(6, '0');
    }

    savePatient() {
        const formData = new FormData(document.getElementById('patientForm'));
        const patientId = document.getElementById('patient-id').value;
        
        const patientData = {
            name: formData.get('patient-name'),
            medicalId: formData.get('patient-medical-id'),
            gender: formData.get('patient-gender'),
            birthDate: formData.get('patient-birthdate'),
            email: formData.get('patient-email'),
            phone: formData.get('patient-phone'),
            height: formData.get('patient-height'),
            weight: formData.get('patient-weight'),
            bloodType: formData.get('patient-blood-type'),
            address: formData.get('patient-address'),
            notes: formData.get('patient-notes'),
            updatedAt: new Date().toISOString()
        };

        if (patientId) {
            // تحديث المريض الموجود
            const index = this.patients.findIndex(p => p.id === patientId);
            if (index !== -1) {
                this.patients[index] = { ...this.patients[index], ...patientData };
            }
        } else {
            // إضافة مريض جديد
            patientData.id = 'patient_' + Date.now();
            patientData.createdAt = new Date().toISOString();
            this.patients.push(patientData);
        }

        localStorage.setItem('patients', JSON.stringify(this.patients));
        this.hidePatientModal();
        this.filterPatients();
        this.updateStats();
        
        // إظهار رسالة نجاح
        this.showNotification(patientId ? 'تم تحديث بيانات المريض بنجاح' : 'تم إضافة المريض بنجاح', 'success');
    }

    editPatient(patientId) {
        this.showPatientModal(patientId);
    }

    showDeleteModal(patientId) {
        this.currentDeleteId = patientId;
        const modal = document.getElementById('deleteModal');
        modal.classList.add('show');
    }

    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.classList.remove('show');
        this.currentDeleteId = null;
    }

    deletePatient() {
        if (!this.currentDeleteId) return;

        const patientIndex = this.patients.findIndex(p => p.id === this.currentDeleteId);
        if (patientIndex !== -1) {
            this.patients.splice(patientIndex, 1);
            localStorage.setItem('patients', JSON.stringify(this.patients));
            
            this.filterPatients();
            this.updateStats();
            this.hideDeleteModal();
            
            this.showNotification('تم حذف المريض بنجاح', 'success');
        }
    }

    viewTests(patientId) {
        // الانتقال إلى صفحة التحاليل مع تصفية حسب المريض
        window.location.href = `analysis.html?patient=${patientId}`;
    }

    exportPatients() {
        if (this.patients.length === 0) {
            this.showNotification('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        const csvContent = this.convertToCSV(this.patients);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `patients_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('تم تصدير بيانات المرضى بنجاح', 'success');
    }

    convertToCSV(patients) {
        const headers = ['الاسم', 'الرقم الطبي', 'الجنس', 'تاريخ الميلاد', 'البريد الإلكتروني', 'الهاتف', 'الطول', 'الوزن', 'فصيلة الدم', 'العنوان'];
        const csvRows = [headers.join(',')];
        
        patients.forEach(patient => {
            const row = [
                patient.name,
                patient.medicalId,
                patient.gender,
                patient.birthDate,
                patient.email || '',
                patient.phone || '',
                patient.height || '',
                patient.weight || '',
                patient.bloodType || '',
                patient.address || ''
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    showNotification(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
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
            border-right: 4px solid ${type === 'success' ? 'var(--success)' : 'var(--warning)'};
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
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.patientsManager = new PatientsManager();
});

// دوال عامة للنماذج
function showPatientModal() {
    patientsManager.showPatientModal();
}

// تفعيل تبديل اللغة (مشترك مع dashboard.js)
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