import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { deviceAPI, connectionAPI, configFileAPI } from '../services/api';
import ConnectionForm from '../components/ConnectionForm';

const DeviceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [device, setDevice] = useState(null);
  const [connections, setConnections] = useState([]);
  const [configFiles, setConfigFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChecking, setStatusChecking] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);

  const fetchConnections = async () => {
    try {
      const connectionsResponse = await connectionAPI.filterByDevice(id);
      setConnections(connectionsResponse.data.results || connectionsResponse.data);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    }
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);

        // Fetch device details
        const deviceResponse = await deviceAPI.getDevice(id);
        setDevice(deviceResponse.data);

        // Fetch device connections
        await fetchConnections();

        // Fetch device configuration files
        const configFilesResponse = await configFileAPI.filterByDevice(id);
        setConfigFiles(configFilesResponse.data.results || configFilesResponse.data);

        setLoading(false);
      } catch (err) {
        setError('Failed to load device details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchDeviceData();
  }, [id]);

  const handleCheckStatus = async () => {
    try {
      setStatusChecking(true);
      await deviceAPI.checkDeviceStatus(id);

      // Refresh device data to get updated status
      const deviceResponse = await deviceAPI.getDevice(id);
      setDevice(deviceResponse.data);
      setStatusChecking(false);
    } catch (err) {
      setError('Failed to check device status');
      setStatusChecking(false);
      console.error(err);
    }
  };

  const handleDeleteDevice = async () => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deviceAPI.deleteDevice(id);
        navigate('/devices');
      } catch (err) {
        setError('Failed to delete device');
        console.error(err);
      }
    }
  };

  const handleDeleteConfigFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this configuration file?')) {
      try {
        await configFileAPI.deleteConfigFile(fileId);

        // Update the list of config files
        setConfigFiles(configFiles.filter(file => file.id !== fileId));
      } catch (err) {
        setError('Failed to delete configuration file');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <div>Loading device details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!device) {
    return <div>Device not found</div>;
  }

  return (
    <div className="device-detail-page">
      <div className="page-header">
        <h2>{device.hostname}</h2>
        <div className="button-group">
          <Link to={`/devices/edit/${id}`} className="button">Edit Device</Link>
          <button onClick={handleDeleteDevice} className="button button-danger">Delete Device</button>
        </div>
      </div>

      <div className="device-info-container">
        <div className="device-info card">
          <h3>Device Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Hostname:</strong> {device.hostname}
            </div>
            <div className="info-item">
              <strong>IP Address:</strong> {device.ip_address || 'N/A'}
            </div>
            <div className="info-item">
              <strong>MAC Address:</strong> {device.mac_address || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Type:</strong> {device.device_type}
            </div>
            <div className="info-item">
              <strong>Status:</strong> 
              <span className={device.is_online ? 'status-online' : 'status-offline'}>
                {device.is_online ? 'Online' : 'Offline'}
              </span>
              <button 
                onClick={handleCheckStatus} 
                disabled={statusChecking}
                className="button button-small"
              >
                {statusChecking ? 'Checking...' : 'Check Now'}
              </button>
            </div>
          </div>

          {device.notes && (
            <div className="device-notes">
              <h4>Notes</h4>
              <p>{device.notes}</p>
            </div>
          )}

          {device.photo && (
            <div className="device-photo">
              <h4>Photo</h4>
              <img src={device.photo} alt={device.hostname} />
            </div>
          )}
        </div>

        <div className="device-connections card">
          <h3>Connections</h3>
          {connections.length === 0 ? (
            <p>No connections found for this device.</p>
          ) : (
            <ul className="connection-list">
              {connections.map(connection => (
                <li key={connection.id} className="connection-item">
                  {connection.source_device === parseInt(id) ? (
                    <>
                      <strong>To:</strong> {connection.target_device_hostname}
                    </>
                  ) : (
                    <>
                      <strong>From:</strong> {connection.source_device_hostname}
                    </>
                  )}
                  <span className="connection-type">({connection.connection_type})</span>
                </li>
              ))}
            </ul>
          )}
          <div className="card-actions">
            <button 
              onClick={() => setShowConnectionForm(!showConnectionForm)} 
              className="button"
            >
              {showConnectionForm ? 'Cancel' : 'Add Connection'}
            </button>
          </div>

          {showConnectionForm && (
            <div className="connection-form-container">
              <ConnectionForm 
                sourceDeviceId={id}
                onSuccess={() => {
                  fetchConnections();
                  setShowConnectionForm(false);
                }}
                onCancel={() => setShowConnectionForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {(device.device_type === 'ROUTER' || device.device_type === 'SWITCH') && (
        <div className="config-files card">
          <h3>Configuration Files</h3>
          {configFiles.length === 0 ? (
            <p>No configuration files found for this device.</p>
          ) : (
            <ul className="config-file-list">
              {configFiles.map(file => (
                <li key={file.id} className="config-file-item">
                  <div className="file-info">
                    <strong>{file.description || 'Unnamed File'}</strong>
                    <span className="file-date">
                      Uploaded: {new Date(file.uploaded_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="file-actions">
                    <a href={file.file} className="button button-small" download>Download</a>
                    <button 
                      onClick={() => handleDeleteConfigFile(file.id)} 
                      className="button button-small button-danger"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="upload-section">
            <h4>Upload New Configuration File</h4>
            {/* File upload form would go here */}
            <p>File upload functionality to be implemented.</p>
          </div>
        </div>
      )}

      <div className="page-actions">
        <Link to="/devices" className="button button-secondary">Back to Devices</Link>
      </div>
    </div>
  );
};

export default DeviceDetail;
