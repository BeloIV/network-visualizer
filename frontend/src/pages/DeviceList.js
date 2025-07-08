import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { deviceAPI } from '../services/api';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    status: ''
  });
  const [discovered, setDiscovered] = useState([]);
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState(null);
  const [showDiscovered, setShowDiscovered] = useState(false);
  const [subnet, setSubnet] = useState('192.168.1.0/24');
  const [addingIdx, setAddingIdx] = useState(null);
  
  const location = useLocation();
  
  useEffect(() => {
    // Parse query parameters from URL
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    const typeParam = queryParams.get('type');
    
    if (statusParam) {
      setFilter(prev => ({ ...prev, status: statusParam }));
    }
    
    if (typeParam) {
      setFilter(prev => ({ ...prev, type: typeParam }));
    }
  }, [location.search]);
  
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        let response;
        
        if (filter.type) {
          response = await deviceAPI.filterByType(filter.type);
        } else if (filter.status === 'online') {
          response = await deviceAPI.filterByStatus(true);
        } else if (filter.status === 'offline') {
          response = await deviceAPI.filterByStatus(false);
        } else {
          response = await deviceAPI.getDevices();
        }
        
        const fetchedDevices = response.data.results || response.data;
        setDevices(fetchedDevices);
        setLoading(false);
      } catch (err) {
        setError('Failed to load devices');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchDevices();
  }, [filter]);

  // Poll device status every 30 seconds
  useEffect(() => {
    if (!devices.length) return;
    const interval = setInterval(() => {
      devices.forEach(async (device) => {
        try {
          const res = await deviceAPI.checkDeviceStatus(device.id);
          setDevices(prev => prev.map(d => d.id === device.id ? { ...d, is_online: res.data.status.includes('online') } : d));
        } catch (e) {
          // Optionally handle error
        }
      });
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [devices]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAutodiscover = async () => {
    setDiscovering(true);
    setDiscoverError(null);
    setDiscovered([]);
    try {
      const response = await deviceAPI.autodiscover(subnet);
      setDiscovered(response.data);
      setShowDiscovered(true);
    } catch (err) {
      setDiscoverError('Autodiscover failed');
    } finally {
      setDiscovering(false);
    }
  };
  
  const handleAddDiscovered = async (dev, idx) => {
    setAddingIdx(idx);
    try {
      await deviceAPI.createDevice({
        hostname: dev.hostname || 'Unknown',
        ip_address: dev.ip_address,
        device_type: 'OTHER',
        is_online: true
      });
      // Refresh device list
      setTimeout(() => window.location.reload(), 500); // quick reload for now
    } catch (err) {
      alert('Failed to add device');
    } finally {
      setAddingIdx(null);
    }
  };
  
  if (loading) {
    return <div>Loading devices...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="device-list-page">
      <div className="page-header">
        <h2>Network Devices</h2>
        <Link to="/devices/new" className="button">Add New Device</Link>
      </div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={subnet}
          onChange={e => setSubnet(e.target.value)}
          placeholder="Subnet (e.g. 192.168.1.0/24)"
          style={{ marginRight: 8 }}
        />
        <button onClick={handleAutodiscover} className="button" disabled={discovering}>
          {discovering ? 'Scanning...' : 'Autodiscover Devices'}
        </button>
      </div>
      {discoverError && <div className="error">{discoverError}</div>}
      {showDiscovered && (
        <div className="discovered-list" style={{ marginBottom: 24 }}>
          <h3>Discovered Devices</h3>
          {discovered.length === 0 ? (
            <div>No devices found on subnet.</div>
          ) : (
            <ul>
              {discovered.map((dev, idx) => (
                <li key={dev.ip_address + idx}>
                  <strong>{dev.hostname || 'Unknown'}</strong> ({dev.ip_address})
                  <button
                    style={{ marginLeft: 8 }}
                    className="button"
                    onClick={() => handleAddDiscovered(dev, idx)}
                    disabled={addingIdx === idx}
                  >
                    {addingIdx === idx ? 'Adding...' : '+'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      <div className="filters">
        <div className="form-group">
          <label htmlFor="type">Filter by Type:</label>
          <select 
            id="type" 
            name="type" 
            value={filter.type} 
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="COMPUTER">Computer</option>
            <option value="SERVER">Server</option>
            <option value="ROUTER">Router</option>
            <option value="SWITCH">Switch</option>
            <option value="PRINTER">Printer</option>
            <option value="MOBILE">Mobile Device</option>
            <option value="IOT">IoT Device</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Filter by Status:</label>
          <select 
            id="status" 
            name="status" 
            value={filter.status} 
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
      
      {devices.length === 0 ? (
        <div className="no-devices">
          <p>No devices found. Add a new device to get started.</p>
        </div>
      ) : (
        <div className="grid">
          {devices.map(device => (
            <div key={device.id} className="card">
              <h3 className="card-title">{device.hostname}</h3>
              <div className="device-info">
                <p>
                  <strong>IP:</strong> {device.ip_address || 'N/A'}
                </p>
                <p>
                  <strong>Type:</strong> {device.device_type}
                </p>
                <p>
                  <strong>Status:</strong> 
                  <span className={device.is_online ? 'status-online' : 'status-offline'}>
                    {device.is_online ? 'Online' : 'Offline'}
                  </span>
                </p>
              </div>
              <div className="card-actions">
                <Link to={`/devices/${device.id}`} className="button">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceList;