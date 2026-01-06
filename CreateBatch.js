import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import PhotoUpload from '../components/PhotoUpload';
import Toast from '../components/Toast';
import { supabase } from '../config/supabase';
import { testSupabaseConnection, createCropsTableIfNotExists } from '../utils/testSupabase';
import { Package, ArrowLeft, Sparkles, Mic, MicOff } from 'lucide-react';

const CreateBatch = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    quantity: '',
    unit: 'kg',
    harvest_date: '',
    location: '',
    description: '',
    price: '' // Added price field for voice parsing
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState('checking'); // checking, connected, error
  
  const navigate = useNavigate();

  // Test Supabase connection on component mount
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const connectionTest = await testSupabaseConnection();
        const tableTest = await createCropsTableIfNotExists();
        
        if (connectionTest.success && tableTest.success) {
          setSupabaseStatus('connected');
          showToast('✅ Supabase connected successfully!', 'success');
        } else {
          setSupabaseStatus('error');
          const errorMsg = connectionTest.error || tableTest.error || 'Connection failed';
          showToast(`⚠️ Supabase: ${errorMsg}`, 'warning');
          console.log('Supabase connection details:', { connectionTest, tableTest });
        }
      } catch (error) {
        setSupabaseStatus('error');
        showToast('❌ Supabase connection failed', 'error');
        console.error('Supabase connection error:', error);
      }
    };

    checkSupabaseConnection();
  }, []);

  const productTypes = [
    { value: 'Fruits', label: t('batch.fruits') },
    { value: 'Vegetables', label: t('batch.vegetables') },
    { value: 'Grains', label: t('batch.grains') },
    { value: 'Herbs', label: t('batch.herbs') },
    { value: 'Dairy', label: t('batch.dairy') },
    { value: 'Meat', label: t('batch.meat') },
    { value: 'Processed Food', label: t('batch.processedFood') },
    { value: 'Other', label: t('batch.other') }
  ];

  const units = ['kg', 'lbs', 'tons', 'pieces', 'boxes', 'bags'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Voice Recognition Functions
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Voice recognition is not supported in this browser', 'error');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // You can change this to 'hi-IN' for Hindi

    setIsListening(true);
    setVoiceStatus('Listening... Say something like "50 kg of Potatoes price 20 rupees"');

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Voice input:', transcript);
      parseVoiceInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      setIsListening(false);
      setVoiceStatus('');
      showToast('Voice recognition error. Please try again.', 'error');
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceStatus('');
    };

    recognition.start();
  };

  const parseVoiceInput = (transcript) => {
    try {
      // Parse patterns like "50 kg of Potatoes price 20 rupees"
      // or "I have 100 pieces of Apple price 15 rupees"
      
      let updatedFormData = { ...formData };
      let fieldsUpdated = [];

      // Extract quantity and unit
      const quantityMatch = transcript.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|lbs|pounds|tons|ton|pieces|piece|boxes|box|bags|bag)/i);
      if (quantityMatch) {
        updatedFormData.quantity = quantityMatch[1];
        let unit = quantityMatch[2].toLowerCase();
        // Normalize units
        if (unit.includes('kg') || unit.includes('kilogram')) unit = 'kg';
        else if (unit.includes('lb') || unit.includes('pound')) unit = 'lbs';
        else if (unit.includes('ton')) unit = 'tons';
        else if (unit.includes('piece')) unit = 'pieces';
        else if (unit.includes('box')) unit = 'boxes';
        else if (unit.includes('bag')) unit = 'bags';
        
        updatedFormData.unit = unit;
        fieldsUpdated.push('quantity', 'unit');
      }

      // Extract product name (look for common products)
      const products = ['potato', 'potatoes', 'tomato', 'tomatoes', 'apple', 'apples', 'rice', 'wheat', 'onion', 'onions', 'carrot', 'carrots', 'cabbage', 'spinach', 'corn', 'maize'];
      for (const product of products) {
        if (transcript.includes(product)) {
          updatedFormData.product_name = product.charAt(0).toUpperCase() + product.slice(1);
          fieldsUpdated.push('product name');
          break;
        }
      }

      // Extract price
      const priceMatch = transcript.match(/price\s*(\d+(?:\.\d+)?)\s*(?:rupees?|rs|₹)?/i);
      if (priceMatch) {
        updatedFormData.price = priceMatch[1];
        fieldsUpdated.push('price');
      }

      // Update form data
      setFormData(updatedFormData);

      // Show success message
      if (fieldsUpdated.length > 0) {
        showToast(`Auto-filled: ${fieldsUpdated.join(', ')}`, 'success');
        setVoiceStatus(`✓ Parsed: ${fieldsUpdated.join(', ')}`);
      } else {
        showToast('Could not parse voice input. Try saying: "50 kg of Potatoes price 20 rupees"', 'warning');
        setVoiceStatus('❌ Could not parse input');
      }

    } catch (error) {
      console.error('Error parsing voice input:', error);
      showToast('Error parsing voice input', 'error');
      setVoiceStatus('❌ Parsing error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // First save to local database (existing functionality)
      const response = await axios.post('/api/batches', formData);
      console.log('Local database save successful:', response.data);
      
      // Then try to save to Supabase
      try {
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('crops')
          .insert([
            {
              product_name: formData.product_name,
              product_type: formData.product_type,
              quantity: parseFloat(formData.quantity),
              unit: formData.unit,
              harvest_date: formData.harvest_date || null,
              location: formData.location,
              description: formData.description,
              price: formData.price ? parseFloat(formData.price) : null,
              created_at: new Date().toISOString(),
              batch_id: response.data.batch.id // Link to local batch
            }
          ])
          .select();

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          showToast('Saved locally, but Supabase sync failed', 'warning');
        } else {
          console.log('Saved to Supabase:', supabaseData);
          showToast('Successfully saved to both local and Supabase!', 'success');
        }
      } catch (supabaseErr) {
        console.error('Supabase save failed:', supabaseErr);
        showToast('Saved locally, Supabase unavailable', 'warning');
      }

      setSuccess(t('batch.success'));
      showToast('Batch created successfully!', 'success');
      
      // Redirect to batch details after 2 seconds
      setTimeout(() => {
        navigate(`/batch/${response.data.batch.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating batch:', error);
      const errorMessage = error.response?.data?.error || t('common.error');
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
      
      <div className="container" style={{ maxWidth: '700px' }}>
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
            <h1 className="text-2xl font-bold">{t('batch.createNew')}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{t('batch.registerNew')}</p>
          </div>
        </div>

        <div className="card-glass">
          <div className="text-center mb-6">
            <div className="float-animation">
              <Package size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{t('batch.aiEnhanced')}</span>
            </div>
            
            {/* Supabase Status Indicator */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: supabaseStatus === 'connected' ? '#22c55e' : 
                     supabaseStatus === 'error' ? '#ef4444' : '#f59e0b'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: supabaseStatus === 'connected' ? '#22c55e' : 
                                supabaseStatus === 'error' ? '#ef4444' : '#f59e0b',
                animation: supabaseStatus === 'checking' ? 'pulse 1.5s infinite' : 'none'
              }}></div>
              <span>
                Supabase: {
                  supabaseStatus === 'connected' ? 'Connected' :
                  supabaseStatus === 'error' ? 'Disconnected' : 'Connecting...'
                }
              </span>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Voice Recognition Section */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(var(--accent-primary-rgb), 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(var(--accent-primary-rgb), 0.1)'
            }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
                  🎤 AI Voice Auto-Fill
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Say: "50 kg of Potatoes price 20 rupees"
                </p>
              </div>
              <button
                type="button"
                onClick={startVoiceRecognition}
                className={`mic-button ${isListening ? 'listening' : ''}`}
                disabled={isListening}
                title="Click to start voice recognition"
              >
                {isListening ? <MicOff size={20} color="white" /> : <Mic size={20} color="white" />}
                {isListening && <div className="listening-indicator"></div>}
              </button>
            </div>

            {voiceStatus && (
              <div className={`voice-status ${isListening ? 'listening' : ''}`}>
                <Sparkles size={16} />
                <span>{voiceStatus}</span>
              </div>
            )}

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">{t('batch.productName')} *</label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="जैसे: जैविक टमाटर"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('batch.productType')} *</label>
                <select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">{t('batch.selectType')}</option>
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">{t('batch.quantity')} *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="जैसे: 100"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('batch.unit')} *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Price (₹ per {formData.unit})</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="जैसे: 25"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('batch.harvestDate')}</label>
                <input
                  type="date"
                  name="harvest_date"
                  value={formData.harvest_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('batch.location')}</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="जैसे: खेत A, पंजाब"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('batch.description')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input form-textarea"
                placeholder="इस बैच के बारे में अतिरिक्त विवरण..."
                rows="4"
              />
            </div>

            <PhotoUpload
              onPhotoSelect={() => {}}
              label={t('batch.photo')}
            />

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '2rem'
            }}>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                {t('batch.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <div className="loading"></div> : (
                  <>
                    <Sparkles size={16} />
                    {t('batch.create')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBatch;
