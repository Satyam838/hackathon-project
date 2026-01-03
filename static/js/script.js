// Global variables
let employees = [];
let attendance = [];
let leaveRequests = [];
let currentSection = 'dashboard';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    loadDashboardStats();
    showSection('dashboard');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    document.getElementById('attendanceDateFilter').value = today;
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
    document.getElementById(section + 'Section').style.display = 'block';
    event.target.classList.add('active');
    currentSection = section;
    
    // Load section-specific data
    switch(section) {
        case 'employees':
            loadEmployees();
            break;
        case 'attendance':
            loadAttendance();
            populateEmployeeDropdowns();
            break;
        case 'leaves':
            loadLeaveRequests();
            populateEmployeeDropdowns();
            break;
        case 'reports':
            loadReports();
            break;
        case 'dashboard':
            loadDashboardStats();
            break;
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/reports/dashboard');
        const stats = await response.json();
        
        document.getElementById('totalEmployees').textContent = stats.total_employees;
        document.getElementById('activeEmployees').textContent = stats.active_employees;
        document.getElementById('totalDepartments').textContent = stats.departments;
        document.getElementById('pendingLeaves').textContent = stats.pending_leaves;
        document.getElementById('presentToday').textContent = stats.present_today;
        document.getElementById('avgSalary').textContent = '$' + stats.avg_salary.toLocaleString();
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load employees from backend
async function loadEmployees() {
    try {
        const response = await fetch('/api/users');
        employees = await response.json();
        renderEmployeeTable();
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading employees:', error);
        showAlert('Error loading employees', 'danger');
    }
}

// Render employee table
function renderEmployeeTable() {
    const tableBody = document.getElementById('employeeTableBody');
    tableBody.innerHTML = '';

    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>
                <span class="badge bg-secondary">${employee.role}</span>
            </td>
            <td>
                <span class="badge bg-info">${employee.department}</span>
            </td>
            <td>
                <span class="badge ${employee.status === 'Active' ? 'bg-success' : 'bg-warning'}">${employee.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="viewEmployee(${employee.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-2" onclick="editEmployee(${employee.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update dashboard statistics
function updateDashboardStats() {
    loadDashboardStats();
}

// Add new employee
async function addEmployee() {
    const name = document.getElementById('employeeName').value;
    const email = document.getElementById('employeeEmail').value;
    const role = document.getElementById('employeeRole').value;
    const department = document.getElementById('employeeDepartment').value;
    const salary = document.getElementById('employeeSalary').value;
    const phone = document.getElementById('employeePhone').value;
    const address = document.getElementById('employeeAddress').value;

    if (!name || !email || !role || !department || !salary) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name, 
                email, 
                role, 
                department, 
                salary: parseInt(salary),
                phone,
                address
            })
        });

        if (response.ok) {
            const newEmployee = await response.json();
            employees.push(newEmployee);
            renderEmployeeTable();
            updateDashboardStats();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
            modal.hide();
            document.getElementById('addEmployeeForm').reset();
            
            showAlert('Employee added successfully', 'success');
        } else {
            throw new Error('Failed to add employee');
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        showAlert('Error adding employee', 'danger');
    }
}

// View employee details
function viewEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        const details = `
            <strong>Name:</strong> ${employee.name}<br>
            <strong>Email:</strong> ${employee.email}<br>
            <strong>Role:</strong> ${employee.role}<br>
            <strong>Department:</strong> ${employee.department}<br>
            <strong>Salary:</strong> $${employee.salary.toLocaleString()}<br>
            <strong>Phone:</strong> ${employee.phone || 'N/A'}<br>
            <strong>Address:</strong> ${employee.address || 'N/A'}<br>
            <strong>Hire Date:</strong> ${employee.hire_date}<br>
            <strong>Status:</strong> ${employee.status}
        `;
        
        showAlert(details, 'info', 10000);
    }
}

// Delete employee
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            employees = employees.filter(emp => emp.id !== id);
            renderEmployeeTable();
            updateDashboardStats();
            showAlert('Employee deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete employee');
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        showAlert('Error deleting employee', 'danger');
    }
}

