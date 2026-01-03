from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file
import json
from datetime import datetime, timedelta
import random
import hashlib
import os
from werkzeug.utils import secure_filename
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this in production

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Sample data for demonstration
users = [
    {
        "id": 1, 
        "name": "John Doe", 
        "email": "john@example.com", 
        "password": hashlib.md5("password123".encode()).hexdigest(),
        "role": "Developer",
        "department": "Engineering",
        "salary": 75000,
        "hire_date": "2022-01-15",
        "status": "Active",
        "phone": "+1-555-0101",
        "address": "123 Main St, City, State",
        "employee_id": "EMP001",
        "profile_photo": None,
        "documents": {
            "resume": None,
            "offer_letter": "john_doe_offer_letter.pdf"
        },
        "salary_structure": {
            "basic": 45000,
            "hra": 15000,
            "allowances": 10000,
            "deductions": 5000
        }
    },
    {
        "id": 2, 
        "name": "Jane Smith", 
        "email": "jane@example.com", 
        "password": hashlib.md5("password123".encode()).hexdigest(),
        "role": "Designer",
        "department": "Design",
        "salary": 68000,
        "hire_date": "2022-03-20",
        "status": "Active",
        "phone": "+1-555-0102",
        "address": "456 Oak Ave, City, State",
        "employee_id": "EMP002",
        "profile_photo": None,
        "documents": {
            "resume": None,
            "certificates": ["jane_smith_degree.pdf"],
            "offer_letter": "jane_smith_offer_letter.pdf"
        },
        "salary_structure": {
            "basic": 40000,
            "hra": 14000,
            "allowances": 9000,
            "deductions": 5000
        }
    },
    {
        "id": 3, 
        "name": "Mike Johnson", 
        "email": "mike@example.com", 
        "password": hashlib.md5("password123".encode()).hexdigest(),
        "role": "Manager",
        "department": "Operations",
        "salary": 85000,
        "hire_date": "2021-11-10",
        "status": "Active",
        "phone": "+1-555-0103",
        "address": "789 Pine Rd, City, State",
        "employee_id": "EMP003",
        "profile_photo": None,
        "documents": {
            "resume": "mike_johnson_resume.pdf",
            "certificates": ["mike_johnson_mba.pdf", "mike_johnson_pmp.pdf"],
            "offer_letter": "mike_johnson_offer_letter.pdf"
        },
        "salary_structure": {
            "basic": 50000,
            "hra": 17000,
            "allowances": 13000,
            "deductions": 5000
        }
    },
    {
        "id": 4, 
        "name": "Sarah Wilson", 
        "email": "sarah@example.com", 
        "password": hashlib.md5("password123".encode()).hexdigest(),
        "role": "HR Specialist",
        "department": "Human Resources",
        "salary": 62000,
        "hire_date": "2023-02-01",
        "status": "Active",
        "phone": "+1-555-0104",
        "address": "321 Elm St, City, State",
        "employee_id": "EMP004",
        "profile_photo": None,
        "documents": {
            "resume": "sarah_wilson_resume.pdf",
            "certificates": ["sarah_wilson_hr_cert.pdf"],
            "offer_letter": "sarah_wilson_offer_letter.pdf"
        },
        "salary_structure": {
            "basic": 37000,
            "hra": 12000,
            "allowances": 8000,
            "deductions": 5000
        }
    },
    {
        "id": 5, 
        "name": "David Brown", 
        "email": "david@example.com", 
        "password": hashlib.md5("password123".encode()).hexdigest(),
        "role": "Analyst",
        "department": "Finance",
        "salary": 58000,
        "hire_date": "2023-06-15",
        "status": "On Leave",
        "phone": "+1-555-0105",
        "address": "654 Maple Dr, City, State",
        "employee_id": "EMP005",
        "profile_photo": None,
        "documents": {
            "resume": None,
            "certificates": [],
            "offer_letter": "david_brown_offer_letter.pdf"
        },
        "salary_structure": {
            "basic": 35000,
            "hra": 11000,
            "allowances": 7000,
            "deductions": 5000
        }
    }
]

# Admin users
admin_users = [
    {
        "id": 1,
        "username": "admin",
        "password": hashlib.md5("admin123".encode()).hexdigest(),
        "name": "System Administrator",
        "role": "admin"
    }
]

