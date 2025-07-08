# Network Visualizer

A comprehensive network visualization and management tool built with Django (backend) and React (frontend). This application allows you to create, manage, and visualize network devices and their connections in an interactive web interface.

## 🚀 Features

### Core Functionality
- **Device Management**: Add, edit, and manage network devices (computers, servers, routers, switches, printers, mobile devices, IoT devices)
- **Connection Visualization**: Create and visualize connections between devices with different types (LAN, WiFi, Bluetooth, USB, Serial)
- **Interactive Network Map**: Visualize your network topology using React Flow
- **Device Details**: View detailed information about each device including IP addresses, MAC addresses, and device photos
- **Configuration Files**: Upload and manage configuration files for devices

### Device Types Supported
- Computer
- Server
- Router
- Switch
- Printer
- Mobile Device
- IoT Device
- Other

### Connection Types
- LAN
- WiFi

## 🛠️ Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework 3.14.0** - API framework
- **Django CORS Headers 4.3.0** - Cross-origin resource sharing
- **Pillow 10.1.0** - Image processing
- **psycopg2-binary 2.9.9** - PostgreSQL adapter
- **python-dotenv 1.0.0** - Environment variable management

### Frontend
- **React 18.2.0** - UI library
- **React Router DOM 6.20.0** - Client-side routing
- **React Flow Renderer 10.3.17** - Network visualization
- **Axios 1.6.2** - HTTP client
- **React Scripts 5.0.1** - Build tools

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Python 3.8+**
- **Node.js 14+**
- **npm** (comes with Node.js)
- **PostgreSQL** (optional, SQLite is used by default)

## 🚀 Quick Start

### Option 1: Using the Automated Script (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd network-visualizer
   ```

2. **Make the run script executable**
   ```bash
   chmod +x run.sh
   ```

3. **Run the application**
   ```bash
   ./run.sh
   ```

The script will automatically:
- Check for required dependencies
- Set up Python virtual environment
- Install backend dependencies
- Apply database migrations
- Install frontend dependencies
- Start both Django and React servers

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the Django server**
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the React development server**
   ```bash
   npm start
   ```

## 🌐 Access Points

Once the application is running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## 📁 Project Structure

```
network-visualizer/
├── backend/
│   ├── api/                    # API endpoints
│   ├── manage.py              # Django management script
│   ├── media/                 # Uploaded files
│   ├── network_api/           # Main Django app
│   │   ├── models.py          # Database models
│   │   ├── serializers.py     # API serializers
│   │   ├── views.py           # API views
│   │   └── urls.py            # URL routing
│   ├── network_backend/       # Django project settings
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   │   ├── Home.js        # Home page
│   │   │   ├── DeviceList.js  # Device listing
│   │   │   ├── DeviceDetail.js # Device details
│   │   │   ├── DeviceForm.js  # Device form
│   │   │   └── NetworkMap.js  # Network visualization
│   │   ├── services/          # API services
│   │   └── App.js             # Main React component
│   └── package.json           # Node.js dependencies
├── run.sh                     # Automated startup script
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory for environment-specific settings:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Database Configuration

The application uses SQLite by default. To use PostgreSQL:

1. Install PostgreSQL
2. Create a database
3. Update the `DATABASE_URL` in your `.env` file
4. Install `psycopg2-binary` (already in requirements.txt)

## 📖 API Documentation

### Devices

- `GET /api/devices/` - List all devices
- `POST /api/devices/` - Create a new device
- `GET /api/devices/{id}/` - Get device details
- `PUT /api/devices/{id}/` - Update device
- `DELETE /api/devices/{id}/` - Delete device

### Connections

- `GET /api/connections/` - List all connections
- `POST /api/connections/` - Create a new connection
- `GET /api/connections/{id}/` - Get connection details
- `PUT /api/connections/{id}/` - Update connection
- `DELETE /api/connections/{id}/` - Delete connection

## 🎯 Usage Guide

### Adding Devices

1. Navigate to the "Devices" page
2. Click "Add New Device"
3. Fill in the device information:
   - Hostname (required)
   - IP Address (optional)
   - MAC Address (optional)
   - Device Type
   - Photo (optional)
   - Notes (optional)
4. Click "Save"

### Creating Connections

1. Navigate to the "Network Map" page
2. Drag devices to create connections
3. Select the connection type
4. Save the connection

### Visualizing Your Network

1. Go to the "Network Map" page
2. View your network topology
3. Interact with the visualization:
   - Pan and zoom
   - Click on devices for details
   - Drag devices to reposition

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Configure Django for production**
   - Set `DEBUG=False`
   - Configure static files
   - Set up a production database
   - Configure your web server (nginx, Apache)





---

**Happy Network Visualizing! 🚀** 