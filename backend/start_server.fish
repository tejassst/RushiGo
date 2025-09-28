#!/usr/bin/env fish

# RushiGo Backend Server Startup Script (Fish Shell)
# This script properly starts the FastAPI server using the virtual environment

# Change to backend directory
cd (dirname (status filename))

echo "🚀 Starting RushiGo Backend Server..."
echo "📁 Current directory: "(pwd)

# Check if virtual environment exists
if not test -d ".venv"
    echo "❌ Error: Virtual environment not found. Please create it first with: python -m venv .venv"
    exit 1
end

# Kill any existing server instances
echo "🔄 Stopping any existing server instances..."
pkill -f "python main.py" 2>/dev/null; or true

# Wait a moment for cleanup
sleep 1

echo "✅ Starting FastAPI server on http://localhost:8000"
echo "📖 API documentation available at http://localhost:8000/docs"
echo "🔍 Document scanning endpoint: http://localhost:8000/api/deadlines/scan-document"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server using the virtual environment Python
.venv/bin/python main.py
