#!/bin/bash

# LoadGuard AI Launcher Script
# Starts both the FastAPI Backend and Vite Frontend

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "============================================================"
echo "  🚀 Launching LoadGuard AI Platform..."
echo "  Field Intelligence & Predictive Damage Prevention"
echo "============================================================"

# Check Python environment
if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo "Creating Python virtualenv in $BACKEND_DIR/.venv..."
    python3 -m venv "$BACKEND_DIR/.venv"
    "$BACKEND_DIR/.venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

# Check Node modules
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "Installing frontend npm dependencies..."
    cd "$FRONTEND_DIR" && npm install
fi

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping LoadGuard AI services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# 1. Start Backend
echo "Starting FastAPI Backend on http://localhost:8000..."
cd "$BACKEND_DIR"
"$BACKEND_DIR/.venv/bin/uvicorn" main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 2. Start Frontend
echo "Starting Vite Frontend on http://localhost:5173..."
cd "$FRONTEND_DIR"
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "============================================================"
echo "  ✅ LoadGuard AI is RUNNING!"
echo "  Frontend Dashboard: http://localhost:5173"
echo "  Backend REST API:   http://localhost:8000/docs"
echo "============================================================"
echo "Press Ctrl+C to stop all services."

wait
