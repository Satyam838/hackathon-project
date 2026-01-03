# HR Management System

A comprehensive HR Management System with separate admin and employee interfaces, built with Flask (Python backend) and Bootstrap (frontend) featuring a sleek dark theme and advanced payroll management.

## 🚀 Features

### 🔐 Authentication System
- **Dual Login Interface**: Separate login for Admin and Employee users
- **Session Management**: Secure session handling with role-based access
- **Enhanced Employee Login**: Employee ID, Email, and Password authentication

### 👨‍💼 Admin Dashboard
- **Employee Management**: Complete CRUD operations with "Edit Information" functionality
- **Advanced Payroll System**: Detailed salary breakdowns, bank details, deposit tracking
- **Comprehensive Attendance Management**: Individual and bulk attendance marking
- **Leave Management**: Approve/reject leave requests with balance tracking
- **Document Management**: View and download employee documents
- **Real-time Analytics**: Dashboard with live statistics and metrics
- **Export Capabilities**: Generate detailed CSV reports

### 👤 Employee Portal
- **Personal Profile Management**: View and edit personal information with photo upload
- **Attendance Tracking**: View attendance history with check-in/check-out times
- **Leave Applications**: Apply for leave with automatic balance calculation
- **Payroll Access**: View detailed salary history and download PDF payslips
- **Document Management**: Upload resume, certificates, download offer letter
- **Weekly Attendance View**: Visual weekly attendance summary

### 💰 Enhanced Payroll Management
- **Comprehensive Salary Components**: Basic, HRA, allowances, transport, medical, food allowances
- **Detailed Deductions**: PF, ESI, professional tax, insurance, loan deductions, income tax
- **Bank Integration**: Account details, deposit status, transaction tracking
- **Auto-Generation**: Monthly payroll with attendance-based calculations
- **Bulk Operations**: Process multiple deposits, generate payslips
- **Export Reports**: Detailed CSV exports with all salary components

### 📊 Advanced Attendance System
- **Multiple Status Types**: Present, Absent, Late, Half Day, Work From Home
- **Time Tracking**: Check-in/check-out times with automatic field updates
- **Bulk Processing**: Mark attendance for multiple employees simultaneously
- **Statistics Dashboard**: Real-time attendance metrics and rates
- **Advanced Filtering**: Filter by employee, date, and status
- **Export Capabilities**: Generate detailed attendance reports

## 📋 Prerequisites

Before running this application, ensure you have the following installed on your system:

