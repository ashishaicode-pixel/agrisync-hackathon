import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { ArrowLeft, Plus, Calendar, MapPin, Package, Download, Camera, FileText } from 'lucide-react';

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    event_type: '',
    description: '',
    location: '',
    photo: null
  });
  const [addingEvent, setAddingEvent] = useState(false);

  const eventTypes = [
    'Processing',
    'Quality Check',
    'Packaging',
    'Storage',
    'Transport',
    'Certification',
    'Other'
  ];

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      const response = await axios.get(`/api/batches/${id}`);
      setBatch(response.data);
    } catch (error) {
      setError('Failed to fetch batch details');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setAddingEvent(true);

    try {
      const formData = new FormData();
      formData.append('event_type', eventForm.event_type);
      formData.append('description', eventForm.description);
      formData.append('location', eventForm.location);
      if (eventForm.photo) {
        formData.append('photo', eventForm.photo);
      }

      await axios.post(`/api/batches/${id}/events`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setEventForm({
        event_type: '',
        description: '',
        location: '',
        photo: null
      });
      setShowAddEvent(false);
      fetchBatchDetails(); // Refresh data
    } catch (error) {
      setError('Failed to add event');
    } finally {
      setAddingEvent(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${batch.product_name}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <div className="loading" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div className="container">
          <div className="alert alert-error">
            {error || 'Batch not found'}
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary mt-4">
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            style={{ padding: '0.5rem' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{batch.product_name}</h1>
            <p className="text-gray-600">{batch.product_type} • {batch.quantity} {batch.unit}</p>
          </div>
        </div>

        <div className="grid grid-2 mb-8">
          {/* Batch Info */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Batch Information</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Product Name</label>
                <p className="font-semibold">{batch.product_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p>{batch.product_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <p>{batch.quantity} {batch.unit}</p>
              </div>
              {batch.harvest_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Harvest Date</label>
                  <p>{new Date(batch.harvest_date).toLocaleDateString()}</p>
                </div>
              )}
              {batch.location && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p>{batch.location}</p>
                </div>
              )}
              {batch.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p>{batch.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p>{formatDate(batch.created_at)}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="card text-center">
            <h2 className="text-xl font-semibold mb-4">QR Code</h2>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <QRCode
                id="qr-code"
                value={batch.qr_code}
                size={200}
                style={{ border: '1px solid #e2e8f0', padding: '1rem' }}
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Buyers can scan this code to verify your product
            </p>
            <button onClick={downloadQR} className="btn btn-outline">
              <Download size={16} />
              Download QR Code
            </button>
          </div>
        </div>

        {/* Events Timeline */}
        <div className="card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 className="text-xl font-semibold">Supply Chain Events</h2>
            <button
              onClick={() => setShowAddEvent(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Add Event
            </button>
          </div>

          {/* Add Event Form */}
          {showAddEvent && (
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              background: '#f8fafc'
            }}>
              <h3 className="font-semibold mb-4">Add New Event</h3>
              <form onSubmit={handleEventSubmit}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Event Type *</label>
                    <select
                      value={eventForm.event_type}
                      onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})}
                      className="form-input"
                      required
                    >
                      <option value="">Select type</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                      className="form-input"
                      placeholder="Event location"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    className="form-input form-textarea"
                    placeholder="Describe what happened..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Photo (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEventForm({...eventForm, photo: e.target.files[0]})}
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addingEvent}
                  >
                    {addingEvent ? <div className="loading"></div> : 'Add Event'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events List */}
          {batch.events && batch.events.length > 0 ? (
            <div className="grid gap-4">
              {batch.events.map((event, index) => (
                <div
                  key={event.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <h4 className="font-semibold text-green-600">{event.event_type}</h4>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <MapPin size={14} />
                      {event.location}
                    </div>
                  )}
                  
                  {event.photo_url && (
                    <div style={{ marginTop: '1rem' }}>
                      <img
                        src={event.photo_url}
                        alt="Event photo"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '150px',
                          borderRadius: '0.5rem',
                          border: '1px solid #e2e8f0'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <FileText size={64} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No events yet</h3>
              <p className="text-gray-500 mb-4">
                Add events to track your product's journey through the supply chain
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchDetails;