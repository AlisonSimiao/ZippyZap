#!/bin/bash

# Function to kill all background processes on exit
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to catch SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "Starting Zapi Services..."

# Start Backend API
echo "Starting Backend API..."
(cd backend/api && yarn start:dev) &

# Start Backend WSS
echo "Starting Backend WSS..."
(cd backend/wss && yarn start:dev) &

# Start Frontend
echo "Starting Frontend..."
(cd web && yarn dev) &

# Wait for all background processes
wait