# Payroll data with comprehensive salary details
payroll_data = []
for user in users:
    for i in range(6):  # Last 6 months
        month_date = (datetime.now() - timedelta(days=30*i)).strftime("%Y-%m")
        
        # Calculate detailed salary components
        basic_salary = user["salary_structure"]["basic"]
        hra = user["salary_structure"]["hra"]
        allowances = user["salary_structure"]["allowances"]
        overtime = random.randint(0, 5000)
        bonus = random.randint(0, 10000) if i == 0 else 0  # Bonus only for current month
        
        # Additional allowances
        transport_allowance = random.randint(1000, 3000)
        medical_allowance = random.randint(500, 2000)
        food_allowance = random.randint(800, 2500)
        
        # Detailed deductions
        pf_deduction = int(basic_salary * 0.12)  # 12% PF
        esi_deduction = int((basic_salary + hra) * 0.0175)  # 1.75% ESI
        professional_tax = 200
        insurance_premium = random.randint(500, 1500)
        loan_deduction = random.randint(0, 5000) if random.random() > 0.7 else 0
        other_deductions = random.randint(0, 1000)
        
        # Calculate gross and tax
        gross_salary = (basic_salary + hra + allowances + overtime + bonus + 
                       transport_allowance + medical_allowance + food_allowance)
        income_tax = int(gross_salary * 0.1) if gross_salary > 30000 else int(gross_salary * 0.05)
        
        total_deductions = (pf_deduction + esi_deduction + professional_tax + 
                          insurance_premium + loan_deduction + other_deductions + income_tax)
        
        net_salary = gross_salary - total_deductions
        
        # Bank deposit details
        bank_details = {
            "account_number": f"****{random.randint(1000, 9999)}",
            "bank_name": random.choice(["State Bank", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank"]),
            "ifsc_code": f"SBIN000{random.randint(1000, 9999)}",
            "deposit_date": (datetime.now() - timedelta(days=30*i + random.randint(25, 30))).strftime("%Y-%m-%d") if i > 0 else None,
            "transaction_id": f"TXN{random.randint(100000000, 999999999)}" if i > 0 else None,
            "deposit_status": "Deposited" if i > 0 else "Pending"
        }
        
        payroll_data.append({
            "id": len(payroll_data) + 1,
            "employee_id": user["id"],
            "month": month_date,
            "pay_period": f"{month_date}-01 to {month_date}-{random.randint(28, 31)}",
            
            # Earnings breakdown
            "basic_salary": basic_salary,
            "hra": hra,
            "allowances": allowances,
            "transport_allowance": transport_allowance,
            "medical_allowance": medical_allowance,
            "food_allowance": food_allowance,
            "overtime": overtime,
            "bonus": bonus,
            "gross_salary": gross_salary,
            
            # Deductions breakdown
            "pf_deduction": pf_deduction,
            "esi_deduction": esi_deduction,
            "professional_tax": professional_tax,
            "insurance_premium": insurance_premium,
            "loan_deduction": loan_deduction,
            "other_deductions": other_deductions,
            "income_tax": income_tax,
            "total_deductions": total_deductions,
            
            # Final calculation
            "net_salary": net_salary,
            "status": "Paid" if i > 0 else "Pending",
            
            # Bank and deposit details
            "bank_details": bank_details,
            "created_date": (datetime.now() - timedelta(days=30*i + 35)).strftime("%Y-%m-%d"),
            "processed_by": "System Auto-Generated" if random.random() > 0.3 else "HR Admin",
            
            # Additional metadata
            "working_days": 22,
            "present_days": random.randint(18, 22),
            "leave_days": random.randint(0, 4),
            "overtime_hours": overtime // 500 if overtime > 0 else 0,
            "remarks": "Regular monthly salary" if bonus == 0 else "Includes performance bonus"
        })
   

# Enhanced attendance data with more detailed information
attendance_data = []
for user in users:
    for i in range(30):  # Last 30 days
        date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        status = random.choice(["Present", "Present", "Present", "Present", "Absent", "Late", "Half Day", "Work From Home"])
        
        # Calculate hours based on status
        if status == "Present":
            hours = 8
            check_in = "09:00"
            check_out = "18:00"
        elif status == "Late":
            hours = 7.5
            late_minutes = random.randint(15, 120)  # 15 minutes to 2 hours late
            check_in_hour = 9 + (late_minutes // 60)
            check_in_minute = late_minutes % 60
            check_in = f"{check_in_hour:02d}:{check_in_minute:02d}"
            check_out = "18:00"
        elif status == "Half Day":
            hours = 4
            check_in = "09:00"
            check_out = "13:00"
        elif status == "Work From Home":
            hours = 8
            check_in = "09:30"
            check_out = "18:30"
        else:  # Absent
            hours = 0
            check_in = None
            check_out = None
            
        # Generate remarks based on status
        remarks_options = {
            "Present": ["On time", "Good performance", ""],
            "Late": ["Traffic delay", "Personal emergency", "Overslept"],
            "Absent": ["Sick leave", "Personal work", "Family emergency"],
            "Half Day": ["Medical appointment", "Personal work", "Early leave"],
            "Work From Home": ["Remote work", "Client meeting", "Project work"]
        }
        
        remarks = random.choice(remarks_options.get(status, [""]))
            
        attendance_data.append({
            "id": len(attendance_data) + 1,
            "employee_id": user["id"],
            "date": date,
            "status": status,
            "hours_worked": hours,
            "check_in": check_in,
            "check_out": check_out,
            "remarks": remarks,
            "created_by": "System" if random.random() > 0.3 else "HR Admin",
            "created_date": date,
            "overtime_hours": random.randint(0, 2) if status == "Present" and random.random() > 0.8 else 0
        })

# Sample leave requests
leave_requests = [
    {"id": 1, "employee_id": 1, "start_date": "2024-01-15", "end_date": "2024-01-17", "type": "Vacation", "status": "Approved", "reason": "Family vacation"},
    {"id": 2, "employee_id": 2, "start_date": "2024-01-20", "end_date": "2024-01-20", "type": "Sick", "status": "Pending", "reason": "Medical appointment"},
    {"id": 3, "employee_id": 3, "start_date": "2024-02-01", "end_date": "2024-02-05", "type": "Personal", "status": "Approved", "reason": "Personal matters"}
]

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/admin')
def admin_dashboard():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return redirect(url_for('index'))
    return render_template('admin.html')

@app.route('/employee')
def employee_dashboard():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return redirect(url_for('index'))
    return render_template('employee.html')

# Authentication endpoints
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user_type = data.get('user_type')
    
    hashed_password = hashlib.md5(password.encode()).hexdigest()
    
    if user_type == 'admin':
        admin = next((a for a in admin_users if a['username'] == username and a['password'] == hashed_password), None)
        if admin:
            session['user_id'] = admin['id']
            session['user_type'] = 'admin'
            session['username'] = admin['username']
            return jsonify({"success": True, "redirect": "/admin"})
    
    elif user_type == 'employee':
        employee_id = data.get('employee_id')
        
        # Find employee by email and employee_id (removed role requirement)
        employee = None
        for u in users:
            if (u['email'] == username and 
                u['password'] == hashed_password and 
                u['employee_id'] == employee_id):
                employee = u
                break
        
        if employee:
            session['user_id'] = employee['id']
            session['user_type'] = 'employee'
            session['username'] = employee['email']
            session['employee_id'] = employee['employee_id']
            return jsonify({"success": True, "redirect": "/employee"})
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "redirect": "/"})

# Employee profile endpoints
@app.route('/api/employee/profile', methods=['GET'])
def get_employee_profile():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee = next((u for u in users if u['id'] == session['user_id']), None)
    if employee:
        # Remove password from response
        profile = {k: v for k, v in employee.items() if k != 'password'}
        return jsonify(profile)
    return jsonify({"error": "Employee not found"}), 404

@app.route('/api/employee/profile', methods=['PUT'])
def update_employee_profile():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee = next((u for u in users if u['id'] == session['user_id']), None)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    data = request.get_json()
    # Allow employees to update only certain fields
    updatable_fields = ['phone', 'address', 'profile_photo']
    for field in updatable_fields:
        if field in data:
            employee[field] = data[field]
    
    return jsonify({"success": True, "message": "Profile updated successfully"})

# Employee attendance endpoints
@app.route('/api/employee/attendance', methods=['GET'])
def get_employee_attendance():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee_attendance = [a for a in attendance_data if a['employee_id'] == session['user_id']]
    return jsonify(employee_attendance)

# Employee leave requests endpoints
@app.route('/api/employee/leave-requests', methods=['GET'])
def get_employee_leave_requests():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee_leaves = [r for r in leave_requests if r['employee_id'] == session['user_id']]
    return jsonify(employee_leaves)

@app.route('/api/employee/leave-requests', methods=['POST'])
def submit_employee_leave_request():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    leave_type = data.get('type')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    
    # Calculate leave days
    start_dt = datetime.strptime(start_date, '%Y-%m-%d')
    end_dt = datetime.strptime(end_date, '%Y-%m-%d')
    leave_days = (end_dt - start_dt).days + 1
    
    # Check leave balance
    balance_response = get_employee_leave_balance()
    balance_data = balance_response.get_json()
    
    if leave_type not in balance_data['remaining_leaves']:
        return jsonify({"error": "Invalid leave type"}), 400
    
    remaining = balance_data['remaining_leaves'][leave_type]
    
    # Determine if leave will be paid or unpaid
    paid_days = min(leave_days, remaining)
    unpaid_days = max(0, leave_days - remaining)
    
    new_request = {
        "id": len(leave_requests) + 1,
        "employee_id": session['user_id'],
        "start_date": start_date,
        "end_date": end_date,
        "type": leave_type,
        "status": "Pending",
        "reason": data.get('reason', ''),
        "applied_date": datetime.now().strftime("%Y-%m-%d"),
        "total_days": leave_days,
        "paid_days": paid_days,
        "unpaid_days": unpaid_days
    }
    leave_requests.append(new_request)
    return jsonify(new_request), 201

# Employee payroll endpoints
@app.route('/api/employee/payroll', methods=['GET'])
def get_employee_payroll():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee_payroll = [p for p in payroll_data if p['employee_id'] == session['user_id']]
    return jsonify(employee_payroll)

# Weekly attendance endpoint
@app.route('/api/employee/attendance/weekly', methods=['GET'])
def get_employee_weekly_attendance():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    # Get last 7 days attendance
    end_date = datetime.now()
    start_date = end_date - timedelta(days=6)
    
    weekly_attendance = []
    for i in range(7):
        current_date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        attendance_record = next((a for a in attendance_data if a['employee_id'] == session['user_id'] and a['date'] == current_date), None)
        
        if attendance_record:
            weekly_attendance.append(attendance_record)
        else:
            weekly_attendance.append({
                "employee_id": session['user_id'],
                "date": current_date,
                "status": "No Record",
                "hours_worked": 0,
                "check_in": None,
                "check_out": None
            })
    
    return jsonify(weekly_attendance)

# Document upload endpoints
@app.route('/api/employee/upload-document', methods=['POST'])
def upload_employee_document():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    document_type = request.form.get('document_type')
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Add timestamp to avoid conflicts
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
        filename = timestamp + filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Update employee document record
        employee = next((u for u in users if u['id'] == session['user_id']), None)
        if employee:
            if document_type == 'resume':
                employee['documents']['resume'] = filename
            elif document_type == 'certificates':
                if 'certificates' not in employee['documents']:
                    employee['documents']['certificates'] = []
                employee['documents']['certificates'].append(filename)
        
        return jsonify({"success": True, "filename": filename, "message": f"{document_type.title()} uploaded successfully"})
    
    return jsonify({"error": "Invalid file type"}), 400

# Download salary slip
@app.route('/api/employee/download-payslip/<int:payroll_id>')
def download_payslip(payroll_id):
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    # Find payroll record
    payroll = next((p for p in payroll_data if p['id'] == payroll_id and p['employee_id'] == session['user_id']), None)
    if not payroll:
        return jsonify({"error": "Payroll record not found"}), 404
    
    employee = next((u for u in users if u['id'] == session['user_id']), None)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    # Generate PDF payslip
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 50, "PAYSLIP")
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Employee: {employee['name']}")
    p.drawString(50, height - 100, f"Employee ID: {employee['employee_id']}")
    p.drawString(50, height - 120, f"Month: {payroll['month']}")
    p.drawString(50, height - 140, f"Department: {employee['department']}")
    
    # Earnings
    y_pos = height - 180
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y_pos, "EARNINGS")
    y_pos -= 30
    
    p.setFont("Helvetica", 12)
    earnings = [
        ("Basic Salary", payroll['basic_salary']),
        ("HRA", payroll['hra']),
        ("Allowances", payroll['allowances']),
        ("Overtime", payroll['overtime']),
        ("Bonus", payroll['bonus'])
    ]
    
    total_earnings = 0
    for item, amount in earnings:
        p.drawString(50, y_pos, item)
        p.drawString(300, y_pos, f"${amount:,.2f}")
        total_earnings += amount
        y_pos -= 20
    
    # Deductions
    y_pos -= 20
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y_pos, "DEDUCTIONS")
    y_pos -= 30
    
    p.setFont("Helvetica", 12)
    deductions = [
        ("Tax", payroll['tax']),
        ("Other Deductions", payroll['deductions'])
    ]
    
    total_deductions = 0
    for item, amount in deductions:
        p.drawString(50, y_pos, item)
        p.drawString(300, y_pos, f"${amount:,.2f}")
        total_deductions += amount
        y_pos -= 20
    
    # Net Salary
    y_pos -= 30
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y_pos, "NET SALARY")
    p.drawString(300, y_pos, f"${payroll['net_salary']:,.2f}")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"payslip_{employee['employee_id']}_{payroll['month']}.pdf",
        mimetype='application/pdf'
    )

