#!/bin/bash

echo ""
echo "========================================"
echo "  HR Management System - Unix Setup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.7+ from https://www.python.org/downloads/"
    echo "Or use your system package manager:"
    echo "  Ubuntu/Debian: sudo apt update && sudo apt install python3 python3-pip python3-venv"
    echo "  macOS: brew install python3"
    echo "  CentOS/RHEL: sudo yum install python3 python3-pip"
    exit 1
fi

echo "✅ Python 3 is installed"
echo ""

# Run the setup script
echo "🚀 Running setup script..."
python3 setup.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "1. Run: source hr_env/bin/activate"
echo "2. Run: python app.py"
echo "3. Open: http://127.0.0.1:5000"
echo ""