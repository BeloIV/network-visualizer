import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import pages
import Home from './pages/Home';
import DeviceList from './pages/DeviceList';
import DeviceDetail from './pages/DeviceDetail';
import DeviceForm from './pages/DeviceForm';
import NetworkMap from './pages/NetworkMap';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Network Visualizer</h1>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/devices">Devices</Link></li>
              <li><Link to="/network">Network Map</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/devices" element={<DeviceList />} />
            <Route path="/devices/:id" element={<DeviceDetail />} />
            <Route path="/devices/new" element={<DeviceForm />} />
            <Route path="/devices/edit/:id" element={<DeviceForm />} />
            <Route path="/network" element={<NetworkMap />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2023 Network Visualizer</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;