# Download offer letter
@app.route('/api/employee/download-offer-letter')
def download_offer_letter():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee = next((u for u in users if u['id'] == session['user_id']), None)
    if not employee or not employee['documents'].get('offer_letter'):
        return jsonify({"error": "Offer letter not found"}), 404
    
    # Generate offer letter PDF
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, height - 50, "OFFER LETTER")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 100, f"Date: {employee['hire_date']}")
    p.drawString(50, height - 130, f"Dear {employee['name']},")
    
    # Content
    content = [
        "",
        "We are pleased to offer you the position of " + employee['role'],
        "in the " + employee['department'] + " department.",
        "",
        "Your starting salary will be $" + f"{employee['salary']:,}" + " per annum.",
        "",
        "We look forward to having you join our team.",
        "",
        "Sincerely,",
        "HR Department"
    ]
    
    y_pos = height - 160
    for line in content:
        p.drawString(50, y_pos, line)
        y_pos -= 20
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"offer_letter_{employee['employee_id']}.pdf",
        mimetype='application/pdf'
    )

@app.route('/api/users', methods=['GET'])
def get_users():
    if 'user_type' in session and session['user_type'] == 'admin':
        # Admin gets full details including salary
        return jsonify(users)
    else:
        # Non-admin gets limited info
        limited_users = []
        for user in users:
            limited_user = {k: v for k, v in user.items() if k not in ['password', 'salary', 'salary_structure']}
            limited_users.append(limited_user)
        return jsonify(limited_users)

