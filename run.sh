#!/bin/bash

# Network Visualizer Startup Script
# This script sets up and runs both the backend (Django) and frontend (React) servers

# Function to check if a port is in use and optionally kill the process
check_port() {
    local port=$1
    local kill_process=$2

    if lsof -i :$port > /dev/null 2>&1; then
        if [ "$kill_process" = "true" ]; then
            echo "Port $port is in use. Attempting to free it..."
            lsof -ti :$port | xargs kill -9 2>/dev/null
            sleep 1
            return 0
        else
            return 1
        fi
    fi
    return 0
}

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${BOLD}Network Visualizer Setup and Run Script${NC}"
echo "========================================"
echo

# Check for required dependencies
echo -e "${BOLD}Checking dependencies...${NC}"

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 is installed${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js is installed${NC}"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm is installed${NC}"
echo

# Setup and run backend
echo -e "${BOLD}Setting up backend (Django)...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Apply migrations
echo "Applying database migrations..."
python manage.py migrate

# Check if Django port is in use and free it if necessary
check_port 8000 true

# Start Django server in the background
echo -e "${GREEN}Starting Django server...${NC}"
python manage.py runserver &
DJANGO_PID=$!
echo -e "${GREEN}Django server running with PID: $DJANGO_PID${NC}"
echo

# Setup and run frontend
echo -e "${BOLD}Setting up frontend (React)...${NC}"
cd ../frontend

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Check if React port is in use and free it if necessary
check_port 3000 true

# Start React development server
echo -e "${GREEN}Starting React development server...${NC}"
npm start &
REACT_PID=$!
echo -e "${GREEN}React server running with PID: $REACT_PID${NC}"
echo

# Print access information
echo -e "${BOLD}Network Visualizer is now running!${NC}"
echo -e "Backend API: ${GREEN}http://localhost:8000/api/${NC}"
echo -e "Django Admin: ${GREEN}http://localhost:8000/admin/${NC}"
echo -e "Frontend: ${GREEN}http://localhost:3000${NC}"
echo
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Function to safely kill a process
kill_process() {
    local pid=$1
    local name=$2

    if ps -p $pid > /dev/null 2>&1; then
        echo -e "Stopping ${name} (PID: $pid)..."
        kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
    else
        echo -e "${name} process (PID: $pid) is no longer running"
    fi
}

# Handle script termination
trap "echo -e '${YELLOW}Stopping servers...${NC}'; kill_process $DJANGO_PID 'Django server'; kill_process $REACT_PID 'React server'; echo -e '${GREEN}Servers stopped${NC}'; exit" INT TERM

# Keep script running
wait
