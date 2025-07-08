import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deviceAPI } from '../services/api';

const DeviceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    hostname: '',
    ip_address: '',
    mac_address: '',
    device_type: 'OTHER',
    notes: '',
    is_online: false,
    photo: null
  });
  
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchDevice = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const response = await deviceAPI.getDevice(id);
        const device = response.data;
        
        setFormData({
          hostname: device.hostname || '',
          ip_address: device.ip_address || '',
          mac_address: device.mac_address || '',
          device_type: device.device_type || 'OTHER',
          notes: device.notes || '',
          is_online: device.is_online || false,
          // Don't set photo here, as we can't edit the file input value
        });
        
        if (device.photo) {
          setPhotoPreview(device.photo);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load device data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchDevice();
  }, [id, isEditMode]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      if (isEditMode) {
        await deviceAPI.updateDevice(id, formData);
      } else {
        await deviceAPI.createDevice(formData);
      }
      
      navigate('/devices');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} device`);
      setSubmitting(false);
      console.error(err);
    }
  };
  
  if (loading) {
    return <div>Loading device data...</div>;
  }
  
  return (
    <div className="device-form-page">
      <div className="page-header">
        <h2>{isEditMode ? 'Edit Device' : 'Add New Device'}</h2>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label htmlFor="hostname">Hostname *</label>
          <input
            type="text"
            id="hostname"
            name="hostname"
            value={formData.hostname}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="ip_address">IP Address</label>
          <input
            type="text"
            id="ip_address"
            name="ip_address"
            value={formData.ip_address}
            onChange={handleInputChange}
            placeholder="e.g., 192.168.1.100"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="mac_address">MAC Address</label>
          <input
            type="text"
            id="mac_address"
            name="mac_address"
            value={formData.mac_address}
            onChange={handleInputChange}
            placeholder="e.g., 00:1A:2B:3C:4D:5E"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="device_type">Device Type</label>
          <select
            id="device_type"
            name="device_type"
            value={formData.device_type}
            onChange={handleInputChange}
          >
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
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="is_online"
              checked={formData.is_online}
              onChange={handleInputChange}
            />
            Device is online
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="photo">Device Photo</label>
          <input
            type="file"
            id="photo"
            name="photo"
            onChange={handleFileChange}
            accept="image/*"
          />
          
          {photoPreview && (
            <div className="photo-preview">
              <img src={photoPreview} alt="Device preview" />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/devices')}
            className="button button-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="button"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (isEditMode ? 'Update Device' : 'Add Device')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeviceForm;