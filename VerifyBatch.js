import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Shield, CheckCircle, Calendar, MapPin, User, Building, Phone, Award, Camera } from 'lucide-react';

const VerifyBatch = () => {
  const { batchId } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyBatch();
  }, [batchId]);

  const verifyBatch = async () => {
    try {
      const response = await axios.get(`/api/verify/${batchId}`);
      setVerification(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTrustColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#f59e0b';
    return '#dc2626';
  };

  const getTrustLabel = (score) => {
    if (score >= 80) return 'High Trust';
    if (score >= 60) return 'Medium Trust';
    return 'Low Trust';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        gap: '1rem'
      }}>
        <div className="loading" style={{ width: '40px', height: '40px' }}></div>
        <p className="text-gray-600">Verifying product authenticity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="card text-center">
            <Shield size={64} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
            <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              This product could not be verified. Please check the QR code or contact the producer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', background: '#f8fafc', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Trust Score Header */}
        <div className="card mb-6 text-center">
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: getTrustColor(verification.trust_score),
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: '0 auto 1rem'
          }}>
            {verification.trust_score}
          </div>
          <h1 className="text-2xl font-bold mb-2">Product Verified</h1>
          <p style={{ color: getTrustColor(verification.trust_score), fontWeight: '600' }}>
            {getTrustLabel(verification.trust_score)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Verified on {formatDate(verification.verified_at)}
          </p>
        </div>

        <div className="grid grid-2 mb-6">
          {/* Product Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={24} style={{ color: '#059669' }} />
              Product Details
            </h2>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Product Name</label>
                <p className="font-semibold text-lg">{verification.batch.product_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p>{verification.batch.product_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity</label>
                <p>{verification.batch.quantity} {verification.batch.unit}</p>
              </div>
              {verification.batch.harvest_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Harvest Date</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} style={{ color: '#6b7280' }} />
                    <p>{new Date(verification.batch.harvest_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {verification.batch.location && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Origin</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} style={{ color: '#6b7280' }} />
                    <p>{verification.batch.location}</p>
                  </div>
                </div>
              )}
              {verification.batch.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-sm">{verification.batch.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Producer Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User size={24} style={{ color: '#059669' }} />
              Producer Details
            </h2>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Producer</label>
                <p className="font-semibold">{verification.producer.name}</p>
              </div>
              {verification.producer.organization && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Organization</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building size={16} style={{ color: '#6b7280' }} />
                    <p>{verification.producer.organization}</p>
                  </div>
                </div>
              )}
              {verification.producer.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} style={{ color: '#6b7280' }} />
                    <p>{verification.producer.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certifications */}
        {verification.certifications && verification.certifications.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award size={24} style={{ color: '#059669' }} />
              Certifications
            </h2>
            <div className="grid gap-3">
              {verification.certifications.map((cert, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    background: '#f8fafc'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div>
                      <h4 className="font-semibold">{cert.cert_type}</h4>
                      <p className="text-sm text-gray-600">Issued by: {cert.issuer}</p>
                      {cert.cert_number && (
                        <p className="text-sm text-gray-500">Certificate #: {cert.cert_number}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {cert.issue_date && <p>Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>}
                      {cert.expiry_date && <p>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supply Chain Events */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Supply Chain Journey</h2>
          {verification.events && verification.events.length > 0 ? (
            <div className="grid gap-4">
              {verification.events.map((event, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    position: 'relative'
                  }}
                >
                  {index < verification.events.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '3rem',
                      bottom: '-1rem',
                      width: '2px',
                      background: '#e2e8f0'
                    }} />
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#059669',
                        position: 'relative',
                        zIndex: 1
                      }} />
                      <div>
                        <h4 className="font-semibold text-green-600">{event.event_type}</h4>
                        <p className="text-gray-600">{event.description}</p>
                      </div>
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
                      marginLeft: '1.75rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <MapPin size={14} />
                      {event.location}
                    </div>
                  )}
                  
                  {event.photo_url && (
                    <div style={{ marginLeft: '1.75rem', marginTop: '0.75rem' }}>
                      <img
                        src={event.photo_url}
                        alt="Event documentation"
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
            <div className="text-center p-6">
              <Calendar size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
              <p className="text-gray-500">No supply chain events recorded</p>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold mb-4">Trust Indicators</h3>
          <div className="grid grid-3 gap-4">
            <div className="text-center">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: verification.events.length > 0 ? '#d1fae5' : '#fee2e2',
                color: verification.events.length > 0 ? '#065f46' : '#991b1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem'
              }}>
                <CheckCircle size={24} />
              </div>
              <p className="text-sm font-medium">Supply Chain Events</p>
              <p className="text-xs text-gray-500">{verification.events.length} recorded</p>
            </div>
            
            <div className="text-center">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: verification.certifications.length > 0 ? '#d1fae5' : '#fee2e2',
                color: verification.certifications.length > 0 ? '#065f46' : '#991b1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem'
              }}>
                <Award size={24} />
              </div>
              <p className="text-sm font-medium">Certifications</p>
              <p className="text-xs text-gray-500">{verification.certifications.length} active</p>
            </div>
            
            <div className="text-center">
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: verification.events.filter(e => e.photo_url).length > 0 ? '#d1fae5' : '#fee2e2',
                color: verification.events.filter(e => e.photo_url).length > 0 ? '#065f46' : '#991b1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem'
              }}>
                <Camera size={24} />
              </div>
              <p className="text-sm font-medium">Photo Evidence</p>
              <p className="text-xs text-gray-500">
                {verification.events.filter(e => e.photo_url).length} photos
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Powered by AgriSync • Verified at {formatDate(verification.verified_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyBatch;