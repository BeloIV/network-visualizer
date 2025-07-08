import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Device API
export const deviceAPI = {
  // Get all devices
  getDevices: () => api.get('/devices/'),

  // Get a single device by ID
  getDevice: (id) => api.get(`/devices/${id}/`),

  // Create a new device
  createDevice: (deviceData) => {
    const formData = new FormData();

    // Append all fields to formData
    Object.keys(deviceData).forEach(key => {
      if (key === 'photo' && deviceData[key] instanceof File) {
        formData.append(key, deviceData[key]);
      } else if (deviceData[key] !== null && deviceData[key] !== undefined) {
        formData.append(key, deviceData[key]);
      }
    });

    return api.post('/devices/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update an existing device
  updateDevice: (id, deviceData) => {
    const formData = new FormData();

    // Append all fields to formData
    Object.keys(deviceData).forEach(key => {
      if (key === 'photo' && deviceData[key] instanceof File) {
        formData.append(key, deviceData[key]);
      } else if (deviceData[key] !== null && deviceData[key] !== undefined) {
        formData.append(key, deviceData[key]);
      }
    });

    return api.put(`/devices/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete a device
  deleteDevice: (id) => api.delete(`/devices/${id}/`),

  // Check if a device is online
  checkDeviceStatus: (id) => api.post(`/devices/${id}/check_online_status/`),

  // Filter devices by type
  filterByType: (type) => api.get(`/devices/filter_by_type/?type=${type}`),

  // Filter devices by online status
  filterByStatus: (isOnline) => api.get(`/devices/filter_by_status/?is_online=${isOnline}`),

  // Autodiscover devices on a subnet
  autodiscover: (subnet = '192.168.1.0/24') => api.post('/devices/autodiscover/', { subnet }),
};

// Connection API
export const connectionAPI = {
  // Get all connections
  getConnections: () => api.get('/connections/'),

  // Get a single connection by ID
  getConnection: (id) => api.get(`/connections/${id}/`),

  // Create a new connection
  createConnection: (connectionData) => api.post('/connections/', connectionData),

  // Update an existing connection
  updateConnection: (id, connectionData) => api.put(`/connections/${id}/`, connectionData),

  // Delete a connection
  deleteConnection: (id) => api.delete(`/connections/${id}/`),

  // Filter connections by device
  filterByDevice: (deviceId) => api.get(`/connections/filter_by_device/?device_id=${deviceId}`),
};

// Configuration File API
export const configFileAPI = {
  // Get all configuration files
  getConfigFiles: () => api.get('/configuration-files/'),

  // Get a single configuration file by ID
  getConfigFile: (id) => api.get(`/configuration-files/${id}/`),

  // Upload a new configuration file
  uploadConfigFile: (configData) => {
    const formData = new FormData();

    // Append all fields to formData
    Object.keys(configData).forEach(key => {
      if (key === 'file' && configData[key] instanceof File) {
        formData.append(key, configData[key]);
      } else if (configData[key] !== null && configData[key] !== undefined) {
        formData.append(key, configData[key]);
      }
    });

    return api.post('/configuration-files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete a configuration file
  deleteConfigFile: (id) => api.delete(`/configuration-files/${id}/`),

  // Filter configuration files by device
  filterByDevice: (deviceId) => api.get(`/configuration-files/filter_by_device/?device_id=${deviceId}`),
};

// Create a named object for default export
const apiService = {
  deviceAPI,
  connectionAPI,
  configFileAPI,
};

export default apiService;