// Edit employee (placeholder function)
function editEmployee(id) {
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        // Fill the form with existing data
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeEmail').value = employee.email;
        document.getElementById('employeeRole').value = employee.role;
        document.getElementById('employeeDepartment').value = employee.department;
        document.getElementById('employeeSalary').value = employee.salary;
        document.getElementById('employeePhone').value = employee.phone || '';
        document.getElementById('employeeAddress').value = employee.address || '';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));
        modal.show();
        
        // Change modal title and button text
        document.querySelector('#addEmployeeModal .modal-title').textContent = 'Edit Employee';
        
        showAlert('Edit functionality coming soon!', 'info');
    }
}

// Show alert messages
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

// Form validation
document.getElementById('addEmployeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addEmployee();
});

// Reset modal when closed
document.getElementById('addEmployeeModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('addEmployeeForm').reset();
    document.querySelector('#addEmployeeModal .modal-title').textContent = 'Add New Employee';
});

// Reset other modals when closed
document.getElementById('addAttendanceModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('addAttendanceForm').reset();
});

document.getElementById('addLeaveModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('addLeaveForm').reset();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Loading animation helper
function showLoading(element) {
    element.classList.add('loading');
}

function hideLoading(element) {
    element.classList.remove('loading');
}

// Attendance Management
async function loadAttendance() {
    try {
        const response = await fetch('/api/attendance');
        attendance = await response.json();
        renderAttendanceTable();
    } catch (error) {
        console.error('Error loading attendance:', error);
        showAlert('Error loading attendance', 'danger');
    }
}

function renderAttendanceTable() {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    attendance.slice(0, 50).forEach(record => {
        const employee = employees.find(emp => emp.id === record.employee_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee ? employee.name : 'Unknown'}</td>
            <td>${record.date}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(record.status)}">${record.status}</span>
            </td>
            <td>${record.hours_worked}</td>
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

async function addAttendance() {
    const employeeId = document.getElementById('attendanceEmployee').value;
    const date = document.getElementById('attendanceDate').value;
    const status = document.getElementById('attendanceStatus').value;
    const hours = document.getElementById('attendanceHours').value || (status === 'Present' ? 8 : (status === 'Late' ? 6 : 0));

    if (!employeeId || !date || !status) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                employee_id: parseInt(employeeId),
                date,
                status,
                hours_worked: parseFloat(hours)
            })
        });

        if (response.ok) {
            loadAttendance();
            loadDashboardStats();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addAttendanceModal'));
            modal.hide();
            document.getElementById('addAttendanceForm').reset();
            
            showAlert('Attendance marked successfully', 'success');
        } else {
            throw new Error('Failed to mark attendance');
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        showAlert('Error marking attendance', 'danger');
    }
}

