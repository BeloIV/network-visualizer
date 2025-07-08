import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deviceAPI } from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await deviceAPI.getDevices();
        const devices = response.data.results || response.data;
        
        const totalDevices = devices.length;
        const onlineDevices = devices.filter(device => device.is_online).length;
        const offlineDevices = totalDevices - onlineDevices;
        
        setStats({
          totalDevices,
          onlineDevices,
          offlineDevices
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load network statistics');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading network statistics...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-page">
      <h2>Welcome to Network Visualizer</h2>
      <p>
        This application helps you visualize and manage your home network devices and connections.
      </p>
      
      <div className="stats-container">
        <h3>Network Statistics</h3>
        <div className="grid">
          <div className="card">
            <h4>Total Devices</h4>
            <div className="stat-value">{stats.totalDevices}</div>
            <Link to="/devices" className="button">View All Devices</Link>
          </div>
          
          <div className="card">
            <h4>Online Devices</h4>
            <div className="stat-value">{stats.onlineDevices}</div>
            <Link to="/devices?status=online" className="button">View Online Devices</Link>
          </div>
          
          <div className="card">
            <h4>Offline Devices</h4>
            <div className="stat-value">{stats.offlineDevices}</div>
            <Link to="/devices?status=offline" className="button">View Offline Devices</Link>
          </div>
        </div>
      </div>
      
      <div className="actions-container">
        <h3>Quick Actions</h3>
        <div className="button-group">
          <Link to="/devices/new" className="button">Add New Device</Link>
          <Link to="/network" className="button">View Network Map</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;