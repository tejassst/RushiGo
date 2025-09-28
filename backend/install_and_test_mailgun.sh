#!/bin/bash
# Install requests and test Mailgun setup

echo "🔧 Installing requests module..."
/home/tejast/Documents/Projects/rushiGo/backend/.venv/bin/pip install requests

echo ""
echo "🧪 Testing Mailgun setup..."
cd /home/tejast/Documents/Projects/rushiGo/backend
/home/tejast/Documents/Projects/rushiGo/backend/.venv/bin/python scripts/simple_mailgun_test.py