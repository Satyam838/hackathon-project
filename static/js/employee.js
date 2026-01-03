// Global variables
let employeeProfile = {};
let myAttendance = [];
let myLeaveRequests = [];
let myPayroll = [];
let currentSection = 'profile';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadEmployeeProfile();
    showSection('profile');
    
    // Set today's date as default for filters
    const today = new Date().toISOString().split('T')[0];
    const attendanceDateFilterEl = document.getElementById('attendanceDateFilter');
    if (attendanceDateFilterEl) {
        attendanceDateFilterEl.value = today;
    }
});

// Section management
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.style.display = 'none';
    });
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const sectionEl = document.getElementById(section + 'Section');
    if (sectionEl) {
        sectionEl.style.display = 'block';
    }
    
    // Find and activate the clicked nav link
    const clickedLink = Array.from(document.querySelectorAll('.nav-link')).find(link => 
        link.getAttribute('onclick') && link.getAttribute('onclick').includes(section)
    );
    if (clickedLink) {
        clickedLink.classList.add('active');
    }
    
    currentSection = section;
    
    // Load section-specific data
    switch(section) {
        case 'profile':
            loadEmployeeProfile();
            break;
        case 'attendance':
            loadMyAttendance();
            loadWeeklyAttendance();
            break;
        case 'leaves':
            loadMyLeaveRequests();
            break;
        case 'payroll':
            loadMyPayroll();
            break;
        case 'documents':
            loadMyDocuments();
            break;
    }
}

// Load employee profile
async function loadEmployeeProfile() {
    try {
        const response = await fetch('/api/employee/profile');
        if (response.ok) {
            employeeProfile = await response.json();
            populateProfileForm();
            updateNavbarName();
        } else {
            throw new Error('Failed to load profile');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Error loading profile', 'danger');
    }
}

// Populate profile form
function populateProfileForm() {
    document.getElementById('profileName').textContent = employeeProfile.name;
    document.getElementById('profileRole').textContent = employeeProfile.role;
    document.getElementById('profileEmployeeId').textContent = employeeProfile.employee_id || `EMP${employeeProfile.id.toString().padStart(3, '0')}`;
    
    document.getElementById('fullName').value = employeeProfile.name;
    document.getElementById('email').value = employeeProfile.email;
    document.getElementById('phone').value = employeeProfile.phone || '';
    document.getElementById('department').value = employeeProfile.department;
    document.getElementById('hireDate').value = employeeProfile.hire_date;
    document.getElementById('status').value = employeeProfile.status;
    document.getElementById('address').value = employeeProfile.address || '';
    
    // Update profile photo if available
    if (employeeProfile.profile_photo) {
        document.getElementById('profilePhoto').src = employeeProfile.profile_photo;
    }
}

// Update navbar name
function updateNavbarName() {
    const nameEl = document.getElementById('employeeName');
    if (nameEl) {
        nameEl.textContent = employeeProfile.name;
    }
}

// Edit profile
function editProfile() {
    // Enable editable fields
    const editableFields = ['phone', 'address'];
    editableFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.readOnly = false;
            element.classList.add('form-control-editable');
        }
    });
    
    // Show edit buttons
    document.getElementById('profileEditButtons').classList.remove('d-none');
    
    showAlert('You can now edit your phone and address', 'info');
}

// Save profile
async function saveProfile() {
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    try {
        const response = await fetch('/api/employee/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone, address })
        });

        if (response.ok) {
            // Disable editing
            cancelEdit();
            showAlert('Profile updated successfully', 'success');
            loadEmployeeProfile(); // Reload to get updated data
        } else {
            throw new Error('Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert('Error updating profile', 'danger');
    }
}

// Cancel edit
function cancelEdit() {
    // Disable editable fields
    const editableFields = ['phone', 'address'];
    editableFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            element.readOnly = true;
            element.classList.remove('form-control-editable');
        }
    });
    
    // Hide edit buttons
    document.getElementById('profileEditButtons').classList.add('d-none');
    
    // Restore original values
    populateProfileForm();
}

