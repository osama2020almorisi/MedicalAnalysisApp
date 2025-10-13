// إدارة التقارير والطباعة
class ReportsManager {
    constructor() {
        this.patients = JSON.parse(localStorage.getItem('patients')) || [];
        this.tests = JSON.parse(localStorage.getItem('medicalTests')) || [];
        this.reports = JSON.parse(localStorage.getItem('savedReports')) || [];
        this.currentReport = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCharts();
        this.updateKPIs();
        this.loadSavedReports();
    }

    setupEventListeners() {
        // نطاق التاريخ المخصص
        const dateRange = document.getElementById('report-date-range');
        const customRange = document.getElementById('custom-date-range');

        if (dateRange && customRange) {
            dateRange.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customRange.style.display = 'grid';
                } else {
                    customRange.style.display = 'none';
                }
            });
        }

        // أزرار الرسوم البيانية
        const chartButtons = document.querySelectorAll('.chart-btn');
        chartButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parent = e.target.closest('.chart-actions');
                parent.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCharts();
            });
        });

        // إغلاق النماذج
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideReportModal();
                this.hidePreviewModal();
                this.hideSavedReportsModal();
            });
        });

        // نموذج التقرير
        const reportForm = document.getElementById('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateReport();
            });
        }

        // تحميل خيارات المرضى
        this.loadPatientOptions();
    }

    loadPatientOptions() {
        const patientSelect = document.getElementById('report-patient');
        if (!patientSelect) return;

        patientSelect.innerHTML = '<option value="">اختر المريض</option>' +
            this.patients.map(patient => 
                `<option value="${patient.id}">${patient.name} - ${patient.medicalId}</option>`
            ).join('');
    }

    showReportModal(type) {
        const modal = document.getElementById('reportModal');
        const title = document.getElementById('report-modal-title');
        document.getElementById('report-type').value = type;

        const titles = {
            'patient': 'تقرير مريض',
            'tests': 'تقرير التحاليل',
            'statistics': 'تقرير إحصائي',
            'financial': 'تقرير مالي'
        };

        title.textContent = titles[type] || 'إنشاء تقرير جديد';
        modal.classList.add('show');
    }

    hideReportModal() {
        const modal = document.getElementById('reportModal');
        modal.classList.remove('show');
    }

    previewReport() {
        const type = document.getElementById('report-type').value;
        const patientId = document.getElementById('report-patient').value;
        const dateRange = document.getElementById('report-date-range').value;
        
        this.currentReport = {
            type,
            patientId,
            dateRange,
            timestamp: new Date().toISOString()
        };

        this.showPreview();
    }

    showPreview() {
        const modal = document.getElementById('previewModal');
        const preview = document.getElementById('report-preview');
        
        preview.innerHTML = this.generateReportPreview();
        modal.classList.add('show');
    }

    hidePreviewModal() {
        const modal = document.getElementById('previewModal');
        modal.classList.remove('show');
    }

    closePreview() {
        this.hidePreviewModal();
        this.showReportModal(this.currentReport.type);
    }

    generateReportPreview() {
        if (!this.currentReport) return '';

        const { type, patientId } = this.currentReport;
        const patient = this.patients.find(p => p.id === patientId);
        const now = new Date();

        switch (type) {
            case 'patient':
                return this.generatePatientReportPreview(patient);
            case 'tests':
                return this.generateTestsReportPreview();
            case 'statistics':
                return this.generateStatisticsReportPreview();
            case 'financial':
                return this.generateFinancialReportPreview();
            default:
                return this.generateDefaultReportPreview();
        }
    }

    generatePatientReportPreview(patient) {
        if (!patient) {
            return `
                <div class="report-preview-container">
                    <div class="report-header">
                        <h1>تقرير المريض</h1>
                        <div class="clinic-info">عيادة Pulse الطبية</div>
                        <div class="report-meta">
                            <div class="meta-item">
                                <div class="meta-label">تاريخ التقرير</div>
                                <div class="meta-value">${new Date().toLocaleDateString('ar-EG')}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">نوع التقرير</div>
                                <div class="meta-value">تقرير مريض</div>
                            </div>
                        </div>
                    </div>
                    <div class="report-body">
                        <div class="empty-state">
                            <i class="fas fa-user-slash"></i>
                            <h3>لم يتم اختيار مريض</h3>
                            <p>يرجى اختيار مريض لإنشاء التقرير</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const patientTests = this.tests.filter(t => t.patientId === patient.id);
        const criticalTests = patientTests.filter(t => t.status === 'critical');
        const recentTests = patientTests.slice(0, 5);

        return `
            <div class="report-preview-container">
                <div class="report-header">
                    <h1>تقرير المريض</h1>
                    <div class="clinic-info">عيادة Pulse الطبية</div>
                    <div class="report-meta">
                        <div class="meta-item">
                            <div class="meta-label">اسم المريض</div>
                            <div class="meta-value">${patient.name}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">الرقم الطبي</div>
                            <div class="meta-value">${patient.medicalId}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">تاريخ التقرير</div>
                            <div class="meta-value">${new Date().toLocaleDateString('ar-EG')}</div>
                        </div>
                    </div>
                </div>

                <div class="report-body">
                    <div class="report-section">
                        <h2>المعلومات الشخصية</h2>
                        <div class="patient-summary">
                            <div class="summary-item">
                                <h3>البيانات الأساسية</h3>
                                <p>الاسم: ${patient.name}</p>
                                <p>الجنس: ${patient.gender}</p>
                                <p>فصيلة الدم: ${patient.bloodType || 'غير محدد'}</p>
                            </div>
                            <div class="summary-item">
                                <h3>المعلومات الطبية</h3>
                                <p>الطول: ${patient.height || 'غير محدد'} سم</p>
                                <p>الوزن: ${patient.weight || 'غير محدد'} كجم</p>
                                <p>العمر: ${this.calculateAge(patient.birthDate) || 'غير محدد'} سنة</p>
                            </div>
                            <div class="summary-item">
                                <h3>معلومات الاتصال</h3>
                                <p>البريد: ${patient.email || 'غير محدد'}</p>
                                <p>الهاتف: ${patient.phone || 'غير محدد'}</p>
                                <p>العنوان: ${patient.address || 'غير محدد'}</p>
                            </div>
                        </div>
                    </div>

                    <div class="report-section">
                        <h2>الإحصائيات</h2>
                        <div class="statistics-grid">
                            <div class="stat-card">
                                <h4>إجمالي التحاليل</h4>
                                <div class="stat-value">${patientTests.length}</div>
                                <div class="stat-label">تحليل طبي</div>
                            </div>
                            <div class="stat-card">
                                <h4>الحالات الحرجة</h4>
                                <div class="stat-value">${criticalTests.length}</div>
                                <div class="stat-label">تحتاج متابعة</div>
                            </div>
                            <div class="stat-card">
                                <h4>آخر تحليل</h4>
                                <div class="stat-value">${patientTests.length > 0 ? new Date(patientTests[0].testDate).toLocaleDateString('ar-EG') : 'لا يوجد'}</div>
                                <div class="stat-label">تاريخ</div>
                            </div>
                        </div>
                    </div>

                    ${recentTests.length > 0 ? `
                    <div class="report-section">
                        <h2>أحدث التحاليل</h2>
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th>نوع التحليل</th>
                                    <th>التاريخ</th>
                                    <th>الحالة</th>
                                    <th>النتيجة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentTests.map(test => `
                                    <tr>
                                        <td>${test.testType}</td>
                                        <td>${new Date(test.testDate).toLocaleDateString('ar-EG')}</td>
                                        <td>
                                            <span class="result-status ${test.status}">
                                                ${this.getStatusText(test.status)}
                                            </span>
                                        </td>
                                        <td>${test.analysis ? test.analysis.substring(0, 50) + '...' : 'لم يتم التحليل'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ` : ''}

                    ${patient.notes ? `
                    <div class="report-section">
                        <h2>ملاحظات طبية</h2>
                        <div class="summary-item">
                            <p>${patient.notes}</p>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="report-footer">
                    <div class="footer-notes">
                        هذا التقرير تم إنشاؤه تلقائياً من نظام Pulse الطبي. يوصى بمراجعة الطبيب المختص لتفسير النتائج بدقة.
                    </div>
                    <div class="doctor-signature">
                        <div>د. أحمد محمد</div>
                        <div>طبيب استشاري</div>
                        <div class="signature-line"></div>
                        <div>التوقيع</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateTestsReportPreview() {
        const totalTests = this.tests.length;
        const normalTests = this.tests.filter(t => t.status === 'normal').length;
        const warningTests = this.tests.filter(t => t.status === 'warning').length;
        const criticalTests = this.tests.filter(t => t.status === 'critical').length;

        const testTypes = {};
        this.tests.forEach(test => {
            testTypes[test.testType] = (testTypes[test.testType] || 0) + 1;
        });

        return `
            <div class="report-preview-container">
                <div class="report-header">
                    <h1>تقرير التحاليل الطبية</h1>
                    <div class="clinic-info">عيادة Pulse الطبية</div>
                    <div class="report-meta">
                        <div class="meta-item">
                            <div class="meta-label">الفترة</div>
                            <div class="meta-value">${this.getDateRangeText()}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">إجمالي التحاليل</div>
                            <div class="meta-value">${totalTests}</div>
                        </div>
                        <div class="meta-item">
                            <div class="meta-label">تاريخ التقرير</div>
                            <div class="meta-value">${new Date().toLocaleDateString('ar-EG')}</div>
                        </div>
                    </div>
                </div>

                <div class="report-body">
                    <div class="report-section">
                        <h2>نظرة عامة</h2>
                        <div class="statistics-grid">
                            <div class="stat-card">
                                <h4>إجمالي التحاليل</h4>
                                <div class="stat-value">${totalTests}</div>
                                <div class="stat-label">تحليل طبي</div>
                            </div>
                            <div class="stat-card">
                                <h4>نتائج طبيعية</h4>
                                <div class="stat-value">${normalTests}</div>
                                <div class="stat-label">${Math.round((normalTests / totalTests) * 100)}%</div>
                            </div>
                            <div class="stat-card">
                                <h4>تحتاج مراجعة</h4>
                                <div class="stat-value">${warningTests}</div>
                                <div class="stat-label">${Math.round((warningTests / totalTests) * 100)}%</div>
                            </div>
                            <div class="stat-card">
                                <h4>حالات حرجة</h4>
                                <div class="stat-value">${criticalTests}</div>
                                <div class="stat-label">${Math.round((criticalTests / totalTests) * 100)}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="report-section">
                        <h2>توزيع أنواع التحاليل</h2>
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th>نوع التحليل</th>
                                    <th>عدد التحاليل</th>
                                    <th>النسبة</th>
                                    <th>آخر تحليل</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(testTypes).map(([type, count]) => {
                                    const lastTest = this.tests
                                        .filter(t => t.testType === type)
                                        .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))[0];
                                    
                                    return `
                                        <tr>
                                            <td>${type}</td>
                                            <td>${count}</td>
                                            <td>${Math.round((count / totalTests) * 100)}%</td>
                                            <td>${lastTest ? new Date(lastTest.testDate).toLocaleDateString('ar-EG') : 'لا يوجد'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="report-section">
                        <h2>التحاليل الحرجة</h2>
                        ${criticalTests > 0 ? `
                            <table class="results-table">
                                <thead>
                                    <tr>
                                        <th>المريض</th>
                                        <th>نوع التحليل</th>
                                        <th>التاريخ</th>
                                        <th>التشخيص</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.tests
                                        .filter(t => t.status === 'critical')
                                        .slice(0, 10)
                                        .map(test => {
                                            const patient = this.patients.find(p => p.id === test.patientId);
                                            return `
                                                <tr>
                                                    <td>${patient ? patient.name : 'مريض محذوف'}</td>
                                                    <td>${test.testType}</td>
                                                    <td>${new Date(test.testDate).toLocaleDateString('ar-EG')}</td>
                                                    <td>${test.analysis || 'لم يتم التحليل'}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="summary-item">
                                <p>لا توجد تحاليل حرجة في الفترة المحددة</p>
                            </div>
                        `}
                    </div>
                </div>

                <div class="report-footer">
                    <div class="footer-notes">
                        تم إنشاء هذا التقرير تلقائياً من نظام إدارة التحاليل الطبية Pulse.
                        جميع البيانات المعروضة تستند إلى السجلات الطبية المسجلة في النظام.
                    </div>
                </div>
            </div>
        `;
    }

    generateStatisticsReportPreview() {
        // تنفيذ مشابه للتقارير الأخرى مع إحصائيات إضافية
        return this.generateTestsReportPreview(); // مؤقت
    }

    generateFinancialReportPreview() {
        // تنفيذ مشابه للتقارير الأخرى مع بيانات مالية
        return this.generateTestsReportPreview(); // مؤقت
    }

    generateDefaultReportPreview() {
        return `
            <div class="report-preview-container">
                <div class="report-header">
                    <h1>تقرير Pulse الطبي</h1>
                    <div class="clinic-info">نظام إدارة العيادة الطبية</div>
                </div>
                <div class="report-body">
                    <div class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <h3>نوع التقرير غير محدد</h3>
                        <p>يرجى اختيار نوع التقرير المناسب</p>
                    </div>
                </div>
            </div>
        `;
    }

    getDateRangeText() {
        const range = document.getElementById('report-date-range').value;
        const ranges = {
            'today': 'اليوم',
            'week': 'أسبوع',
            'month': 'شهر',
            'quarter': 'ربع سنة',
            'year': 'سنة',
            'custom': 'مخصص'
        };
        return ranges[range] || 'جميع الفترات';
    }

    calculateAge(birthDate) {
        if (!birthDate) return null;
        
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    getStatusText(status) {
        const texts = {
            'normal': 'طبيعي',
            'warning': 'يحتاج مراجعة',
            'critical': 'حرج'
        };
        return texts[status] || 'غير محدد';
    }

    generateReport() {
        if (!this.currentReport) return;

        const report = {
            id: 'report_' + Date.now(),
            ...this.currentReport,
            title: this.getReportTitle(this.currentReport.type),
            createdAt: new Date().toISOString(),
            format: document.getElementById('report-format').value
        };

        this.reports.unshift(report);
        localStorage.setItem('savedReports', JSON.stringify(this.reports));

        this.downloadReport();
        this.hidePreviewModal();
        this.showNotification('تم إنشاء التقرير بنجاح', 'success');
    }

    getReportTitle(type) {
        const titles = {
            'patient': 'تقرير مريض',
            'tests': 'تقرير التحاليل',
            'statistics': 'تقرير إحصائي',
            'financial': 'تقرير مالي'
        };
        return titles[type] || 'تقرير غير محدد';
    }

    downloadReport() {
        // في الواقع، هنا سيتم استخدام مكتبات مثل jsPDF أو SheetJS
        // هذا تنفيذ مبسط للعرض
        this.showNotification('جاري تحميل التقرير...', 'info');
        
        setTimeout(() => {
            this.showNotification('تم تحميل التقرير بنجاح', 'success');
        }, 2000);
    }

    printReport() {
        window.print();
    }

    // التقارير السريعة
    generateDailyReport() {
        this.currentReport = { type: 'tests', dateRange: 'today' };
        this.showPreview();
    }

    generateCriticalReport() {
        this.currentReport = { type: 'tests', filter: 'critical' };
        this.showPreview();
    }

    generateAppointmentsReport() {
        this.currentReport = { type: 'statistics', view: 'appointments' };
        this.showPreview();
    }

    printDailyReport() {
        this.generateDailyReport();
        setTimeout(() => this.printReport(), 1000);
    }

    printCriticalReport() {
        this.generateCriticalReport();
        setTimeout(() => this.printReport(), 1000);
    }

    printAppointmentsReport() {
        this.generateAppointmentsReport();
        setTimeout(() => this.printReport(), 1000);
    }

    // الإحصائيات والرسوم البيانية
    loadCharts() {
        this.createTestsDistributionChart();
        this.createResultsPieChart();
        this.createHealthTrendsChart();
    }

    createTestsDistributionChart() {
        const ctx = document.getElementById('testsDistributionChart').getContext('2d');
        
        const data = {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [
                {
                    label: 'سكر الدم',
                    data: [65, 59, 80, 81, 56, 55],
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2
                },
                {
                    label: 'وظائف الكبد',
                    data: [28, 48, 40, 19, 86, 27],
                    backgroundColor: 'rgba(243, 156, 18, 0.2)',
                    borderColor: 'rgba(243, 156, 18, 1)',
                    borderWidth: 2
                },
                {
                    label: 'وظائف الكلى',
                    data: [45, 25, 60, 50, 75, 40],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2
                }
            ]
        };

        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createResultsPieChart() {
        const ctx = document.getElementById('resultsPieChart').getContext('2d');
        
        const data = {
            labels: ['طبيعي', 'يحتاج مراجعة', 'حرج'],
            datasets: [{
                data: [70, 20, 10],
                backgroundColor: [
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ],
                borderColor: [
                    'rgba(46, 204, 113, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 2
            }]
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true
                    }
                }
            }
        });
    }

    createHealthTrendsChart() {
        const ctx = document.getElementById('healthTrendsChart').getContext('2d');
        
        const data = {
            labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
            datasets: [{
                label: 'المرضى الجدد',
                data: [12, 19, 8, 15],
                borderColor: 'rgba(42, 125, 225, 1)',
                backgroundColor: 'rgba(42, 125, 225, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'التحاليل المسجلة',
                data: [18, 25, 12, 22],
                borderColor: 'rgba(46, 204, 113, 1)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true
                    }
                }
            }
        });
    }

    updateCharts() {
        // في التطبيق الحقيقي، هنا سيتم تحديث البيانات حسب الفلاتر
        console.log('Updating charts with new filters...');
    }

    updateKPIs() {
        // تحديث مؤشرات الأداء الرئيسية
        document.getElementById('avg-response-time').textContent = '2.4';
        document.getElementById('success-rate').textContent = '94%';
        document.getElementById('patient-satisfaction').textContent = '4.8';
    }

    // التقارير المحفوظة
    loadSavedReports() {
        const container = document.getElementById('saved-reports-list');
        if (!container) return;

        if (this.reports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>لا توجد تقارير محفوظة</h3>
                    <p>سيظهر هنا التقارير التي تقوم بحفظها</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.reports.slice(0, 5).map(report => `
            <div class="report-item">
                <div class="report-item-icon">
                    <i class="fas fa-file-medical"></i>
                </div>
                <div class="report-item-content">
                    <div class="report-item-title">${report.title}</div>
                    <div class="report-item-meta">
                        <span>${new Date(report.createdAt).toLocaleDateString('ar-EG')}</span>
                        <span>${report.format.toUpperCase()}</span>
                        <span>${this.getDateRangeText(report.dateRange)}</span>
                    </div>
                </div>
                <div class="report-item-actions">
                    <button class="btn-icon btn-primary" onclick="reportsManager.downloadSavedReport('${report.id}')" title="تحميل">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="reportsManager.deleteSavedReport('${report.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showSavedReports() {
        const modal = document.getElementById('savedReportsModal');
        const container = document.getElementById('saved-reports-container');
        
        container.innerHTML = this.reports.map(report => `
            <div class="saved-report-item">
                <div class="saved-report-icon">
                    <i class="fas fa-file-medical"></i>
                </div>
                <div class="saved-report-info">
                    <div class="saved-report-name">${report.title}</div>
                    <div class="saved-report-details">
                        <span>${new Date(report.createdAt).toLocaleDateString('ar-EG')}</span>
                        <span>${report.format.toUpperCase()}</span>
                        <span>${report.patientId ? 'مريض محدد' : 'جميع المرضى'}</span>
                    </div>
                </div>
                <div class="saved-report-actions">
                    <button class="btn-secondary" onclick="reportsManager.downloadSavedReport('${report.id}')">
                        <i class="fas fa-download"></i>
                        تحميل
                    </button>
                    <button class="btn-danger" onclick="reportsManager.deleteSavedReport('${report.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        `).join('');

        modal.classList.add('show');
    }

    hideSavedReportsModal() {
        const modal = document.getElementById('savedReportsModal');
        modal.classList.remove('show');
    }

    downloadSavedReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            this.showNotification(`جاري تحميل ${report.title}`, 'info');
        }
    }

    deleteSavedReport(reportId) {
        this.reports = this.reports.filter(r => r.id !== reportId);
        localStorage.setItem('savedReports', JSON.stringify(this.reports));
        this.loadSavedReports();
        this.showNotification('تم حذف التقرير', 'success');
    }

    showNotification(message, type = 'info') {
        // تنفيذ مشابه للإشعارات في الملفات السابقة
        console.log(`${type}: ${message}`);
    }
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.reportsManager = new ReportsManager();
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