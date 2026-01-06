import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle, 
  Search, Eye, Download
} from 'lucide-react';

const Orders = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // User not logged in, show empty state
        setOrders([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const apiOrders = await response.json();
        
        // Transform API orders to match our display format
        const transformedOrders = apiOrders.map(order => ({
          id: order.id,
          order_number: order.order_number,
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email,
          products: order.products || [],
          total_amount: order.total_amount,
          status: order.status,
          order_date: order.order_date,
          delivery_date: order.delivery_date,
          tracking_id: order.tracking_id
        }));
        
        setOrders(transformedOrders);
      } else {
        // API error or no orders, show empty state
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Network error, show empty state
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusConfig = {
    pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock, label: t('orders.pending') },
    processing: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: Package, label: t('orders.processing') },
    shipped: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: Truck, label: t('orders.shipped') },
    delivered: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle, label: t('orders.delivered') },
    cancelled: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertCircle, label: t('orders.cancelled') }
  };

  const tabs = [
    { id: 'all', label: t('orders.allOrders'), count: orders.length },
    { id: 'pending', label: t('orders.pending'), count: orders.filter(o => o.status === 'pending').length },
    { id: 'processing', label: t('orders.processing'), count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: t('orders.shipped'), count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: t('orders.delivered'), count: orders.filter(o => o.status === 'delivered').length }
  ];

  const filteredOrders = orders
    .filter(o => activeTab === 'all' || o.status === activeTab)
    .filter(o => 
      (o.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.buyer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const pendingRevenue = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).reduce((sum, o) => sum + (o.total_amount || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-3xl font-bold mb-2">{t('orders.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('orders.subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          <div className="card-glass">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('orders.totalOrders')}</div>
            <div className="text-2xl font-bold">{orders.length}</div>
          </div>
          <div className="card-glass">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('orders.completedRevenue')}</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div className="card-glass">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('orders.pendingRevenue')}</div>
            <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>₹{pendingRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div className="card-glass">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('orders.fulfillmentRate')}</div>
            <div className="text-2xl font-bold">{orders.length > 0 ? ((orders.filter(o => o.status === 'delivered').length / orders.length) * 100).toFixed(1) : 0}%</div>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="card-glass" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {tab.label}
                  <span style={{
                    background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--glass-bg)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    marginLeft: '0.5rem'
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', minWidth: '250px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder={t('common.search') + '...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map(order => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            
            return (
              <div key={order.id} className="card-glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <span style={{
                        background: status.bg,
                        color: status.color,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>{order.buyer_name}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{order.buyer_email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                      ₹{(order.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {t('orders.ordered')}: {new Date(order.order_date).toLocaleDateString('hi-IN')}
                    </div>
                  </div>
                </div>

                {/* Products */}
                {order.products && order.products.length > 0 && (
                  <div style={{ background: 'var(--glass-bg)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>{t('orders.products')}</div>
                    {order.products.map((product, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.5rem 0',
                        borderBottom: idx < order.products.length - 1 ? '1px solid var(--border-color)' : 'none'
                      }}>
                        <span>{product.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {product.quantity} {product.unit} × ₹{product.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {order.tracking_id && <span>{t('orders.tracking')}: <strong>{order.tracking_id}</strong></span>}
                    {order.delivery_date && (
                      <span style={{ marginLeft: order.tracking_id ? '1rem' : 0 }}>
                        {t('orders.estDelivery')}: <strong>{new Date(order.delivery_date).toLocaleDateString('hi-IN')}</strong>
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      <Eye size={16} />
                      {t('orders.viewDetails')}
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      <Download size={16} />
                      {t('orders.invoice')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="card-glass text-center" style={{ padding: '3rem' }}>
              <Package size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
              <h3 className="text-lg font-semibold mb-2">
                {orders.length === 0 ? 'No orders yet' : 'No orders found'}
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {orders.length === 0 
                  ? 'Orders from buyers will appear here once you start receiving them.'
                  : 'Try adjusting your search or filters to find specific orders.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;