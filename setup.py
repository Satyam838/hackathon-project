#!/usr/bin/env python3
"""
HR Management System Setup Script
This script helps set up the HR Management System on any PC
"""

import os
import sys
import subprocess
import platform

def check_python_version():
    """Check if Python version is 3.7 or higher"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Error: Python 3.7 or higher is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        print("   Please install Python 3.7+ from https://www.python.org/downloads/")
        return False
    else:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
        return True

def check_pip():
    """Check if pip is available"""
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      check=True, capture_output=True)
        print("✅ pip is available")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error: pip is not available")
        print("   Please install pip or reinstall Python with pip included")
        return False

def create_virtual_environment():
    """Create virtual environment"""
    venv_name = "hr_env"
    
    if os.path.exists(venv_name):
        print(f"✅ Virtual environment '{venv_name}' already exists")
        return True
    
    try:
        print(f"📦 Creating virtual environment '{venv_name}'...")
        subprocess.run([sys.executable, "-m", "venv", venv_name], check=True)
        print(f"✅ Virtual environment '{venv_name}' created successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error creating virtual environment: {e}")
        return False

def get_activation_command():
    """Get the command to activate virtual environment based on OS"""
    system = platform.system().lower()
    if system == "windows":
        return "hr_env\\Scripts\\activate"
    else:
        return "source hr_env/bin/activate"

def install_dependencies():
    """Install required dependencies"""
    try:
        print("📦 Installing dependencies...")
        
        # Get the appropriate pip command for the virtual environment
        system = platform.system().lower()
        if system == "windows":
            pip_cmd = os.path.join("hr_env", "Scripts", "pip")
        else:
            pip_cmd = os.path.join("hr_env", "bin", "pip")
        
        # Install dependencies
        subprocess.run([pip_cmd, "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        print("   Trying alternative installation method...")
        
        # Alternative method - install individually
        dependencies = ["Flask==2.3.3", "Werkzeug==2.3.7", "reportlab==4.0.4"]
        for dep in dependencies:
            try:
                subprocess.run([pip_cmd, "install", dep], check=True)
                print(f"✅ Installed {dep}")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {dep}")
                return False
        return True

def create_uploads_directory():
    """Create uploads directory if it doesn't exist"""
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
        print("✅ Created uploads directory")
    else:
        print("✅ Uploads directory already exists")

def verify_installation():
    """Verify that all components are properly installed"""
    print("\n🔍 Verifying installation...")
    
    # Get the appropriate python command for the virtual environment
    system = platform.system().lower()
    if system == "windows":
        python_cmd = os.path.join("hr_env", "Scripts", "python")
    else:
        python_cmd = os.path.join("hr_env", "bin", "python")
    
    # Test imports
    test_imports = [
        ("flask", "Flask"),
        ("werkzeug", "Werkzeug"),
        ("reportlab", "ReportLab")
    ]
    
    for module, name in test_imports:
        try:
            subprocess.run([python_cmd, "-c", f"import {module}"], 
                          check=True, capture_output=True)
            print(f"✅ {name} is properly installed")
        except subprocess.CalledProcessError:
            print(f"❌ {name} installation verification failed")
            return False
    
    return True

def main():
    """Main setup function"""
    print("🚀 HR Management System Setup")
    print("=" * 40)
    
    # Check prerequisites
    if not check_python_version():
        return False
    
    if not check_pip():
        return False
    
    # Setup steps
    if not create_virtual_environment():
        return False
    
    if not install_dependencies():
        return False
    
    create_uploads_directory()
    
    if not verify_installation():
        return False
    
    # Success message
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Activate the virtual environment:")
    print(f"   {get_activation_command()}")
    print("\n2. Run the application:")
    print("   python app.py")
    print("\n3. Open your browser and go to:")
    print("   http://127.0.0.1:5000")
    print("\n🔐 Default login credentials:")
    print("   Admin: admin / admin123")
    print("   Employee: EMP001, john@example.com / password123")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            print("\n❌ Setup failed. Please check the error messages above.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error during setup: {e}")
        sys.exit(1)