# Admin endpoint to view employee documents
@app.route('/api/admin/employee-documents/<int:employee_id>')
def get_employee_documents(employee_id):
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee = next((u for u in users if u['id'] == employee_id), None)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    return jsonify({
        "employee_id": employee_id,
        "employee_name": employee['name'],
        "documents": employee['documents']
    })

# Admin endpoint to view salary details
@app.route('/api/admin/salary-details/<int:employee_id>')
def get_salary_details(employee_id):
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee = next((u for u in users if u['id'] == employee_id), None)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    # Get recent payroll data
    employee_payroll = [p for p in payroll_data if p['employee_id'] == employee_id]
    
    return jsonify({
        "employee_id": employee_id,
        "employee_name": employee['name'],
        "base_salary": employee['salary'],
        "salary_structure": employee['salary_structure'],
        "recent_payroll": employee_payroll[:6]  # Last 6 months
    })

# Admin endpoint for weekly attendance of any employee
@app.route('/api/admin/employee-weekly-attendance/<int:employee_id>')
def get_employee_weekly_attendance_admin(employee_id):
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    employee = next((u for u in users if u['id'] == employee_id), None)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    # Get last 7 days attendance
    end_date = datetime.now()
    start_date = end_date - timedelta(days=6)
    
    weekly_attendance = []
    for i in range(7):
        current_date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        attendance_record = next((a for a in attendance_data if a['employee_id'] == employee_id and a['date'] == current_date), None)
        
        if attendance_record:
            weekly_attendance.append(attendance_record)
        else:
            weekly_attendance.append({
                "employee_id": employee_id,
                "date": current_date,
                "status": "No Record",
                "hours_worked": 0,
                "check_in": None,
                "check_out": None
            })
    
    return jsonify({
        "employee_name": employee['name'],
        "employee_id": employee['employee_id'],
        "weekly_attendance": weekly_attendance
    })

