# HR Management System

A comprehensive HR Management System with separate admin and employee interfaces, built with Flask (Python backend) and Bootstrap (frontend) featuring a sleek dark theme.

## Features

### 🔐 Authentication System
- **Dual Login Interface**: Separate login for Admin and Employee users
- **Session Management**: Secure session handling with role-based access
- **Demo Credentials**: 
  - Admin: `admin` / `admin123`
  - Employee: Employee ID: `EMP001`, Email: `john@example.com`, Role: `Developer` / `password123`

### 👨‍💼 Admin Dashboard
- **Employee Management**: Add, view, edit, and delete employees
- **Salary Details View**: Complete salary breakdown and payroll history
- **Document Management**: View and download employee documents
- **Weekly Attendance**: Individual employee weekly attendance tracking
- **Attendance Tracking**: Mark and monitor employee attendance
- **Leave Management**: Approve/reject leave requests
- **Payroll System**: Generate and manage employee payroll
- **Comprehensive Reports**: Attendance, salary, and departmental analytics
- **Dashboard Analytics**: Real-time statistics and metrics

### 👤 Employee Portal
- **Enhanced Authentication**: Login with Employee ID, Email, and Role
- **Personal Profile**: View and edit personal information
- **Profile Photo**: Upload and manage profile pictures
- **Weekly Attendance View**: Visual weekly attendance summary
- **Attendance History**: View personal attendance records
- **Leave Applications**: Apply for leave and track status
- **Payroll Access**: View salary history and download PDF payslips
- **Document Management**: Upload resume, certificates, download offer letter
- **Salary Structure**: Detailed breakdown of salary components

### 💰 Payroll Management
- **Salary Structure**: Basic salary, HRA, allowances, deductions
- **Automated Calculations**: Tax calculations and net salary computation
- **Monthly Payroll**: Generate monthly payroll for all employees
- **PDF Payslip Generation**: Downloadable PDF payslips for employees
- **Payment Status**: Track paid/pending salary status
- **Admin Salary View**: Complete salary details and history for each employee

### 📊 Advanced Features
- **Enhanced Authentication**: Multi-field employee login (ID, Email, Role)
- **Weekly Attendance Views**: Visual weekly attendance summaries
- **Document Upload System**: Real file upload functionality for resumes and certificates
- **PDF Generation**: Automated payslip and offer letter PDF generation
- **Admin Document Access**: View and manage all employee documents
- **Dark Theme UI**: Modern dark interface with custom styling
- **Responsive Design**: Works seamlessly on all devices
- **Real-time Updates**: Live data synchronization
- **Interactive Reports**: Visual progress bars and charts
- **Status Tracking**: Comprehensive status management for all entities

## Project Structure

```
├── app.py                 # Flask application with authentication
├── requirements.txt       # Python dependencies
├── templates/
│   ├── login.html        # Login page
│   ├── admin.html        # Admin dashboard
│   └── employee.html     # Employee portal
├── static/
│   ├── css/
│   │   └── style.css     # Enhanced dark theme styles
│   └── js/
│       ├── admin.js      # Admin dashboard functionality
│       └── employee.js   # Employee portal functionality
└── README.md
```

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## User Roles & Access

### Admin Access
- Full system access
- Employee management
- Payroll generation
- Leave approval
- System reports

### Employee Access
- Personal profile management
- Attendance viewing
- Leave applications
- Payroll history
- Document management

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Admin Endpoints
- `GET/POST /api/users` - Employee management
- `GET/POST /api/attendance` - Attendance management
- `GET/POST/PUT /api/leave-requests` - Leave management
- `GET/POST/PUT /api/payroll` - Payroll management
- `GET /api/reports/*` - Various reports

### Employee Endpoints
- `GET/PUT /api/employee/profile` - Profile management
- `GET /api/employee/attendance` - Personal attendance
- `GET /api/employee/attendance/weekly` - Weekly attendance summary
- `GET/POST /api/employee/leave-requests` - Personal leave requests
- `GET /api/employee/payroll` - Personal payroll history
- `POST /api/employee/upload-document` - Upload documents (resume, certificates)
- `GET /api/employee/download-payslip/<id>` - Download PDF payslip
- `GET /api/employee/download-offer-letter` - Download PDF offer letter

### Admin-Only Endpoints
- `GET /api/admin/employee-documents/<id>` - View employee documents
- `GET /api/admin/salary-details/<id>` - View employee salary details
- `GET /api/admin/employee-weekly-attendance/<id>` - Employee weekly attendance

## Technologies Used

- **Backend**: Flask (Python), Session Management
- **Frontend**: HTML5, CSS3, Bootstrap 5, JavaScript
- **Authentication**: Session-based with role management
- **Icons**: Font Awesome
- **Theme**: Custom dark theme with modern gradients
- **Security**: Password hashing, session protection

## Demo Data

The system comes with pre-populated demo data including:
- 5 sample employees with complete profiles
- 6 months of payroll history
- 30 days of attendance records
- Sample leave requests
- Admin user account

## Security Features

- Password hashing using MD5 (upgrade to bcrypt in production)
- Session-based authentication
- Role-based access control
- CSRF protection ready
- Secure route protection

## Future Enhancements

- Email notifications for leave approvals
- Advanced reporting with charts
- Employee performance tracking
- Integration with external payroll systems
- Mobile app development
- Multi-language support