// Change profile photo
function changeProfilePhoto() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profilePhoto').src = e.target.result;
                // Here you would typically upload the file to the server
                showAlert('Profile photo updated (demo mode)', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Load my attendance
async function loadMyAttendance() {
    try {
        const response = await fetch('/api/employee/attendance');
        if (response.ok) {
            myAttendance = await response.json();
            renderMyAttendanceTable();
        } else {
            throw new Error('Failed to load attendance');
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        showAlert('Error loading attendance', 'danger');
    }
}

// Load weekly attendance
async function loadWeeklyAttendance() {
    try {
        const response = await fetch('/api/employee/attendance/weekly');
        if (response.ok) {
            const weeklyData = await response.json();
            renderWeeklyAttendanceView(weeklyData);
        } else {
            throw new Error('Failed to load weekly attendance');
        }
    } catch (error) {
        console.error('Error loading weekly attendance:', error);
        showAlert('Error loading weekly attendance', 'danger');
    }
}

function renderWeeklyAttendanceView(weeklyData) {
    // Add weekly view to the attendance section
    const attendanceSection = document.getElementById('attendanceSection');
    if (attendanceSection) {
        const weeklyViewHtml = `
            <div class="card mt-3">
                <div class="card-header">
                    <h6 class="mb-0">Weekly Attendance Summary</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        ${weeklyData.map(record => {
                            const date = new Date(record.date);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            const dayNum = date.getDate();
                            return `
                                <div class="col">
                                    <div class="text-center">
                                        <div class="badge ${getStatusBadgeClass(record.status)} mb-2" style="width: 100%;">
                                            ${record.status}
                                        </div>
                                        <div><strong>${dayName}</strong></div>
                                        <div>${dayNum}</div>
                                        <div class="small">${record.hours_worked}h</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Insert after the main attendance card
        const mainCard = attendanceSection.querySelector('.card');
        if (mainCard) {
            mainCard.insertAdjacentHTML('afterend', weeklyViewHtml);
        }
    }
}

// Render my attendance table
function renderMyAttendanceTable() {
    const tableBody = document.getElementById('myAttendanceTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    myAttendance.slice(0, 30).forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(record.status)}">${record.status}</span>
            </td>
            <td>${record.hours_worked}h</td>
            <td>${record.check_in || '-'}</td>
            <td>${record.check_out || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Present': return 'bg-success';
        case 'Absent': return 'bg-danger';
        case 'Late': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

// Filter my attendance
function filterMyAttendance() {
    const date = document.getElementById('attendanceDateFilter').value;
    
    let filteredAttendance = myAttendance;
    
    if (date) {
        filteredAttendance = filteredAttendance.filter(a => a.date === date);
    }
    
    // Render filtered results
    const tableBody = document.getElementById('myAttendanceTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    filteredAttendance.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(record.status)}">${record.status}</span>
            </td>
            <td>${record.hours_worked}h</td>
            <td>${record.check_in || '-'}</td>
            <td>${record.check_out || '-'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Load my leave requests
async function loadMyLeaveRequests() {
    try {
        const response = await fetch('/api/employee/leave-requests');
        if (response.ok) {
            myLeaveRequests = await response.json();
            renderMyLeaveTable();
            loadLeaveBalance();
        } else {
            throw new Error('Failed to load leave requests');
        }
    } catch (error) {
        console.error('Error loading leave requests:', error);
        showAlert('Error loading leave requests', 'danger');
    }
}

// Load leave balance
async function loadLeaveBalance() {
    try {
        const response = await fetch('/api/employee/leave-balance');
        if (response.ok) {
            const balanceData = await response.json();
            renderLeaveBalance(balanceData);
        } else {
            throw new Error('Failed to load leave balance');
        }
    } catch (error) {
        console.error('Error loading leave balance:', error);
        showAlert('Error loading leave balance', 'danger');
    }
}

// Render leave balance cards
function renderLeaveBalance(balanceData) {
    const container = document.getElementById('leaveBalanceCards');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(balanceData.leave_limits).forEach(leaveType => {
        const limit = balanceData.leave_limits[leaveType];
        const used = balanceData.used_leaves[leaveType];
        const remaining = balanceData.remaining_leaves[leaveType];
        
        const percentage = (used / limit) * 100;
        const cardClass = remaining > 0 ? 'bg-success' : 'bg-danger';
        
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card ${cardClass}">
                <div class="card-body text-center">
                    <h6 class="card-title">${leaveType}</h6>
                    <h4>${remaining}/${limit}</h4>
                    <small>Remaining/Total</small>
                    <div class="progress mt-2" style="height: 8px;">
                        <div class="progress-bar bg-light" style="width: ${percentage}%"></div>
                    </div>
                    <small class="text-light">Used: ${used} days</small>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Render my leave table
function renderMyLeaveTable() {
    const tableBody = document.getElementById('myLeaveTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    myLeaveRequests.forEach(request => {
        const startDate = new Date(request.start_date);
        const endDate = new Date(request.end_date);
        const totalDays = request.total_days || Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const paidDays = request.paid_days || totalDays;
        const unpaidDays = request.unpaid_days || 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="badge bg-info">${request.type}</span>
            </td>
            <td>${request.start_date}</td>
            <td>${request.end_date}</td>
            <td>${totalDays}</td>
            <td>${paidDays}</td>
            <td>${unpaidDays}</td>
            <td>
                <span class="badge ${getLeaveStatusBadgeClass(request.status)}">${request.status}</span>
            </td>
            <td>${request.applied_date || 'N/A'}</td>
            <td>${request.reason}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getLeaveStatusBadgeClass(status) {
    switch(status) {
        case 'Approved': return 'bg-success';
        case 'Rejected': return 'bg-danger';
        case 'Pending': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

// Submit leave request
async function submitLeaveRequest() {
    const type = document.getElementById('leaveType').value;
    const startDate = document.getElementById('leaveStartDate').value;
    const endDate = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value;

    if (!type || !startDate || !endDate || !reason) {
        showAlert('Please fill in all fields', 'warning');
        return;
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
        showAlert('End date must be after start date', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/employee/leave-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                type,
                start_date: startDate,
                end_date: endDate,
                reason
            })
        });

        if (response.ok) {
            loadMyLeaveRequests();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('applyLeaveModal'));
            modal.hide();
            document.getElementById('applyLeaveForm').reset();
            
            showAlert('Leave request submitted successfully', 'success');
        } else {
            throw new Error('Failed to submit leave request');
        }
    } catch (error) {
        console.error('Error submitting leave request:', error);
        showAlert('Error submitting leave request', 'danger');
    }
}

// Load my payroll
async function loadMyPayroll() {
    try {
        const response = await fetch('/api/employee/payroll');
        if (response.ok) {
            myPayroll = await response.json();
            renderMyPayrollTable();
        } else {
            throw new Error('Failed to load payroll');
        }
    } catch (error) {
        console.error('Error loading payroll:', error);
        showAlert('Error loading payroll', 'danger');
    }
}

// Render my payroll table
function renderMyPayrollTable() {
    const tableBody = document.getElementById('myPayrollTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    myPayroll.forEach(payroll => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payroll.month}</td>
            <td>$${payroll.basic_salary.toLocaleString()}</td>
            <td>$${payroll.hra.toLocaleString()}</td>
            <td>$${payroll.allowances.toLocaleString()}</td>
            <td>$${payroll.overtime.toLocaleString()}</td>
            <td>$${payroll.bonus.toLocaleString()}</td>
            <td>$${payroll.deductions.toLocaleString()}</td>
            <td>$${payroll.tax.toLocaleString()}</td>
            <td><strong>$${payroll.net_salary.toLocaleString()}</strong></td>
            <td>
                <span class="badge ${payroll.status === 'Paid' ? 'bg-success' : 'bg-warning'}">${payroll.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="downloadPayslip(${payroll.id})" title="Download Payslip">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Download payslip
function downloadPayslip(payrollId) {
    // Download the actual PDF payslip
    window.open(`/api/employee/download-payslip/${payrollId}`, '_blank');
}

// Load my documents
function loadMyDocuments() {
    // Update document status based on profile data
    if (employeeProfile.documents) {
        const resumeStatus = document.getElementById('resumeStatus');
        const contractStatus = document.getElementById('contractStatus');
        
        if (resumeStatus) {
            resumeStatus.textContent = employeeProfile.documents.resume ? 
                `Resume: ${employeeProfile.documents.resume}` : 'No resume uploaded';
        }
        
        if (contractStatus) {
            contractStatus.textContent = employeeProfile.documents.contract ? 
                `Contract: ${employeeProfile.documents.contract}` : 'No contract available';
        }
    }
}

// Upload document
function uploadDocument(type) {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'resume' ? '.pdf,.doc,.docx' : (type === 'certificates' ? '.pdf,.jpg,.jpeg,.png' : '*');
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadFileToServer(file, type);
        }
    };
    input.click();
}

// Upload file to server
async function uploadFileToServer(file, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    try {
        const response = await fetch('/api/employee/upload-document', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert(result.message, 'success');
            
            // Update the status display
            const statusEl = document.getElementById(documentType + 'Status');
            if (statusEl) {
                statusEl.textContent = `${documentType.charAt(0).toUpperCase() + documentType.slice(1)}: ${result.filename}`;
            }
            
            // Reload profile to get updated document info
            loadEmployeeProfile();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showAlert(`Error uploading ${documentType}: ${error.message}`, 'danger');
    }
}

// Download document
function downloadDocument(type) {
    if (type === 'offer_letter') {
        // Download offer letter
        window.open('/api/employee/download-offer-letter', '_blank');
    } else if (employeeProfile.documents && employeeProfile.documents[type]) {
        // In a real application, this would download the actual file
        showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} download initiated`, 'success');
    } else {
        showAlert(`No ${type} available for download`, 'warning');
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
    }
}

// Show alert function
function showAlert(message, type, duration = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 500px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after specified duration
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, duration);
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Reset leave modal when closed
    const leaveModal = document.getElementById('applyLeaveModal');
    if (leaveModal) {
        leaveModal.addEventListener('hidden.bs.modal', function() {
            document.getElementById('applyLeaveForm').reset();
            document.getElementById('leaveCalculation').style.display = 'none';
        });
    }
    
    // Set minimum date for leave requests to today
    const today = new Date().toISOString().split('T')[0];
    const startDateEl = document.getElementById('leaveStartDate');
    const endDateEl = document.getElementById('leaveEndDate');
    
    if (startDateEl) startDateEl.min = today;
    if (endDateEl) endDateEl.min = today;
    
    // Update end date minimum when start date changes
    if (startDateEl && endDateEl) {
        startDateEl.addEventListener('change', function() {
            endDateEl.min = this.value;
            if (endDateEl.value && endDateEl.value < this.value) {
                endDateEl.value = this.value;
            }
            calculateLeave();
        });
        
        endDateEl.addEventListener('change', calculateLeave);
    }
});

// Update leave info when type changes
function updateLeaveInfo() {
    const leaveType = document.getElementById('leaveType').value;
    const infoEl = document.getElementById('leaveTypeInfo');
    
    if (leaveType) {
        // Get current balance and show info
        fetch('/api/employee/leave-balance')
            .then(response => response.json())
            .then(data => {
                const remaining = data.remaining_leaves[leaveType];
                const limit = data.leave_limits[leaveType];
                const used = data.used_leaves[leaveType];
                
                infoEl.innerHTML = `Available: ${remaining}/${limit} days (${used} used this year)`;
                infoEl.className = remaining > 0 ? 'form-text text-success' : 'form-text text-danger';
            })
            .catch(error => {
                infoEl.innerHTML = 'Error loading leave balance';
                infoEl.className = 'form-text text-danger';
            });
    } else {
        infoEl.innerHTML = 'Select a leave type to see available days';
        infoEl.className = 'form-text text-muted';
    }
    
    calculateLeave();
}

// Calculate leave days and paid/unpaid breakdown
async function calculateLeave() {
    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('leaveStartDate').value;
    const endDate = document.getElementById('leaveEndDate').value;
    const calculationEl = document.getElementById('leaveCalculation');
    
    if (!leaveType || !startDate || !endDate) {
        calculationEl.style.display = 'none';
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (totalDays <= 0) {
        calculationEl.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch('/api/employee/leave-balance');
        const balanceData = await response.json();
        const remaining = balanceData.remaining_leaves[leaveType];
        
        const paidDays = Math.min(totalDays, remaining);
        const unpaidDays = Math.max(0, totalDays - remaining);
        
        calculationEl.innerHTML = `
            <strong>Leave Calculation:</strong><br>
            Total Days: ${totalDays}<br>
            Paid Days: ${paidDays}<br>
            Unpaid Days: ${unpaidDays}
            ${unpaidDays > 0 ? '<br><span class="text-warning">⚠️ Some days will be unpaid</span>' : ''}
        `;
        calculationEl.style.display = 'block';
    } catch (error) {
        calculationEl.style.display = 'none';
    }
}