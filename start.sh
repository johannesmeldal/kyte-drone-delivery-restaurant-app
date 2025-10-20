#!/bin/bash

# Start script for Kyte Restaurant App

echo "🚀 Starting Kyte Restaurant App..."

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use. Please stop the service using that port first."
        exit 1
    fi
}

# Check ports
check_port 3000
check_port 8000
check_port 8001

echo "📦 Starting Django backend..."
cd backend
python3 manage.py runserver &
DJANGO_PID=$!

echo "🎭 Starting Mock Kyte backend..."
cd ../mock_kyte_backend
python3 mock_server.py &
MOCK_PID=$!

echo "⚛️ Starting React frontend..."
cd ../frontend
npm start &
REACT_PID=$!

echo "✅ All services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000/api"
echo "🎭 Mock Kyte Backend: http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo '🛑 Stopping all services...'; kill $DJANGO_PID $MOCK_PID $REACT_PID; exit" INT
wait
