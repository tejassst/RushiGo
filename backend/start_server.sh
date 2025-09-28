#!/bin/bash

# RushiGo Backend Server Startup Script
# This script properly activates the virtual environment and starts the FastAPI server

# Change to backend directory
cd "$(dirname "$0")"

echo "Starting RushiGo Backend Server..."
echo "Current directory: $(pwd)"

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Error: Virtual environment not found. Please create it first with: python -m venv .venv"
    exit 1
fi

# Activate virtual environment and start server
echo "Activating virtual environment..."
source .venv/bin/activate

echo "Starting FastAPI server on http://localhost:8000"
echo "API documentation available at http://localhost:8000/docs"
echo "Press Ctrl+C to stop the server"

# Start the server
python main.py
