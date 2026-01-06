import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, MapPin, Star, ShoppingCart, Heart, TrendingUp, 
  Package, Shield, Phone, Mail, Calendar, Eye, Download,
  Filter, Building2, Verified
} from 'lucide-react';

const Marketplace = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [minQuantity, setMinQuantity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
    setMinQuantity('');
  };

  const categories = ['all', 'Fruits', 'Vegetables', 'Grains', 'Herbs', 'Dairy', 'Meat', 'Processed Food'];
  
  const categoryTranslations = {
    'all': t('marketplace.allCategories'),
    'Fruits': t('batch.fruits'),
    'Vegetables': t('batch.vegetables'),
    'Grains': t('batch.grains'),
    'Herbs': t('batch.herbs'),
    'Dairy': t('batch.dairy'),
    'Meat': t('batch.meat'),
    'Processed Food': t('batch.processedFood')
  };

  const fetchMarketplaceProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketplace');
      if (response.ok) {
        const batches = await response.json();
        console.log('Fetched batches:', batches); // Debug log
        
        if (batches.length === 0) {
          console.log('No batches found in database');
          setProducts([]);
          return;
        }
        
        // Transform batches to B2B marketplace products format
        const transformedProducts = batches.map(batch => {
          // Calculate realistic B2B pricing based on product type and quantity
          const basePrices = {
            'Vegetables': 35,
            'Fruits': 60,
            'Grains': 25,
            'Herbs': 150,
            'Dairy': 80,
            'Meat': 200,
            'Processed Food': 120
          };
          
          const basePrice = basePrices[batch.product_type] || 50;
          const quantityDiscount = batch.quantity > 100 ? 0.9 : batch.quantity > 50 ? 0.95 : 1;
          const finalPrice = Math.round(basePrice * quantityDiscount);
          
          return {
            id: batch.id,
            name: batch.product_name,
            producer: batch.producer_name || batch.organization || 'Producer',
            organization: batch.organization || batch.producer_name || 'Individual Producer',
            category: batch.product_type,
            price: finalPrice,
            unit: batch.unit,
            quantity: batch.quantity,
            location: batch.location || 'India',
            harvestDate: batch.harvest_date,
            description: batch.description || 'Fresh quality product',
            qrCode: batch.qr_code,
            createdAt: batch.created_at,
            // B2B specific fields - realistic data
            minOrderQuantity: Math.max(1, Math.floor(batch.quantity * 0.1)),
            maxOrderQuantity: batch.quantity,
            leadTime: batch.quantity > 100 ? '3-7 days' : '2-5 days',
            certifications: ['FSSAI Certified', 'Quality Assured'],
            rating: '4.5', // Fixed realistic rating
            reviews: Math.max(5, Math.floor(batch.quantity / 10)), // Reviews based on quantity
            trustScore: 88, // Fixed realistic trust score
            image: getProductEmoji(batch.product_name, batch.product_type),
            featured: batch.quantity > 50,
            verified: true,
            bulkDiscount: batch.quantity > 100 ? '10% off on orders >50kg' : batch.quantity > 25 ? '5% off on orders >25kg' : null
          };
        });
        
        console.log('Transformed products:', transformedProducts); // Debug log
        setProducts(transformedProducts);
      } else {
        console.error('API response not ok:', response.status);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketplaceProducts();
  }, [fetchMarketplaceProducts]);

  const getProductEmoji = (productName, productType) => {
    // First check specific product names
    const productName_lower = productName.toLowerCase();
    
    if (productName_lower.includes('tomato')) return '🍅';
    if (productName_lower.includes('apple')) return '🍎';
    if (productName_lower.includes('mango')) return '🥭';
    if (productName_lower.includes('banana')) return '🍌';
    if (productName_lower.includes('orange')) return '🍊';
    if (productName_lower.includes('grape')) return '🍇';
    if (productName_lower.includes('strawberry')) return '🍓';
    if (productName_lower.includes('pineapple')) return '🍍';
    if (productName_lower.includes('watermelon')) return '🍉';
    if (productName_lower.includes('peach')) return '🍑';
    
    if (productName_lower.includes('potato')) return '🥔';
    if (productName_lower.includes('carrot')) return '🥕';
    if (productName_lower.includes('onion')) return '🧅';
    if (productName_lower.includes('garlic')) return '🧄';
    if (productName_lower.includes('pepper') || productName_lower.includes('capsicum')) return '🫑';
    if (productName_lower.includes('broccoli')) return '🥦';
    if (productName_lower.includes('lettuce') || productName_lower.includes('cabbage')) return '🥬';
    if (productName_lower.includes('corn')) return '🌽';
    if (productName_lower.includes('cucumber')) return '🥒';
    if (productName_lower.includes('eggplant') || productName_lower.includes('brinjal')) return '🍆';
    
    if (productName_lower.includes('rice')) return '🍚';
    if (productName_lower.includes('wheat')) return '🌾';
    if (productName_lower.includes('oats')) return '🌾';
    if (productName_lower.includes('barley')) return '🌾';
    
    if (productName_lower.includes('milk')) return '🥛';
    if (productName_lower.includes('cheese')) return '🧀';
    if (productName_lower.includes('butter') || productName_lower.includes('ghee')) return '🧈';
    if (productName_lower.includes('egg')) return '🥚';
    if (productName_lower.includes('yogurt') || productName_lower.includes('curd')) return '🥛';
    
    if (productName_lower.includes('chicken')) return '🐔';
    if (productName_lower.includes('beef')) return '🥩';
    if (productName_lower.includes('pork')) return '🥓';
    if (productName_lower.includes('fish')) return '🐟';
    if (productName_lower.includes('shrimp')) return '🦐';
    
    if (productName_lower.includes('basil') || productName_lower.includes('mint') || 
        productName_lower.includes('cilantro') || productName_lower.includes('parsley') ||
        productName_lower.includes('herb')) return '🌿';
    
    // Fallback to category-based emojis
    const emojiMap = {
      'Fruits': '🍎',
      'Vegetables': '🥕',
      'Grains': '🌾',
      'Herbs': '🌿',
      'Dairy': '🥛',
      'Meat': '🥩',
      'Processed Food': '🍞'
    };
    return emojiMap[productType] || '🌱';
  };

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 p.producer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 p.organization.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => !minQuantity || p.quantity >= parseInt(minQuantity))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'quantity-high') return b.quantity - a.quantity;
      if (sortBy === 'quantity-low') return a.quantity - b.quantity;
      if (sortBy === 'rating') return parseFloat(b.rating) - parseFloat(a.rating);
      if (sortBy === 'trust') return b.trustScore - a.trustScore;
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const featuredProducts = products.filter(p => p.featured);

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
          <h1 className="text-3xl font-bold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={32} style={{ color: 'var(--accent-primary)' }} />
            {t('marketplace.title')}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Connect directly with verified producers. Bulk orders, competitive pricing, quality assured.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card-glass" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search products, producers, or organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '3rem' }}
              />
            </div>
            
            <button 
              className="btn btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: showFilters ? 'var(--accent-primary)' : undefined,
                color: showFilters ? 'white' : undefined
              }}
            >
              <Filter size={16} />
              Filters {showFilters ? '▲' : '▼'}
            </button>
          </div>

          {showFilters && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input"
                style={{ width: 'auto', minWidth: '150px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryTranslations[cat] || cat}</option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Min quantity"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="form-input"
                style={{ width: '150px' }}
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
                style={{ width: 'auto', minWidth: '150px' }}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="quantity-high">Quantity: High to Low</option>
                <option value="quantity-low">Quantity: Low to High</option>
                <option value="rating">Highest Rated</option>
                <option value="trust">Trust Score</option>
              </select>

              <button 
                className="btn btn-outline"
                onClick={clearFilters}
                style={{ fontSize: '0.875rem' }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          <div className="card-glass">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Products</div>
            <div className="text-2xl font-bold">{products.length}</div>
          </div>
          <div className="card-glass">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Verified Producers</div>
            <div className="text-2xl font-bold">{new Set(products.map(p => p.producer)).size}</div>
          </div>
          <div className="card-glass">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Quantity</div>
            <div className="text-2xl font-bold">{products.reduce((sum, p) => sum + parseFloat(p.quantity), 0).toFixed(0)} kg</div>
          </div>
          <div className="card-glass">
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Avg Trust Score</div>
            <div className="text-2xl font-bold">{products.length > 0 ? (products.reduce((sum, p) => sum + p.trustScore, 0) / products.length).toFixed(0) : 0}%</div>
          </div>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={24} style={{ color: 'var(--accent-primary)' }} />
              Bulk Available - Featured
            </h2>
            <div className="grid grid-3">
              {featuredProducts.slice(0, 6).map(product => (
                <B2BProductCard key={product.id} product={product} featured t={t} />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div>
          <h2 className="text-xl font-semibold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} />
            All Products ({filteredProducts.length})
          </h2>
          <div className="grid grid-3">
            {filteredProducts.map(product => (
              <B2BProductCard key={product.id} product={product} t={t} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="card-glass text-center" style={{ padding: '3rem' }}>
              <Search size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const B2BProductCard = ({ product, featured, t }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const handleRequestQuote = () => {
    setShowQuoteModal(true);
  };

  const handleCall = () => {
    // In a real app, this would initiate a call or show phone number
    alert(`Calling ${product.organization}...\nPhone: +91-98765-43210`);
  };

  const handleEmail = () => {
    // In a real app, this would open email client or show contact form
    const subject = `Inquiry about ${product.name}`;
    const body = `Hi ${product.organization},\n\nI'm interested in your ${product.name} (${product.quantity} ${product.unit} available).\n\nPlease provide more details about:\n- Pricing for bulk orders\n- Quality specifications\n- Delivery terms\n\nThank you!`;
    
    const mailtoLink = `mailto:contact@${product.organization.toLowerCase().replace(/\s+/g, '')}.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  const handleDownloadQR = () => {
    // In a real app, this would download the QR code or open verification page
    if (product.qrCode) {
      window.open(product.qrCode, '_blank');
    } else {
      alert('QR code will be available once the product is verified.');
    }
  };

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className={featured ? 'card-glass' : 'card'} style={{ position: 'relative' }}>
      {featured && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          BULK
        </div>
      )}
      
      <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>
        {product.image}
      </div>
      
      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
      
      {/* Producer Info */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Building2 size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{product.organization}</span>
          {product.verified && <Verified size={14} style={{ color: 'var(--accent-primary)' }} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.location}</span>
        </div>
      </div>
      
      {/* Pricing */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <span className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
            ₹{product.price}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>/{product.unit}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Available</div>
          <div className="font-semibold">{product.quantity} {product.unit}</div>
        </div>
      </div>

      {/* B2B Details */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Min Order:</span>
          <span>{product.minOrderQuantity} {product.unit}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Lead Time:</span>
          <span>{product.leadTime}</span>
        </div>
        {product.bulkDiscount && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: 'var(--accent-primary)', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '0.5rem', 
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '0.25rem'
          }}>
            {product.bulkDiscount}
          </div>
        )}
      </div>

      {/* Trust & Rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{product.rating}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>({product.reviews})</span>
        </div>
        <div style={{
          background: product.trustScore >= 90 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          color: product.trustScore >= 90 ? 'var(--accent-primary)' : '#f59e0b',
          padding: '0.125rem 0.5rem',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          Trust: {product.trustScore}%
        </div>
      </div>

      {/* Certifications */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
        {product.certifications.map(cert => (
          <span key={cert} style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            padding: '0.125rem 0.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Shield size={10} />
            {cert}
          </span>
        ))}
      </div>

      {/* Harvest Date */}
      {product.harvestDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <Calendar size={14} />
          Harvested: {new Date(product.harvestDate).toLocaleDateString()}
        </div>
      )}
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          className="btn btn-primary" 
          style={{ flex: 1 }}
          onClick={handleRequestQuote}
        >
          <ShoppingCart size={16} />
          Request Quote
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleViewDetails}
          style={{ padding: '0.75rem' }}
          title="View Details"
        >
          <Eye size={16} />
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => setIsWishlisted(!isWishlisted)}
          style={{ padding: '0.75rem' }}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={16} style={{ fill: isWishlisted ? '#ef4444' : 'none', color: isWishlisted ? '#ef4444' : 'inherit' }} />
        </button>
      </div>

      {/* Contact Info */}
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            style={{ flex: 1, fontSize: '0.875rem' }}
            onClick={handleCall}
            title="Call Producer"
          >
            <Phone size={14} />
            Call
          </button>
          <button 
            className="btn btn-outline" 
            style={{ flex: 1, fontSize: '0.875rem' }}
            onClick={handleEmail}
            title="Send Email"
          >
            <Mail size={14} />
            Email
          </button>
          <button 
            className="btn btn-outline" 
            style={{ flex: 1, fontSize: '0.875rem' }}
            onClick={handleDownloadQR}
            title="View QR Code"
          >
            <Download size={14} />
            QR
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div style={{ 
          marginTop: '1rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--border-color)',
          background: 'var(--glass-bg)',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>Product Details</h4>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <p><strong>Description:</strong> {product.description}</p>
            {product.harvestDate && (
              <p><strong>Harvest Date:</strong> {new Date(product.harvestDate).toLocaleDateString()}</p>
            )}
            <p><strong>Available Quantity:</strong> {product.quantity} {product.unit}</p>
            <p><strong>Minimum Order:</strong> {product.minOrderQuantity} {product.unit}</p>
            <p><strong>Lead Time:</strong> {product.leadTime}</p>
            {product.location && <p><strong>Location:</strong> {product.location}</p>}
          </div>
        </div>
      )}

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <QuoteModal 
          product={product} 
          onClose={() => setShowQuoteModal(false)} 
        />
      )}
    </div>
  );
};

const QuoteModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    quantity: product.minOrderQuantity,
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const quoteData = {
        productId: product.id,
        productName: product.name,
        producer: product.organization,
        ...formData
      };
      
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Quote request sent successfully!\n\nReference ID: ${result.quoteId}\n\n${product.organization} will contact you within 24 hours at ${formData.email}`);
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to send quote request: ${error.error}`);
      }
    } catch (error) {
      console.error('Quote request error:', error);
      alert('Failed to send quote request. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="text-xl font-semibold">Request Quote</h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>{product.name}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            From: {product.organization} • Available: {product.quantity} {product.unit} • Price: ₹{product.price}/{product.unit}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Name *</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Quantity Required ({product.unit}) *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-input"
              min={product.minOrderQuantity}
              max={product.maxOrderQuantity}
              required
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              Min: {product.minOrderQuantity} {product.unit}, Max: {product.maxOrderQuantity} {product.unit}
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Additional Requirements</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="form-input"
              rows="3"
              placeholder="Delivery timeline, quality specifications, packaging requirements, etc."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Send Quote Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Marketplace;