# Get employee leave balance
@app.route('/api/employee/leave-balance')
def get_employee_leave_balance():
    if 'user_type' not in session or session['user_type'] != 'employee':
        return jsonify({"error": "Unauthorized"}), 401
    
    # Calculate used leaves for current year
    current_year = datetime.now().year
    employee_leaves = [r for r in leave_requests if r['employee_id'] == session['user_id']]
    
    # Count approved leaves by type for current year
    used_leaves = {
        "Sick": 0,
        "Emergency": 0,
        "Vacation": 0
    }
    
    for leave in employee_leaves:
        if leave['status'] == 'Approved':
            start_date = datetime.strptime(leave['start_date'], '%Y-%m-%d')
            if start_date.year == current_year:
                leave_type = leave['type']
                if leave_type in used_leaves:
                    end_date = datetime.strptime(leave['end_date'], '%Y-%m-%d')
                    days = (end_date - start_date).days + 1
                    used_leaves[leave_type] += days
    
    # Leave limits
    leave_limits = {
        "Sick": 5,
        "Emergency": 3,
        "Vacation": 15
    }
    
    # Calculate remaining leaves
    remaining_leaves = {}
    for leave_type, limit in leave_limits.items():
        remaining_leaves[leave_type] = max(0, limit - used_leaves[leave_type])
    
    return jsonify({
        "leave_limits": leave_limits,
        "used_leaves": used_leaves,
        "remaining_leaves": remaining_leaves
    })

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = next((u for u in users if u['id'] == user_id), None)
    if user:
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404

