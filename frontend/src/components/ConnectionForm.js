import React, { useState, useEffect } from 'react';
import { deviceAPI, connectionAPI } from '../services/api';

const ConnectionForm = ({ sourceDeviceId, onSuccess, onCancel }) => {
  const [devices, setDevices] = useState([]);
  const [targetDeviceId, setTargetDeviceId] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchDevicesAndConnections = async () => {
      try {
        const [devicesResponse, connectionsResponse] = await Promise.all([
          deviceAPI.getDevices(),
          connectionAPI.getConnections()
        ]);
        setDevices(devicesResponse.data.results || devicesResponse.data);
        setConnections(connectionsResponse.data.results || connectionsResponse.data);
      } catch (err) {
        setError('Failed to load devices or connections');
      }
    };
    fetchDevicesAndConnections();
  }, []);

  const isReverseConnection = (targetId) => {
    return connections.some(
      c => c.source_device === parseInt(targetId) && c.target_device === parseInt(sourceDeviceId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (isReverseConnection(targetDeviceId)) {
      setError('Cannot create this connection: reverse connection already exists.');
      setLoading(false);
      return;
    }
    try {
      await connectionAPI.createConnection({
        source_device: sourceDeviceId,
        target_device: targetDeviceId,
        connection_type: connectionType,
      });
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      let detail = 'Failed to create connection';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          detail = err.response.data;
        } else if (err.response.data.detail) {
          detail = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          detail = Object.values(err.response.data).join(' ');
        }
      }
      setError(detail);
      setLoading(false);
    }
  };

  return (
    <form className="connection-form" onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <div>
        <label>Target Device:</label>
        <select
          value={targetDeviceId}
          onChange={e => setTargetDeviceId(e.target.value)}
          required
        >
          <option value="">Select device</option>
          {devices
            .filter(device => device.id.toString() !== sourceDeviceId.toString())
            .map(device => (
              <option
                key={device.id}
                value={device.id}
                disabled={isReverseConnection(device.id)}
              >
                {device.hostname}
                {isReverseConnection(device.id) ? ' (reverse connection exists)' : ''}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label>Connection Type:</label>
        <select
          value={connectionType}
          onChange={e => setConnectionType(e.target.value)}
          required
        >
          <option value="">Select type</option>
          <option value="WIFI">WiFi</option>
          <option value="LAN">Ethernet</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading} className="button">
          {loading ? 'Creating...' : 'Create Connection'}
        </button>
        <button type="button" onClick={onCancel} className="button button-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ConnectionForm; 