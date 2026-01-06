import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Plus, Package, Eye, Calendar, MapPin } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBatches = useCallback(async () => {
    try {
      const response = await axios.get('/api/batches');
      setBatches(response.data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {user.username}!</h1>
            <p className="text-gray-600 mt-2">
              {t('dashboard.manageBatches')}
            </p>
          </div>
          <Link to="/create-batch" className="btn btn-primary">
            <Plus size={20} />
            {t('dashboard.createNewBatch')}
          </Link>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-3 mb-8">
          <div className="card-glass text-center">
            <Package size={32} style={{ color: 'var(--accent-primary)', margin: '0 auto 0.5rem' }} />
            <h3 className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{batches.length}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard.totalBatches')}</p>
          </div>
          <div className="card-glass text-center">
            <Eye size={32} style={{ color: 'var(--accent-primary)', margin: '0 auto 0.5rem' }} />
            <h3 className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {batches.reduce((sum, b) => sum + (b.scan_count || 0), 0)}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard.qrScans')}</p>
          </div>
          <div className="card-glass text-center">
            <Calendar size={32} style={{ color: 'var(--accent-primary)', margin: '0 auto 0.5rem' }} />
            <h3 className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {batches.filter(b => {
                const harvestDate = new Date(b.harvest_date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return harvestDate >= thirtyDaysAgo;
              }).length}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>{t('dashboard.recentHarvests')}</p>
          </div>
        </div>

        {/* Batches List */}
        <div className="card-glass">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.yourBatches')}</h2>
          
          {batches.length === 0 ? (
            <div className="text-center p-8">
              <Package size={64} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.noBatches')}</h3>
              <p style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                {t('dashboard.createFirst')}
              </p>
              <Link to="/create-batch" className="btn btn-primary">
                <Plus size={16} />
                {t('dashboard.createFirstBatch')}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="card"
                  style={{
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 className="text-lg font-semibold">{batch.product_name}</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>{batch.product_type}</p>
                    </div>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--accent-primary)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {batch.quantity} {batch.unit}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      {formatDate(batch.harvest_date)}
                    </div>
                    {batch.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} />
                        {batch.location}
                      </div>
                    )}
                  </div>
                  
                  {batch.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>{batch.description}</p>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                      {t('dashboard.created')} {formatDate(batch.created_at)}
                    </span>
                    <Link
                      to={`/batch/${batch.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Eye size={16} />
                      {t('dashboard.viewDetails')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
