// Global variables
let employees = [];
let attendance = [];
let leaveRequests = [];
let payrollData = [];
let currentSection = 'dashboard';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    loadDashboardStats();
    showSection('dashboard');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const attendanceDateEl = document.getElementById('attendanceDate');
    const attendanceDateFilterEl = document.getElementById('attendanceDateFilter');
    
    if (attendanceDateEl) attendanceDateEl.value = today;
    if (attendanceDateFilterEl) attendanceDateFilterEl.value = today;
    
    // Add event listeners for payroll form auto-calculation
    const payrollInputs = ['payrollBasic', 'payrollHRA', 'payrollAllowances', 'payrollOvertime', 'payrollBonus', 'payrollDeductions', 'payrollTax'];
    payrollInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', calculateNetSalary);
        }
    });
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
        case 'payroll':
            loadPayroll();
            populatePayrollFilters();
            populateEmployeeDropdowns();
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
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.employee_id || employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>
                <span class="badge bg-secondary">${employee.role}</span>
            </td>
            <td>
                <span class="badge bg-info">${employee.department}</span>
            </td>
            <td>${employee.salary ? employee.salary.toLocaleString() : 'N/A'}</td>
            <td>
                <span class="badge ${employee.status === 'Active' ? 'bg-success' : 'bg-warning'}">${employee.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewEmployee(${employee.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success me-1" onclick="viewSalaryDetails(${employee.id})" title="Salary Details">
                    <i class="fas fa-dollar-sign"></i>
                </button>
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewEmployeeDocuments(${employee.id})" title="Documents">
                    <i class="fas fa-file-alt"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="viewWeeklyAttendance(${employee.id})" title="Weekly Attendance">
                    <i class="fas fa-calendar-week"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="editEmployee(${employee.id})" title="Edit">
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

// Load payroll data
async function loadPayroll() {
    try {
        const response = await fetch('/api/payroll');
        payrollData = await response.json();
        renderPayrollTable();
        updatePayrollStatistics();
    } catch (error) {
        console.error('Error loading payroll:', error);
        showAlert('Error loading payroll', 'danger');
    }
}

// Render payroll table with all individual columns
function renderPayrollTable() {
    const tableBody = document.getElementById('payrollTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    payrollData.slice(0, 50).forEach(payroll => {
        const employee = employees.find(emp => emp.id === payroll.employee_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee ? employee.name : 'Unknown'}</td>
            <td>${payroll.month}</td>
            <td>${payroll.basic_salary.toLocaleString()}</td>
            <td>${payroll.hra.toLocaleString()}</td>
            <td>${payroll.allowances.toLocaleString()}</td>
            <td>${payroll.overtime.toLocaleString()}</td>
            <td>${payroll.bonus.toLocaleString()}</td>
            <td>${payroll.deductions.toLocaleString()}</td>
            <td>${payroll.tax.toLocaleString()}</td>
            <td><strong>${payroll.net_salary.toLocaleString()}</strong></td>
            <td>
                <span class="badge ${payroll.status === 'Paid' ? 'bg-success' : 'bg-warning'}">${payroll.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewPayrollDetails(${payroll.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${payroll.status === 'Pending' ? `
                    <button class="btn btn-sm btn-outline-success" onclick="markPayrollPaid(${payroll.id})" title="Mark as Paid">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Update payroll statistics
function updatePayrollStatistics() {
    if (!payrollData || payrollData.length === 0) return;
    
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthPayroll = payrollData.filter(p => p.month === currentMonth);
    
    const totalPayroll = currentMonthPayroll.reduce((sum, p) => sum + p.net_salary, 0);
    const paidCount = currentMonthPayroll.filter(p => p.status === 'Paid').length;
    const pendingCount = currentMonthPayroll.filter(p => p.status === 'Pending').length;
    const avgSalary = currentMonthPayroll.length > 0 ? totalPayroll / currentMonthPayroll.length : 0;
    
    // Update statistics cards
    const totalPayrollEl = document.getElementById('totalPayrollAmount');
    const paidSalariesEl = document.getElementById('paidSalariesCount');
    const pendingSalariesEl = document.getElementById('pendingSalariesCount');
    const avgSalaryEl = document.getElementById('avgSalaryPayroll');
    
    if (totalPayrollEl) totalPayrollEl.textContent = '$' + totalPayroll.toLocaleString();
    if (paidSalariesEl) paidSalariesEl.textContent = paidCount;
    if (pendingSalariesEl) pendingSalariesEl.textContent = pendingCount;
    if (avgSalaryEl) avgSalaryEl.textContent = '$' + Math.round(avgSalary).toLocaleString();
}

// Populate payroll filters
function populatePayrollFilters() {
    const monthFilter = document.getElementById('payrollMonthFilter');
    if (!monthFilter) return;
    
    // Clear existing options (except first one)
    while (monthFilter.children.length > 1) {
        monthFilter.removeChild(monthFilter.lastChild);
    }
    
    // Get unique months from payroll data
    const months = [...new Set(payrollData.map(p => p.month))].sort().reverse();
    
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = new Date(month + '-01').toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
        monthFilter.appendChild(option);
    });
}

// Filter payroll
function filterPayroll() {
    const monthFilter = document.getElementById('payrollMonthFilter').value;
    const statusFilter = document.getElementById('payrollStatusFilter').value;
    
    let filteredPayroll = payrollData;
    
    if (monthFilter) {
        filteredPayroll = filteredPayroll.filter(p => p.month === monthFilter);
    }
    
    if (statusFilter) {
        filteredPayroll = filteredPayroll.filter(p => p.status === statusFilter);
    }
    
    // Render filtered results
    const tableBody = document.getElementById('payrollTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    filteredPayroll.slice(0, 50).forEach(payroll => {
        const employee = employees.find(emp => emp.id === payroll.employee_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee ? employee.name : 'Unknown'}</td>
            <td>${payroll.month}</td>
            <td>${payroll.basic_salary.toLocaleString()}</td>
            <td>${payroll.hra.toLocaleString()}</td>
            <td>${payroll.allowances.toLocaleString()}</td>
            <td>${payroll.overtime.toLocaleString()}</td>
            <td>${payroll.bonus.toLocaleString()}</td>
            <td>${payroll.deductions.toLocaleString()}</td>
            <td>${payroll.tax.toLocaleString()}</td>
            <td><strong>${payroll.net_salary.toLocaleString()}</strong></td>
            <td>
                <span class="badge ${payroll.status === 'Paid' ? 'bg-success' : 'bg-warning'}">${payroll.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewPayrollDetails(${payroll.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${payroll.status === 'Pending' ? `
                    <button class="btn btn-sm btn-outline-success" onclick="markPayrollPaid(${payroll.id})" title="Mark as Paid">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Test payroll system
async function testPayrollSystem() {
    try {
        console.log('Testing payroll system...');
        
        const response = await fetch('/api/admin/test-payroll');
        
        if (response.ok) {
            const result = await response.json();
            console.log('Test result:', result);
            
            const message = `System Status:
- Total Users: ${result.users_count}
- Active Users: ${result.active_users}  
- Users with Salary: ${result.users_with_salary}
- Current Payroll Records: ${result.current_payroll_count}
- Sample User: ${result.sample_user ? result.sample_user.name : 'None'}`;
            
            showAlert(message, 'info', 10000);
        } else {
            throw new Error('Test failed');
        }
    } catch (error) {
        console.error('Test error:', error);
        showAlert('Test failed: ' + error.message, 'danger');
    }
}

// Generate monthly payroll
// Generate monthly payroll
async function generateMonthlyPayroll() {
    // Show month selection modal first
    const monthInput = prompt('Enter month for payroll generation (YYYY-MM format):', new Date().toISOString().slice(0, 7));
    
    if (!monthInput) return;
    
    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(monthInput)) {
        showAlert('Invalid month format. Please use YYYY-MM format (e.g., 2024-01)', 'danger');
        return;
    }
    
    if (!confirm(`Generate payroll for ${monthInput}? This will create payroll entries for all active employees based on their attendance and salary structure.`)) {
        return;
    }
    
    try {
        showAlert('Generating payroll... Please wait.', 'info', 3000);
        
        console.log('Sending payroll generation request for month:', monthInput);
        
        const response = await fetch('/api/admin/generate-payroll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ month: monthInput })
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Payroll generation result:', result);
            showAlert(`✅ Payroll generated successfully for ${result.month}!\n📊 Generated for ${result.count} employees`, 'success', 8000);
            loadPayroll(); // Reload payroll data
        } else {
            const error = await response.json();
            console.error('Payroll generation error:', error);
            throw new Error(error.error || 'Failed to generate payroll');
        }
    } catch (error) {
        console.error('Error generating payroll:', error);
        showAlert('❌ Error generating payroll: ' + error.message, 'danger');
    }
}

// Load payroll summary
async function loadPayrollSummary(month = null) {
    try {
        const url = month ? `/api/admin/payroll/summary?month=${month}` : '/api/admin/payroll/summary';
        const response = await fetch(url);
        
        if (response.ok) {
            const summary = await response.json();
            updatePayrollSummaryCards(summary);
        }
    } catch (error) {
        console.error('Error loading payroll summary:', error);
    }
}

// Update payroll summary cards
function updatePayrollSummaryCards(summary) {
    const totalPayrollEl = document.getElementById('totalPayrollAmount');
    const paidSalariesEl = document.getElementById('paidSalariesCount');
    const pendingSalariesEl = document.getElementById('pendingSalariesCount');
    const avgSalaryEl = document.getElementById('avgSalaryPayroll');
    
    if (totalPayrollEl) totalPayrollEl.textContent = '$' + summary.total_net_salary.toLocaleString();
    if (paidSalariesEl) paidSalariesEl.textContent = summary.paid_count;
    if (pendingSalariesEl) pendingSalariesEl.textContent = summary.pending_count;
    if (avgSalaryEl) avgSalaryEl.textContent = '$' + summary.average_salary.toLocaleString();
}

// Bulk update payroll status
async function bulkUpdatePayrollStatus() {
    const checkboxes = document.querySelectorAll('input[name="payrollSelect"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showAlert('Please select payroll records to update', 'warning');
        return;
    }
    
    const newStatus = confirm('Mark selected payroll records as PAID?') ? 'Paid' : 'Pending';
    
    try {
        const response = await fetch('/api/admin/payroll/bulk-update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payroll_ids: selectedIds,
                status: newStatus
            })
        });

        if (response.ok) {
            const result = await response.json();
            showAlert(`✅ ${result.message}`, 'success');
            loadPayroll(); // Reload payroll data
            
            // Uncheck all checkboxes
            checkboxes.forEach(cb => cb.checked = false);
            toggleBulkActions();
        } else {
            throw new Error('Failed to update payroll records');
        }
    } catch (error) {
        console.error('Error updating payroll:', error);
        showAlert('❌ Error updating payroll records', 'danger');
    }
}

// Delete payroll record
async function deletePayrollRecord(payrollId) {
    if (!confirm('Are you sure you want to delete this payroll record? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/payroll/${payrollId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('✅ Payroll record deleted successfully', 'success');
            loadPayroll(); // Reload payroll data
        } else {
            throw new Error('Failed to delete payroll record');
        }
    } catch (error) {
        console.error('Error deleting payroll:', error);
        showAlert('❌ Error deleting payroll record', 'danger');
    }
}

// Toggle bulk actions visibility
function toggleBulkActions() {
    const checkboxes = document.querySelectorAll('input[name="payrollSelect"]:checked');
    const bulkActionsDiv = document.getElementById('bulkActions');
    
    if (bulkActionsDiv) {
        bulkActionsDiv.style.display = checkboxes.length > 0 ? 'block' : 'none';
    }
}

// Select all payroll records
function selectAllPayroll() {
    const selectAllCheckbox = document.getElementById('selectAllPayroll');
    const checkboxes = document.querySelectorAll('input[name="payrollSelect"]');
    
    checkboxes.forEach(cb => {
        cb.checked = selectAllCheckbox.checked;
    });
    
    toggleBulkActions();
}

// Enhanced payroll table rendering with checkboxes and more actions
function renderPayrollTable() {
    const tableBody = document.getElementById('payrollTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    payrollData.slice(0, 50).forEach(payroll => {
        const employee = employees.find(emp => emp.id === payroll.employee_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" name="payrollSelect" value="${payroll.id}" onchange="toggleBulkActions()">
            </td>
            <td>${employee ? employee.name : 'Unknown'}</td>
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
                ${payroll.attendance_ratio ? `<br><small class="text-muted">${payroll.attendance_ratio}% attendance</small>` : ''}
            </td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewPayrollDetails(${payroll.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${payroll.status === 'Pending' ? `
                        <button class="btn btn-sm btn-outline-success" onclick="markPayrollPaid(${payroll.id})" title="Mark as Paid">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-warning" onclick="editPayrollRecord(${payroll.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePayrollRecord(${payroll.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Update statistics after rendering
    updatePayrollStatistics();
}

// Edit payroll record
function editPayrollRecord(payrollId) {
    const payroll = payrollData.find(p => p.id === payrollId);
    const employee = employees.find(emp => emp.id === payroll.employee_id);
    
    if (!payroll || !employee) {
        showAlert('Payroll record not found', 'danger');
        return;
    }
    
    // Populate the modal with existing data
    document.getElementById('payrollEmployee').value = payroll.employee_id;
    document.getElementById('payrollMonth').value = payroll.month;
    document.getElementById('payrollBasic').value = payroll.basic_salary;
    document.getElementById('payrollHRA').value = payroll.hra;
    document.getElementById('payrollAllowances').value = payroll.allowances;
    document.getElementById('payrollOvertime').value = payroll.overtime;
    document.getElementById('payrollBonus').value = payroll.bonus;
    document.getElementById('payrollDeductions').value = payroll.deductions;
    document.getElementById('payrollTax').value = payroll.tax;
    document.getElementById('payrollNet').value = payroll.net_salary;
    
    // Change modal title and store the ID for updating
    document.querySelector('#addPayrollModal .modal-title').textContent = `Edit Payroll - ${employee.name}`;
    document.getElementById('addPayrollModal').setAttribute('data-edit-id', payrollId);
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('addPayrollModal'));
    modal.show();
}

// Enhanced add/update manual payroll
async function addManualPayroll() {
    const editId = document.getElementById('addPayrollModal').getAttribute('data-edit-id');
    const isEdit = editId && editId !== 'null';
    
    const employeeId = document.getElementById('payrollEmployee').value;
    const month = document.getElementById('payrollMonth').value;
    const basicSalary = parseFloat(document.getElementById('payrollBasic').value);
    const hra = parseFloat(document.getElementById('payrollHRA').value);
    const allowances = parseFloat(document.getElementById('payrollAllowances').value);
    const overtime = parseFloat(document.getElementById('payrollOvertime').value) || 0;
    const bonus = parseFloat(document.getElementById('payrollBonus').value) || 0;
    const deductions = parseFloat(document.getElementById('payrollDeductions').value);
    const tax = parseFloat(document.getElementById('payrollTax').value);

    if (!employeeId || !month || !basicSalary || !hra || !allowances || !deductions || !tax) {
        showAlert('Please fill in all required fields', 'warning');
        return;
    }

    const netSalary = basicSalary + hra + allowances + overtime + bonus - deductions - tax;
    
    const payrollData = {
        employee_id: parseInt(employeeId),
        month,
        basic_salary: basicSalary,
        hra,
        allowances,
        overtime,
        bonus,
        deductions,
        tax,
        net_salary: netSalary
    };

    try {
        let response;
        if (isEdit) {
            // Update existing payroll
            response = await fetch(`/api/payroll/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payrollData)
            });
        } else {
            // Create new payroll
            response = await fetch('/api/payroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payrollData)
            });
        }

        if (response.ok) {
            loadPayroll();
            
            // Close modal and reset form
            const modal = bootstrap.Modal.getInstance(document.getElementById('addPayrollModal'));
            modal.hide();
            document.getElementById('addPayrollForm').reset();
            document.getElementById('addPayrollModal').removeAttribute('data-edit-id');
            document.querySelector('#addPayrollModal .modal-title').textContent = 'Manual Payroll Entry';
            
            showAlert(`✅ Payroll ${isEdit ? 'updated' : 'added'} successfully`, 'success');
        } else {
            const error = await response.json();
            throw new Error(error.error || `Failed to ${isEdit ? 'update' : 'add'} payroll`);
        }
    } catch (error) {
        console.error('Error with payroll:', error);
        showAlert(`❌ Error ${isEdit ? 'updating' : 'adding'} payroll: ` + error.message, 'danger');
    }
}

// Export payroll report
function exportPayrollReport() {
    const monthFilter = document.getElementById('payrollMonthFilter').value;
    const statusFilter = document.getElementById('payrollStatusFilter').value;
    
    let filteredPayroll = payrollData;
    
    if (monthFilter) {
        filteredPayroll = filteredPayroll.filter(p => p.month === monthFilter);
    }
    
    if (statusFilter) {
        filteredPayroll = filteredPayroll.filter(p => p.status === statusFilter);
    }
    
    // Create CSV content
    const headers = ['Employee Name', 'Month', 'Basic Salary', 'HRA', 'Allowances', 'Overtime', 'Bonus', 'Deductions', 'Tax', 'Net Salary', 'Status'];
    const csvContent = [
        headers.join(','),
        ...filteredPayroll.map(payroll => {
            const employee = employees.find(emp => emp.id === payroll.employee_id);
            return [
                employee ? employee.name : 'Unknown',
                payroll.month,
                payroll.basic_salary,
                payroll.hra,
                payroll.allowances,
                payroll.overtime,
                payroll.bonus,
                payroll.deductions,
                payroll.tax,
                payroll.net_salary,
                payroll.status
            ].join(',');
        })
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('Payroll report exported successfully', 'success');
}

// Auto-calculate net salary in payroll modal
function calculateNetSalary() {
    const basic = parseFloat(document.getElementById('payrollBasic').value) || 0;
    const hra = parseFloat(document.getElementById('payrollHRA').value) || 0;
    const allowances = parseFloat(document.getElementById('payrollAllowances').value) || 0;
    const overtime = parseFloat(document.getElementById('payrollOvertime').value) || 0;
    const bonus = parseFloat(document.getElementById('payrollBonus').value) || 0;
    const deductions = parseFloat(document.getElementById('payrollDeductions').value) || 0;
    const tax = parseFloat(document.getElementById('payrollTax').value) || 0;
    
    const netSalary = basic + hra + allowances + overtime + bonus - deductions - tax;
    
    const netSalaryEl = document.getElementById('payrollNet');
    if (netSalaryEl) {
        netSalaryEl.value = netSalary.toFixed(2);
    }
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
            <strong>Employee ID:</strong> ${employee.employee_id || employee.id}<br>
            <strong>Name:</strong> ${employee.name}<br>
            <strong>Email:</strong> ${employee.email}<br>
            <strong>Role:</strong> ${employee.role}<br>
            <strong>Department:</strong> ${employee.department}<br>
            <strong>Salary:</strong> ${employee.salary.toLocaleString()}<br>
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

// Edit employee
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

// Update dashboard statistics
function updateDashboardStats() {
    loadDashboardStats();
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
    if (!tableBody) return;
    
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
    if (!tableBody) return;
    
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

// Utility functions
function populateEmployeeDropdowns() {
    const dropdowns = [
        'attendanceEmployee',
        'leaveEmployee',
        'attendanceEmployeeFilter',
        'payrollEmployee'
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

// Payroll specific functions
function viewPayrollDetails(payrollId) {
    const payroll = payrollData.find(p => p.id === payrollId);
    const employee = employees.find(emp => emp.id === payroll.employee_id);
    
    if (payroll && employee) {
        const details = `
            <strong>Employee:</strong> ${employee.name}<br>
            <strong>Month:</strong> ${payroll.month}<br>
            <strong>Basic Salary:</strong> ${payroll.basic_salary.toLocaleString()}<br>
            <strong>HRA:</strong> ${payroll.hra.toLocaleString()}<br>
            <strong>Allowances:</strong> ${payroll.allowances.toLocaleString()}<br>
            <strong>Overtime:</strong> ${payroll.overtime.toLocaleString()}<br>
            <strong>Bonus:</strong> ${payroll.bonus.toLocaleString()}<br>
            <strong>Deductions:</strong> ${payroll.deductions.toLocaleString()}<br>
            <strong>Tax:</strong> ${payroll.tax.toLocaleString()}<br>
            <strong>Net Salary:</strong> ${payroll.net_salary.toLocaleString()}<br>
            <strong>Status:</strong> ${payroll.status}
        `;
        
        showAlert(details, 'info', 10000);
    }
}

async function markPayrollPaid(payrollId) {
    try {
        const response = await fetch(`/api/payroll/${payrollId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'Paid' })
        });

        if (response.ok) {
            loadPayroll();
            showAlert('Payroll marked as paid successfully', 'success');
        } else {
            throw new Error('Failed to update payroll status');
        }
    } catch (error) {
        console.error('Error updating payroll:', error);
        showAlert('Error updating payroll status', 'danger');
    }
}

// View salary details
async function viewSalaryDetails(employeeId) {
    try {
        const response = await fetch(`/api/admin/salary-details/${employeeId}`);
        if (response.ok) {
            const data = await response.json();
            displaySalaryDetails(data);
        } else {
            throw new Error('Failed to load salary details');
        }
    } catch (error) {
        console.error('Error loading salary details:', error);
        showAlert('Error loading salary details', 'danger');
    }
}

function displaySalaryDetails(data) {
    const content = document.getElementById('salaryDetailsContent');
    
    let recentPayrollHtml = '';
    if (data.recent_payroll && data.recent_payroll.length > 0) {
        recentPayrollHtml = `
            <h6>Recent Payroll (Last 6 months)</h6>
            <div class="table-responsive">
                <table class="table table-dark table-sm">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Basic</th>
                            <th>HRA</th>
                            <th>Allowances</th>
                            <th>Overtime</th>
                            <th>Bonus</th>
                            <th>Deductions</th>
                            <th>Tax</th>
                            <th>Net Salary</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.recent_payroll.map(payroll => `
                            <tr>
                                <td>${payroll.month}</td>
                                <td>${payroll.basic_salary.toLocaleString()}</td>
                                <td>${payroll.hra.toLocaleString()}</td>
                                <td>${payroll.allowances.toLocaleString()}</td>
                                <td>${payroll.overtime.toLocaleString()}</td>
                                <td>${payroll.bonus.toLocaleString()}</td>
                                <td>${payroll.deductions.toLocaleString()}</td>
                                <td>${payroll.tax.toLocaleString()}</td>
                                <td><strong>${payroll.net_salary.toLocaleString()}</strong></td>
                                <td><span class="badge ${payroll.status === 'Paid' ? 'bg-success' : 'bg-warning'}">${payroll.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h5>${data.employee_name}</h5>
                <p><strong>Employee ID:</strong> ${data.employee_id}</p>
                <p><strong>Base Salary:</strong> ${data.base_salary.toLocaleString()}</p>
                
                <h6>Salary Structure</h6>
                <div class="salary-breakdown">
                    <div class="salary-item">
                        <span>Basic Salary:</span>
                        <span>${data.salary_structure.basic.toLocaleString()}</span>
                    </div>
                    <div class="salary-item">
                        <span>HRA:</span>
                        <span>${data.salary_structure.hra.toLocaleString()}</span>
                    </div>
                    <div class="salary-item">
                        <span>Allowances:</span>
                        <span>${data.salary_structure.allowances.toLocaleString()}</span>
                    </div>
                    <div class="salary-item">
                        <span>Deductions:</span>
                        <span>${data.salary_structure.deductions.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                ${recentPayrollHtml}
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('salaryDetailsModal'));
    modal.show();
}

// View employee documents
async function viewEmployeeDocuments(employeeId) {
    try {
        const response = await fetch(`/api/admin/employee-documents/${employeeId}`);
        if (response.ok) {
            const data = await response.json();
            displayEmployeeDocuments(data);
        } else {
            throw new Error('Failed to load employee documents');
        }
    } catch (error) {
        console.error('Error loading employee documents:', error);
        showAlert('Error loading employee documents', 'danger');
    }
}

function displayEmployeeDocuments(data) {
    const content = document.getElementById('employeeDocumentsContent');
    
    content.innerHTML = `
        <h5>${data.employee_name} - Documents</h5>
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="fas fa-file-pdf text-danger me-2"></i>
                            Resume
                        </h6>
                        <p class="card-text">
                            ${data.documents.resume ? `File: ${data.documents.resume}` : 'No resume uploaded'}
                        </p>
                        ${data.documents.resume ? `
                            <button class="btn btn-sm btn-outline-primary" onclick="downloadAdminDocument('${data.documents.resume}')">
                                <i class="fas fa-download me-1"></i>Download
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="fas fa-certificate text-warning me-2"></i>
                            Certificates
                        </h6>
                        ${data.documents.certificates && data.documents.certificates.length > 0 ? `
                            <ul class="list-unstyled">
                                ${data.documents.certificates.map(cert => `
                                    <li class="mb-2">
                                        ${cert}
                                        <button class="btn btn-sm btn-outline-warning ms-2" onclick="downloadAdminDocument('${cert}')">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : '<p class="card-text">No certificates uploaded</p>'}
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="fas fa-file-signature text-info me-2"></i>
                            Offer Letter
                        </h6>
                        <p class="card-text">
                            ${data.documents.offer_letter ? `File: ${data.documents.offer_letter}` : 'No offer letter available'}
                        </p>
                        ${data.documents.offer_letter ? `
                            <button class="btn btn-sm btn-outline-info" onclick="downloadAdminDocument('${data.documents.offer_letter}')">
                                <i class="fas fa-download me-1"></i>Download
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('employeeDocumentsModal'));
    modal.show();
}

// View weekly attendance
async function viewWeeklyAttendance(employeeId) {
    try {
        const response = await fetch(`/api/admin/employee-weekly-attendance/${employeeId}`);
        if (response.ok) {
            const data = await response.json();
            displayWeeklyAttendance(data);
        } else {
            throw new Error('Failed to load weekly attendance');
        }
    } catch (error) {
        console.error('Error loading weekly attendance:', error);
        showAlert('Error loading weekly attendance', 'danger');
    }
}

function displayWeeklyAttendance(data) {
    const content = document.getElementById('weeklyAttendanceContent');
    
    content.innerHTML = `
        <h5>${data.employee_name} - Weekly Attendance</h5>
        <p><strong>Employee ID:</strong> ${data.employee_id}</p>
        
        <div class="table-responsive">
            <table class="table table-dark table-striped">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Status</th>
                        <th>Hours Worked</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.weekly_attendance.map(record => {
                        const date = new Date(record.date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                        return `
                            <tr>
                                <td>${record.date}</td>
                                <td>${dayName}</td>
                                <td>
                                    <span class="badge ${getStatusBadgeClass(record.status)}">${record.status}</span>
                                </td>
                                <td>${record.hours_worked}h</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="mt-3">
            <div class="row">
                <div class="col-md-3">
                    <div class="card bg-success">
                        <div class="card-body text-center">
                            <h6>Present Days</h6>
                            <h4>${data.weekly_attendance.filter(a => a.status === 'Present').length}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning">
                        <div class="card-body text-center">
                            <h6>Late Days</h6>
                            <h4>${data.weekly_attendance.filter(a => a.status === 'Late').length}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-danger">
                        <div class="card-body text-center">
                            <h6>Absent Days</h6>
                            <h4>${data.weekly_attendance.filter(a => a.status === 'Absent').length}</h4>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info">
                        <div class="card-body text-center">
                            <h6>Total Hours</h6>
                            <h4>${data.weekly_attendance.reduce((sum, a) => sum + a.hours_worked, 0)}h</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('weeklyAttendanceModal'));
    modal.show();
}

// Download document function for admin
function downloadAdminDocument(filename) {
    // Download the actual file from server
    window.open(`/api/admin/download-document/${filename}`, '_blank');
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