@app.route('/api/users', methods=['POST'])
def add_user():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json()
    new_user = {
        "id": len(users) + 1,
        "name": data.get('name'),
        "email": data.get('email'),
        "password": hashlib.md5("password123".encode()).hexdigest(),  # Default password
        "role": data.get('role'),
        "department": data.get('department', 'General'),
        "salary": data.get('salary', 50000),
        "hire_date": data.get('hire_date', datetime.now().strftime("%Y-%m-%d")),
        "status": "Active",
        "phone": data.get('phone', ''),
        "address": data.get('address', ''),
        "employee_id": f"EMP{len(users) + 1:03d}",
        "profile_photo": None,
        "documents": {
            "resume": None,
            "certificates": [],
            "offer_letter": None
        },
        "salary_structure": {
            "basic": int(data.get('salary', 50000) * 0.6),
            "hra": int(data.get('salary', 50000) * 0.2),
            "allowances": int(data.get('salary', 50000) * 0.15),
            "deductions": int(data.get('salary', 50000) * 0.05)
        }
    }
    users.append(new_user)
    return jsonify(new_user), 201

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = next((u for u in users if u['id'] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    user.update({
        "name": data.get('name', user['name']),
        "email": data.get('email', user['email']),
        "role": data.get('role', user['role']),
        "department": data.get('department', user['department']),
        "salary": data.get('salary', user['salary']),
        "phone": data.get('phone', user['phone']),
        "address": data.get('address', user['address']),
        "status": data.get('status', user['status'])
    })
    return jsonify(user)

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    global users
    users = [user for user in users if user['id'] != user_id]
    return jsonify({"message": "User deleted successfully"})

# Attendance endpoints
@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    employee_id = request.args.get('employee_id')
    if employee_id:
        filtered_data = [a for a in attendance_data if a['employee_id'] == int(employee_id)]
        return jsonify(filtered_data)
    return jsonify(attendance_data)

@app.route('/api/attendance', methods=['POST'])
def add_attendance():
    data = request.get_json()
    new_attendance = {
        "employee_id": data.get('employee_id'),
        "date": data.get('date'),
        "status": data.get('status'),
        "hours_worked": data.get('hours_worked', 8)
    }
    attendance_data.append(new_attendance)
    return jsonify(new_attendance), 201

# Leave requests endpoints
@app.route('/api/leave-requests', methods=['GET'])
def get_leave_requests():
    return jsonify(leave_requests)

@app.route('/api/leave-requests', methods=['POST'])
def add_leave_request():
    data = request.get_json()
    new_request = {
        "id": len(leave_requests) + 1,
        "employee_id": data.get('employee_id'),
        "start_date": data.get('start_date'),
        "end_date": data.get('end_date'),
        "type": data.get('type'),
        "status": "Pending",
        "reason": data.get('reason', '')
    }
    leave_requests.append(new_request)
    return jsonify(new_request), 201

@app.route('/api/leave-requests/<int:request_id>', methods=['PUT'])
def update_leave_request(request_id):
    leave_request = next((r for r in leave_requests if r['id'] == request_id), None)
    if not leave_request:
        return jsonify({"error": "Leave request not found"}), 404
    
    data = request.get_json()
    leave_request['status'] = data.get('status', leave_request['status'])
    return jsonify(leave_request)

# Reports endpoints
@app.route('/api/reports/dashboard', methods=['GET'])
def get_dashboard_stats():
    total_employees = len(users)
    active_employees = len([u for u in users if u['status'] == 'Active'])
    departments = list(set([u['department'] for u in users]))
    avg_salary = sum([u['salary'] for u in users]) / len(users) if users else 0
    
    # Recent attendance summary
    recent_attendance = [a for a in attendance_data if a['date'] >= (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")]
    present_today = len([a for a in recent_attendance if a['status'] == 'Present' and a['date'] == datetime.now().strftime("%Y-%m-%d")])
    
    return jsonify({
        "total_employees": total_employees,
        "active_employees": active_employees,
        "departments": len(departments),
        "avg_salary": round(avg_salary, 2),
        "present_today": present_today,
        "pending_leaves": len([r for r in leave_requests if r['status'] == 'Pending'])
    })

@app.route('/api/reports/attendance', methods=['GET'])
def get_attendance_report():
    # Group attendance by employee
    employee_attendance = {}
    for attendance in attendance_data:
        emp_id = attendance['employee_id']
        if emp_id not in employee_attendance:
            employee_attendance[emp_id] = {
                "present": 0,
                "absent": 0,
                "late": 0,
                "total_hours": 0
            }
        
        status = attendance['status']
        if status == 'Present':
            employee_attendance[emp_id]['present'] += 1
        elif status == 'Absent':
            employee_attendance[emp_id]['absent'] += 1
        elif status == 'Late':
            employee_attendance[emp_id]['late'] += 1
        
        employee_attendance[emp_id]['total_hours'] += attendance['hours_worked']
    
    # Add employee names
    report = []
    for emp_id, stats in employee_attendance.items():
        employee = next((u for u in users if u['id'] == emp_id), None)
        if employee:
            total_days = stats['present'] + stats['absent'] + stats['late']
            attendance_rate = (stats['present'] / total_days * 100) if total_days > 0 else 0
            report.append({
                "employee_name": employee['name'],
                "department": employee['department'],
                "attendance_rate": round(attendance_rate, 1),
                "total_hours": stats['total_hours'],
                **stats
            })
    
    return jsonify(report)

@app.route('/api/reports/salary', methods=['GET'])
def get_salary_report():
    # Group by department
    dept_salaries = {}
    for user in users:
        dept = user['department']
        if dept not in dept_salaries:
            dept_salaries[dept] = []
        dept_salaries[dept].append(user['salary'])
    
    report = []
    for dept, salaries in dept_salaries.items():
        report.append({
            "department": dept,
            "employee_count": len(salaries),
            "total_salary": sum(salaries),
            "avg_salary": round(sum(salaries) / len(salaries), 2),
            "min_salary": min(salaries),
            "max_salary": max(salaries)
        })
    
    return jsonify(report)

if __name__ == '__main__':
    app.run(debug=True)

# Payroll endpoints (Admin only)
@app.route('/api/payroll', methods=['GET'])
def get_payroll():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(payroll_data)

@app.route('/api/payroll', methods=['POST'])
def add_payroll():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json()
    new_payroll = {
        "id": len(payroll_data) + 1,
        "employee_id": data.get('employee_id'),
        "month": data.get('month'),
        "basic_salary": data.get('basic_salary'),
        "hra": data.get('hra'),
        "allowances": data.get('allowances'),
        "overtime": data.get('overtime', 0),
        "bonus": data.get('bonus', 0),
        "deductions": data.get('deductions'),
        "tax": data.get('tax'),
        "net_salary": data.get('net_salary'),
        "status": "Pending"
    }
    payroll_data.append(new_payroll)
    return jsonify(new_payroll), 201

@app.route('/api/payroll/<int:payroll_id>', methods=['PUT'])
def update_payroll(payroll_id):
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
        
    payroll = next((p for p in payroll_data if p['id'] == payroll_id), None)
    if not payroll:
        return jsonify({"error": "Payroll record not found"}), 404
    
    data = request.get_json()
    payroll.update(data)
    return jsonify(payroll)

# Test endpoint for payroll generation
@app.route('/api/admin/test-payroll', methods=['GET'])
def test_payroll_generation():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    return jsonify({
        'users_count': len(users),
        'active_users': len([u for u in users if u.get('status') == 'Active']),
        'users_with_salary': len([u for u in users if u.get('salary')]),
        'current_payroll_count': len(payroll_data),
        'sample_user': users[0] if users else None
    })

# Auto-generate payroll for all employees
@app.route('/api/admin/generate-payroll', methods=['POST'])
def generate_monthly_payroll():
    print("Payroll generation endpoint called")
    
    if 'user_type' not in session or session['user_type'] != 'admin':
        print("Unauthorized access attempt")
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    target_month = data.get('month')
    
    print(f"Target month: {target_month}")
    
    if not target_month:
        return jsonify({'error': 'Month is required'}), 400
    
    # Check if payroll already exists for this month
    existing_payroll = [p for p in payroll_data if p['month'] == target_month]
    if existing_payroll:
        print(f"Payroll already exists for {target_month}")
        return jsonify({'error': f'Payroll for {target_month} already exists'}), 400
    
    generated_count = 0
    print(f"Number of users: {len(users)}")
    
    # Generate payroll for all active employees
    for employee in users:
        print(f"Processing employee: {employee.get('name')} - Status: {employee.get('status')} - Salary: {employee.get('salary')}")
        
        if employee.get('status') == 'Active' and employee.get('salary'):
            base_salary = employee['salary']
            
            # Calculate salary components (standard breakdown)
            basic_salary = int(base_salary * 0.5)  # 50% basic
            hra = int(base_salary * 0.2)  # 20% HRA
            allowances = int(base_salary * 0.15)  # 15% allowances
            
            # Calculate attendance-based adjustments
            monthly_attendance = get_employee_monthly_attendance(employee['id'], target_month)
            working_days = 22  # Standard working days per month
            present_days = len([a for a in monthly_attendance if a['status'] in ['Present', 'Late']])
            
            print(f"Employee {employee['name']}: {present_days}/{working_days} days present")
            
            # Adjust salary based on attendance
            attendance_ratio = present_days / working_days if working_days > 0 else 1
            basic_salary = int(basic_salary * attendance_ratio)
            hra = int(hra * attendance_ratio)
            allowances = int(allowances * attendance_ratio)
            
            # Calculate overtime (if any late days, reduce overtime)
            late_days = len([a for a in monthly_attendance if a['status'] == 'Late'])
            overtime = max(0, int(base_salary * 0.05) - (late_days * 500))  # Reduce overtime for late days
            
            # Calculate bonus (performance-based, random for demo)
            bonus = random.randint(0, int(base_salary * 0.1))
            
            # Calculate deductions
            pf_deduction = int(basic_salary * 0.12)  # 12% PF
            insurance = 2000  # Fixed insurance
            other_deductions = random.randint(0, 1000)
            total_deductions = pf_deduction + insurance + other_deductions
            
            # Calculate tax (simplified tax calculation)
            gross_salary = basic_salary + hra + allowances + overtime + bonus
            tax = int(gross_salary * 0.1) if gross_salary > 30000 else int(gross_salary * 0.05)
            
            # Calculate net salary
            net_salary = gross_salary - total_deductions - tax
            
            # Create payroll entry
            new_payroll = {
                'id': len(payroll_data) + 1,
                'employee_id': employee['id'],
                'month': target_month,
                'basic_salary': basic_salary,
                'hra': hra,
                'allowances': allowances,
                'overtime': overtime,
                'bonus': bonus,
                'deductions': total_deductions,
                'tax': tax,
                'net_salary': net_salary,
                'status': 'Pending',
                'generated_date': datetime.now().strftime("%Y-%m-%d"),
                'working_days': working_days,
                'present_days': present_days,
                'attendance_ratio': round(attendance_ratio * 100, 2)
            }
            
            payroll_data.append(new_payroll)
            generated_count += 1
            print(f"Generated payroll for {employee['name']}")
    
    print(f"Total payroll records generated: {generated_count}")
    
    return jsonify({
        'message': f'Payroll generated successfully for {target_month}',
        'count': generated_count,
        'month': target_month
    })

# Get employee monthly attendance for payroll calculation
def get_employee_monthly_attendance(employee_id, month):
    """Get attendance records for an employee for a specific month"""
    year_month = month  # Format: YYYY-MM
    return [a for a in attendance_data 
            if a['employee_id'] == employee_id and a['date'].startswith(year_month)]

# Bulk update payroll status
@app.route('/api/admin/payroll/bulk-update', methods=['POST'])
def bulk_update_payroll():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    payroll_ids = data.get('payroll_ids', [])
    new_status = data.get('status', 'Paid')
    
    updated_count = 0
    for payroll in payroll_data:
        if payroll['id'] in payroll_ids:
            payroll['status'] = new_status
            if new_status == 'Paid':
                payroll['paid_date'] = datetime.now().strftime("%Y-%m-%d")
            updated_count += 1
    
    return jsonify({
        'message': f'Updated {updated_count} payroll records',
        'count': updated_count
    })

# Delete payroll entry
@app.route('/api/admin/payroll/<int:payroll_id>', methods=['DELETE'])
def delete_payroll(payroll_id):
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    global payroll_data
    payroll_data = [p for p in payroll_data if p['id'] != payroll_id]
    
    return jsonify({'message': 'Payroll deleted successfully'})

# Get payroll summary
@app.route('/api/admin/payroll/summary', methods=['GET'])
def get_payroll_summary():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    month = request.args.get('month')
    
    if month:
        month_payroll = [p for p in payroll_data if p['month'] == month]
    else:
        # Current month
        current_month = datetime.now().strftime("%Y-%m")
        month_payroll = [p for p in payroll_data if p['month'] == current_month]
    
    total_employees = len(month_payroll)
    total_gross = sum(p['basic_salary'] + p['hra'] + p['allowances'] + p['overtime'] + p['bonus'] for p in month_payroll)
    total_deductions = sum(p['deductions'] + p['tax'] for p in month_payroll)
    total_net = sum(p['net_salary'] for p in month_payroll)
    paid_count = len([p for p in month_payroll if p['status'] == 'Paid'])
    pending_count = len([p for p in month_payroll if p['status'] == 'Pending'])
    
    return jsonify({
        'month': month or datetime.now().strftime("%Y-%m"),
        'total_employees': total_employees,
        'total_gross_salary': total_gross,
        'total_deductions': total_deductions,
        'total_net_salary': total_net,
        'paid_count': paid_count,
        'pending_count': pending_count,
        'average_salary': total_net // total_employees if total_employees > 0 else 0
    })

@app.route('/api/reports/payroll', methods=['GET'])
def get_payroll_report():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
        
    # Group payroll by month
    monthly_payroll = {}
    for payroll in payroll_data:
        month = payroll['month']
        if month not in monthly_payroll:
            monthly_payroll[month] = {
                "month": month,
                "total_employees": 0,
                "total_gross": 0,
                "total_deductions": 0,
                "total_net": 0
            }
        
        monthly_payroll[month]["total_employees"] += 1
        monthly_payroll[month]["total_gross"] += payroll["basic_salary"] + payroll["hra"] + payroll["allowances"] + payroll["overtime"] + payroll["bonus"]
        monthly_payroll[month]["total_deductions"] += payroll["deductions"] + payroll["tax"]
        monthly_payroll[month]["total_net"] += payroll["net_salary"]
    
    return jsonify(list(monthly_payroll.values()))
# Enhanced Attendance Management Endpoints

@app.route('/api/attendance', methods=['POST'])
def add_attendance():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json()
    employee_id = data.get('employee_id')
    date = data.get('date')
    status = data.get('status')
    hours_worked = data.get('hours_worked', 0)
    check_in = data.get('check_in')
    check_out = data.get('check_out')
    remarks = data.get('remarks', '')
    
    if not employee_id or not date or not status:
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if attendance already exists for this employee and date
    existing_attendance = next((a for a in attendance_data if a['employee_id'] == employee_id and a['date'] == date), None)
    
    if existing_attendance:
        # Update existing attendance
        existing_attendance.update({
            'status': status,
            'hours_worked': hours_worked,
            'check_in': check_in,
            'check_out': check_out,
            'remarks': remarks,
            'created_by': 'HR Admin'
        })
        return jsonify(existing_attendance)
    else:
        # Create new attendance record
        new_attendance = {
            "id": len(attendance_data) + 1,
            "employee_id": employee_id,
            "date": date,
            "status": status,
            "hours_worked": hours_worked,
            "check_in": check_in,
            "check_out": check_out,
            "remarks": remarks,
            "created_by": "HR Admin",
            "created_date": datetime.now().strftime("%Y-%m-%d"),
            "overtime_hours": 0
        }
        attendance_data.append(new_attendance)
        return jsonify(new_attendance), 201

@app.route('/api/attendance/<int:attendance_id>', methods=['PUT'])
def update_attendance(attendance_id):
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
        
    attendance_record = next((a for a in attendance_data if a['id'] == attendance_id), None)
    if not attendance_record:
        return jsonify({"error": "Attendance record not found"}), 404
    
    data = request.get_json()
    attendance_record.update({
        'status': data.get('status', attendance_record['status']),
        'hours_worked': data.get('hours_worked', attendance_record['hours_worked']),
        'check_in': data.get('check_in', attendance_record['check_in']),
        'check_out': data.get('check_out', attendance_record['check_out']),
        'remarks': data.get('remarks', attendance_record['remarks']),
        'created_by': 'HR Admin'
    })
    
    return jsonify(attendance_record)

@app.route('/api/attendance/<int:attendance_id>', methods=['DELETE'])
def delete_attendance(attendance_id):
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
        
    global attendance_data
    attendance_data = [a for a in attendance_data if a['id'] != attendance_id]
    
    return jsonify({"message": "Attendance record deleted successfully"})

@app.route('/api/attendance/bulk', methods=['POST'])
def bulk_add_attendance():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.get_json()
    attendance_records = data.get('attendance_records', [])
    
    if not attendance_records:
        return jsonify({"error": "No attendance records provided"}), 400
    
    created_count = 0
    updated_count = 0
    
    for record in attendance_records:
        employee_id = record.get('employee_id')
        date = record.get('date')
        
        if not employee_id or not date:
            continue
            
        # Check if attendance already exists
        existing_attendance = next((a for a in attendance_data if a['employee_id'] == employee_id and a['date'] == date), None)
        
        if existing_attendance:
            # Update existing
            existing_attendance.update({
                'status': record.get('status', existing_attendance['status']),
                'hours_worked': record.get('hours_worked', existing_attendance['hours_worked']),
                'check_in': record.get('check_in', existing_attendance['check_in']),
                'check_out': record.get('check_out', existing_attendance['check_out']),
                'remarks': record.get('remarks', existing_attendance['remarks']),
                'created_by': 'HR Admin'
            })
            updated_count += 1
        else:
            # Create new
            new_attendance = {
                "id": len(attendance_data) + 1,
                "employee_id": employee_id,
                "date": date,
                "status": record.get('status', 'Present'),
                "hours_worked": record.get('hours_worked', 8),
                "check_in": record.get('check_in'),
                "check_out": record.get('check_out'),
                "remarks": record.get('remarks', 'Bulk attendance entry'),
                "created_by": "HR Admin",
                "created_date": datetime.now().strftime("%Y-%m-%d"),
                "overtime_hours": 0
            }
            attendance_data.append(new_attendance)
            created_count += 1
    
    return jsonify({
        "message": f"Bulk attendance processed successfully",
        "created": created_count,
        "updated": updated_count,
        "total": created_count + updated_count
    })

@app.route('/api/attendance/statistics', methods=['GET'])
def get_attendance_statistics():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    date = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    
    # Get attendance for specific date
    date_attendance = [a for a in attendance_data if a['date'] == date]
    
    # Calculate statistics
    total_employees = len(users)
    present_count = len([a for a in date_attendance if a['status'] in ['Present', 'Work From Home']])
    absent_count = len([a for a in date_attendance if a['status'] == 'Absent'])
    late_count = len([a for a in date_attendance if a['status'] == 'Late'])
    half_day_count = len([a for a in date_attendance if a['status'] == 'Half Day'])
    
    attendance_rate = (present_count / total_employees * 100) if total_employees > 0 else 0
    
    return jsonify({
        "date": date,
        "total_employees": total_employees,
        "present_count": present_count,
        "absent_count": absent_count,
        "late_count": late_count,
        "half_day_count": half_day_count,
        "attendance_rate": round(attendance_rate, 2),
        "marked_attendance": len(date_attendance),
        "pending_attendance": total_employees - len(date_attendance)
    })

@app.route('/api/attendance/report', methods=['GET'])
def get_attendance_report():
    if 'user_type' not in session or session['user_type'] != 'admin':
        return jsonify({"error": "Unauthorized"}), 401
    
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    employee_id = request.args.get('employee_id')
    
    filtered_attendance = attendance_data
    
    if start_date:
        filtered_attendance = [a for a in filtered_attendance if a['date'] >= start_date]
    
    if end_date:
        filtered_attendance = [a for a in filtered_attendance if a['date'] <= end_date]
    
    if employee_id:
        filtered_attendance = [a for a in filtered_attendance if a['employee_id'] == int(employee_id)]
    
    # Add employee information to each record
    report_data = []
    for record in filtered_attendance:
        employee = next((u for u in users if u['id'] == record['employee_id']), None)
        if employee:
            report_record = record.copy()
            report_record['employee_name'] = employee['name']
            report_record['employee_id_code'] = employee['employee_id']
            report_record['department'] = employee['department']
            report_data.append(report_record)
    
    return jsonify(report_data)