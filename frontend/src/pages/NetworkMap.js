import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { deviceAPI, connectionAPI } from '../services/api';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState
} from 'react-flow-renderer';
import ConnectionForm from '../components/ConnectionForm';
import './NetworkMap.css';

const NetworkMap = () => {
  const [devices, setDevices] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert devices and connections to ReactFlow nodes and edges
  const convertToReactFlowElements = useCallback((devices, connections) => {
    // Create nodes from devices
    const nodes = devices.map((device, index) => {
      // Position nodes in a circle layout
      const angle = (index / devices.length) * 2 * Math.PI;
      const radius = 250;
      const x = radius * Math.cos(angle) + 400;
      const y = radius * Math.sin(angle) + 300;

      return {
        id: device.id.toString(),
        type: 'default',
        data: { 
          label: (
            <div>
              <div>{device.hostname}</div>
              <div className={device.is_online ? 'status-online' : 'status-offline'}>
                {device.is_online ? 'Online' : 'Offline'}
              </div>
            </div>
          ),
          device
        },
        position: { x, y },
        style: {
          background: device.is_online ? '#d0f0c0' : '#f0d0c0',
          border: '1px solid #555',
          borderRadius: '5px',
          padding: '10px',
          width: 150
        }
      };
    });

    // Create edges from connections
    const edges = connections.map(connection => {
      return {
        id: `e${connection.id}`,
        source: connection.source_device.toString(),
        target: connection.target_device.toString(),
        label: connection.connection_type,
        type: 'default',
        animated: true,
        style: { stroke: '#555' }
      };
    });

    return { nodes, edges };
  }, []);

  const fetchNetworkData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all devices
      const devicesResponse = await deviceAPI.getDevices();
      const fetchedDevices = devicesResponse.data.results || devicesResponse.data;
      setDevices(fetchedDevices);

      // Fetch all connections
      const connectionsResponse = await connectionAPI.getConnections();
      const fetchedConnections = connectionsResponse.data.results || connectionsResponse.data;
      setConnections(fetchedConnections);

      // Convert to ReactFlow elements
      const { nodes, edges } = convertToReactFlowElements(fetchedDevices, fetchedConnections);
      setNodes(nodes);
      setEdges(edges);

      setLoading(false);
    } catch (err) {
      setError('Failed to load network data');
      setLoading(false);
      console.error(err);
    }
  }, [convertToReactFlowElements]);

  useEffect(() => {
    fetchNetworkData();
  }, [fetchNetworkData]);

  // Handle node click to select a device for connection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowConnectionForm(true);
  }, []);

  // Handle connection creation success
  const handleConnectionSuccess = useCallback(() => {
    setShowConnectionForm(false);
    setSelectedNode(null);
    fetchNetworkData();
  }, [fetchNetworkData]);

  // Handle connection form cancel
  const handleConnectionCancel = useCallback(() => {
    setShowConnectionForm(false);
    setSelectedNode(null);
  }, []);

  if (loading) {
    return <div>Loading network map...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="network-map-page">
      <div className="page-header">
        <h2>Network Map</h2>
        <div className="button-group">
          <Link to="/devices/new" className="button">Add Device</Link>
          <button onClick={fetchNetworkData} className="button">Refresh Map</button>
        </div>
      </div>

      <div className="network-map-container">
        <div className="network-map" style={{ height: 600, width: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {showConnectionForm && selectedNode && (
          <div className="connection-form-overlay">
            <div className="connection-form-modal">
              <h3>Create Connection from {selectedNode.data.device.hostname}</h3>
              <ConnectionForm 
                sourceDeviceId={selectedNode.id}
                onSuccess={handleConnectionSuccess}
                onCancel={handleConnectionCancel}
              />
            </div>
          </div>
        )}
      </div>

      <div className="map-legend">
        <h3>Legend</h3>
        <div className="legend-item">
          <span className="status-online">●</span> Online
        </div>
        <div className="legend-item">
          <span className="status-offline">○</span> Offline
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;