function filterAttendance() {
    const employeeId = document.getElementById('attendanceEmployeeFilter').value;
    const date = document.getElementById('attendanceDateFilter').value;
    
    let filteredAttendance = attendance;
    
    if (employeeId) {
        filteredAttendance = filteredAttendance.filter(a => a.employee_id == employeeId);
    }
    
    if (date) {
        filteredAttendance = filteredAttendance.filter(a => a.date === date);
    }
    
    // Render filtered results
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = '';

    filteredAttendance.slice(0, 50).forEach(record => {
        const employee = employees.find(emp => emp.id === record.employee_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee ? employee.name : 'Unknown'}</td>
            <td>${record.date}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(record.status)}">${record.status}</span>
            </td>
            <td>${record.hours_worked}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Leave Management
async function loadLeaveRequests() {
    try {
        const response = await fetch('/api/leave-requests');
        leaveRequests = await response.json();
        renderLeaveTable();
    } catch (error) {
        console.error('Error loading leave requests:', error);
        showAlert('Error loading leave requests', 'danger');
    }
}

function renderLeaveTable() {
    const tableBody = document.getElementById('leaveTableBody');
    tableBody.innerHTML = '';

    leaveRequests.forEach(request => {
        const employee = employees.find(emp => emp.id === request.employee_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee ? employee.name : 'Unknown'}</td>
            <td>
                <span class="badge bg-info">${request.type}</span>
            </td>
            <td>${request.start_date}</td>
            <td>${request.end_date}</td>
            <td>
                <span class="badge ${getLeaveStatusBadgeClass(request.status)}">${request.status}</span>
            </td>
            <td>
                ${request.status === 'Pending' ? `
                    <button class="btn btn-sm btn-outline-success me-1" onclick="updateLeaveStatus(${request.id}, 'Approved')" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="updateLeaveStatus(${request.id}, 'Rejected')" title="Reject">
                        <i class="fas fa-times"></i>
                    </button>
                ` : `
                    <span class="text-muted">No actions</span>
                `}
            </td>
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

async function addLeaveRequest() {
    const employeeId = document.getElementById('leaveEmployee').value;
    const type = document.getElementById('leaveType').value;
    const startDate = document.getElementById('leaveStartDate').value;
    const endDate = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value;

    if (!employeeId || !type || !startDate || !endDate) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/leave-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                employee_id: parseInt(employeeId),
                type,
                start_date: startDate,
                end_date: endDate,
                reason
            })
        });

        if (response.ok) {
            loadLeaveRequests();
            loadDashboardStats();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addLeaveModal'));
            modal.hide();
            document.getElementById('addLeaveForm').reset();
            
            showAlert('Leave request submitted successfully', 'success');
        } else {
            throw new Error('Failed to submit leave request');
        }
    } catch (error) {
        console.error('Error submitting leave request:', error);
        showAlert('Error submitting leave request', 'danger');
    }
}

async function updateLeaveStatus(requestId, status) {
    try {
        const response = await fetch(`/api/leave-requests/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadLeaveRequests();
            loadDashboardStats();
            showAlert(`Leave request ${status.toLowerCase()} successfully`, 'success');
        } else {
            throw new Error('Failed to update leave request');
        }
    } catch (error) {
        console.error('Error updating leave request:', error);
        showAlert('Error updating leave request', 'danger');
    }
}

// Reports
async function loadReports() {
    try {
        // Load attendance report
        const attendanceResponse = await fetch('/api/reports/attendance');
        const attendanceReport = await attendanceResponse.json();
        renderAttendanceReport(attendanceReport);

        // Load salary report
        const salaryResponse = await fetch('/api/reports/salary');
        const salaryReport = await salaryResponse.json();
        renderSalaryReport(salaryReport);
    } catch (error) {
        console.error('Error loading reports:', error);
        showAlert('Error loading reports', 'danger');
    }
}

function renderAttendanceReport(report) {
    const tableBody = document.getElementById('attendanceReportBody');
    tableBody.innerHTML = '';

    report.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.employee_name}</td>
            <td>${record.department}</td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${record.attendance_rate >= 90 ? 'bg-success' : record.attendance_rate >= 75 ? 'bg-warning' : 'bg-danger'}" 
                         style="width: ${record.attendance_rate}%">
                        ${record.attendance_rate}%
                    </div>
                </div>
            </td>
            <td>${record.total_hours}h</td>
        `;
        tableBody.appendChild(row);
    });
}

function renderSalaryReport(report) {
    const tableBody = document.getElementById('salaryReportBody');
    tableBody.innerHTML = '';

    report.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.department}</td>
            <td>${record.employee_count}</td>
            <td>$${record.avg_salary.toLocaleString()}</td>
            <td>$${record.total_salary.toLocaleString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Utility functions
function populateEmployeeDropdowns() {
    const dropdowns = [
        'attendanceEmployee',
        'leaveEmployee',
        'attendanceEmployeeFilter'
    ];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            // Clear existing options (except first one)
            while (dropdown.children.length > 1) {
                dropdown.removeChild(dropdown.lastChild);
            }
            
            // Add employee options
            employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = employee.name;
                dropdown.appendChild(option);
            });
        }
    });
}

// Enhanced alert function
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