### Required Software
- **Python 3.7 or higher** - [Download Python](https://www.python.org/downloads/)
- **pip** (Python package installer) - Usually comes with Python
- **Git** (optional, for cloning) - [Download Git](https://git-scm.com/downloads/)

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: At least 500MB free space
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+, or Edge 80+

## 🛠️ Installation & Setup

### Step 1: Clone or Download the Project
```bash
# Option 1: Clone with Git
git clone <repository-url>
cd hr-management-system

# Option 2: Download ZIP and extract
# Download the project files and extract to a folder
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv hr_env

# Activate virtual environment
# On Windows:
hr_env\Scripts\activate

# On macOS/Linux:
source hr_env/bin/activate
```

### Step 3: Install Python Dependencies
```bash
# Install all required packages
pip install -r requirements.txt

# If requirements.txt is missing, install manually:
pip install Flask==2.3.3
pip install Werkzeug==2.3.7
pip install reportlab==4.0.4
```

### Step 4: Verify Installation
```bash
# Check Python version
python --version

# Check if Flask is installed
python -c "import flask; print(flask.__version__)"

# Check if reportlab is installed
python -c "import reportlab; print('ReportLab installed successfully')"
```

### Step 5: Run the Application
```bash
# Start the Flask development server
python app.py

# You should see output like:
# * Running on http://127.0.0.1:5000
# * Debug mode: on
```

### Step 6: Access the Application
Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

## 📦 Dependencies

### Core Dependencies (requirements.txt)
```txt
Flask==2.3.3
Werkzeug==2.3.7
reportlab==4.0.4
```

### Detailed Dependency Information

#### Flask (2.3.3)
- **Purpose**: Web framework for Python
- **Used for**: Backend API, routing, session management
- **Installation**: `pip install Flask==2.3.3`

#### Werkzeug (2.3.7)
- **Purpose**: WSGI utility library for Python
- **Used for**: Secure filename handling, password hashing utilities
- **Installation**: `pip install Werkzeug==2.3.7`

#### ReportLab (4.0.4)
- **Purpose**: PDF generation library
- **Used for**: Generating payslips, offer letters, and reports
- **Installation**: `pip install reportlab==4.0.4`

### Frontend Dependencies (CDN-based)
These are loaded from CDN and don't require installation:

- **Bootstrap 5.3.0**: UI framework for responsive design
- **Font Awesome 6.0.0**: Icon library
- **Google Fonts (Inter)**: Typography

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env` file in the project root for custom configuration:
```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

### File Structure
```
hr-management-system/
├── app.py                     # Main Flask application
├── requirements.txt           # Python dependencies
├── README.md                 # This file
├── .env                      # Environment variables (optional)
├── templates/                # HTML templates
│   ├── login.html           # Login page
│   ├── admin.html           # Admin dashboard
│   ├── employee.html        # Employee portal
│   └── index.html           # Main dashboard (legacy)
├── static/                   # Static files
│   ├── css/
│   │   └── style.css        # Custom styles
│   └── js/
│       ├── admin.js         # Admin functionality
│       ├── employee.js      # Employee functionality
│       └── script.js        # Common scripts
└── uploads/                  # File uploads directory
```

## 🔐 Default Login Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin123`

### Employee Access Examples
| Employee ID | Email | Password |
|-------------|-------|----------|
| EMP001 | john@example.com | password123 |
| EMP002 | jane@example.com | password123 |
| EMP003 | mike@example.com | password123 |
| EMP004 | sarah@example.com | password123 |
| EMP005 | david@example.com | password123 |

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. "Module not found" Error
```bash
# Solution: Install missing dependencies
pip install -r requirements.txt
```

#### 2. "Port already in use" Error
```bash
# Solution: Use a different port
python app.py --port 5001
# Or kill the process using port 5000
```

#### 3. "Permission denied" Error (File uploads)
```bash
# Solution: Create uploads directory
mkdir uploads
# Or check folder permissions
```

#### 4. PDF Generation Issues
```bash
# Solution: Reinstall reportlab
pip uninstall reportlab
pip install reportlab==4.0.4
```

#### 5. Browser Compatibility Issues
- Use modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Clear browser cache and cookies
- Disable browser extensions that might interfere

### Debug Mode
To run in debug mode for development:
```bash
export FLASK_ENV=development  # On macOS/Linux
set FLASK_ENV=development     # On Windows
python app.py
```

## 🌐 Deployment

### For Production Deployment
1. **Change Secret Key**: Update the secret key in `app.py`
2. **Disable Debug Mode**: Set `debug=False` in `app.run()`
3. **Use Production Server**: Consider using Gunicorn or uWSGI
4. **Database**: Replace in-memory data with a proper database
5. **Security**: Implement proper password hashing (bcrypt)

### Example Production Setup
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 📊 System Features

### Payroll Management
- ✅ Detailed salary components and deductions
- ✅ Bank deposit tracking with transaction IDs
- ✅ Auto-generation based on attendance
- ✅ Bulk operations and CSV exports
- ✅ PDF payslip generation

### Attendance Management
- ✅ Individual and bulk attendance marking
- ✅ Multiple status types (Present, Late, WFH, etc.)
- ✅ Real-time statistics and filtering
- ✅ Export capabilities with detailed reports

### Employee Management
- ✅ Complete CRUD operations
- ✅ Document upload/download
- ✅ Profile management with photos
- ✅ Role-based access control

## 🔒 Security Notes

- Change default passwords before production use
- Update secret key in `app.py`
- Consider implementing HTTPS
- Regular security updates recommended
- Backup data regularly

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all dependencies are installed correctly
3. Ensure Python version compatibility (3.7+)
4. Check browser console for JavaScript errors

## 🚀 Quick Start Commands

```bash
# Complete setup in one go
git clone <repository-url>
cd hr-management-system
python -m venv hr_env
hr_env\Scripts\activate  # Windows
# source hr_env/bin/activate  # macOS/Linux
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5000 in your browser!