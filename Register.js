import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Mail, Lock, Building2, Phone, Shield, CheckCircle, Tractor, ShoppingBag } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP Verification, 3: Complete
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userType: '', // 'farmer' or 'buyer'
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: ''
  });
  const [otpData, setOtpData] = useState({
    emailOTP: '',
    phoneOTP: '',
    emailSent: false,
    phoneSent: false,
    emailVerified: false,
    phoneVerified: false
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleOTPChange = (e) => {
    setOtpData({
      ...otpData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.userType) {
      newErrors.userType = 'Please select your account type';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+91|91)?[6789]\d{9}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Invalid Indian phone number';
    }
    
    if (formData.userType === 'buyer' && !formData.organization.trim()) {
      newErrors.organization = 'Company/Business name is required for buyers';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmailOTP = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/otp/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const result = await response.json();
      if (result.success) {
        setOtpData({ ...otpData, emailSent: true });
        // In development, show the OTP
        if (result.developmentOTP) {
          alert(`Development Mode - Email OTP: ${result.developmentOTP}`);
        }
      } else {
        setErrors({ email: result.error || 'Failed to send email OTP' });
      }
    } catch (error) {
      setErrors({ email: 'Failed to send email OTP' });
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneOTP = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/otp/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      
      const result = await response.json();
      if (result.success) {
        setOtpData({ ...otpData, phoneSent: true });
        // In development, show the OTP
        if (result.developmentOTP) {
          alert(`Development Mode - SMS OTP: ${result.developmentOTP}`);
        }
      } else {
        setErrors({ phone: result.error || 'Failed to send SMS OTP' });
      }
    } catch (error) {
      setErrors({ phone: 'Failed to send SMS OTP' });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/otp/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          emailOTP: otpData.emailOTP,
          phoneOTP: otpData.phoneOTP
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setOtpData({
          ...otpData,
          emailVerified: result.emailVerified,
          phoneVerified: result.phoneVerified
        });
        setStep(3);
      } else {
        const newErrors = {};
        if (!result.emailVerified) {
          newErrors.emailOTP = result.emailError || 'Invalid email OTP';
        }
        if (!result.phoneVerified) {
          newErrors.phoneOTP = result.phoneError || 'Invalid phone OTP';
        }
        setErrors(newErrors);
      }
    } catch (error) {
      setErrors({ general: 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      // Automatically send OTPs
      await sendEmailOTP();
      await sendPhoneOTP();
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!otpData.emailOTP || !otpData.phoneOTP) {
      setErrors({ general: 'Please enter both OTPs' });
      return;
    }
    await verifyOTPs();
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
        phone: formData.phone,
        role: formData.userType === 'farmer' ? 'producer' : 'buyer'
      });
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="card-glass" style={{ width: '100%', maxWidth: '500px' }}>
        {/* Progress Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: step >= stepNum ? 'var(--accent-primary)' : 'var(--border-color)',
                color: step >= stepNum ? 'white' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {step > stepNum ? <CheckCircle size={20} /> : stepNum}
              </div>
              {stepNum < 3 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  background: step > stepNum ? 'var(--accent-primary)' : 'var(--border-color)',
                  margin: '0 0.5rem'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Registration Details */}
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 className="text-2xl font-bold mb-2">{t('auth.joinAgriSync')}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{t('auth.signUp')}</p>
            </div>

            <form onSubmit={handleStep1Submit}>
              {/* User Type Selection */}
              <div className="form-group">
                <label className="form-label">I am a:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'farmer' })}
                    style={{
                      padding: '1.5rem',
                      border: `2px solid ${formData.userType === 'farmer' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      background: formData.userType === 'farmer' ? 'rgba(16, 185, 129, 0.1)' : 'var(--glass-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Tractor size={32} style={{ color: formData.userType === 'farmer' ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                    <span style={{ 
                      fontWeight: '600',
                      color: formData.userType === 'farmer' ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}>
                      Farmer/Producer
                    </span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--text-secondary)',
                      textAlign: 'center'
                    }}>
                      I grow, produce, or supply agricultural products
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'buyer' })}
                    style={{
                      padding: '1.5rem',
                      border: `2px solid ${formData.userType === 'buyer' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      background: formData.userType === 'buyer' ? 'rgba(16, 185, 129, 0.1)' : 'var(--glass-bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <ShoppingBag size={32} style={{ color: formData.userType === 'buyer' ? 'var(--accent-primary)' : 'var(--text-secondary)' }} />
                    <span style={{ 
                      fontWeight: '600',
                      color: formData.userType === 'buyer' ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}>
                      Buyer/Business
                    </span>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--text-secondary)',
                      textAlign: 'center'
                    }}>
                      I purchase agricultural products for my business
                    </span>
                  </button>
                </div>
                {errors.userType && <div className="error-message">{errors.userType}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('settings.username')}</label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
                {errors.username && <div className="error-message">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('settings.email')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('settings.phone')}</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ paddingLeft: '3rem' }}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                {errors.phone && <div className="error-message">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  {formData.userType === 'farmer' ? 'Farm/Organization Name' : 'Company/Business Name'}
                  {formData.userType === 'farmer' ? ' (Optional)' : ' *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ paddingLeft: '3rem' }}
                    placeholder={formData.userType === 'farmer' ? 'e.g., Green Valley Farm' : 'e.g., Fresh Foods Pvt Ltd'}
                    required={formData.userType === 'buyer'}
                  />
                </div>
                {errors.organization && <div className="error-message">{errors.organization}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.confirmPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ paddingLeft: '3rem' }}
                    required
                  />
                </div>
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Processing...' : 'Continue to Verification'}
              </button>
            </form>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Shield size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <h1 className="text-2xl font-bold mb-2">Verify Your Details</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                We've sent verification codes to your email and phone number
              </p>
            </div>

            <form onSubmit={handleStep2Submit}>
              <div className="form-group">
                <label className="form-label">Email OTP</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {formData.email}
                  </span>
                  {otpData.emailSent && <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />}
                </div>
                <input
                  type="text"
                  name="emailOTP"
                  value={otpData.emailOTP}
                  onChange={handleOTPChange}
                  className="form-input"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
                {errors.emailOTP && <div className="error-message">{errors.emailOTP}</div>}
                {!otpData.emailSent && (
                  <button type="button" onClick={sendEmailOTP} className="btn btn-outline" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    Resend Email OTP
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone OTP</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Phone size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {formData.phone}
                  </span>
                  {otpData.phoneSent && <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />}
                </div>
                <input
                  type="text"
                  name="phoneOTP"
                  value={otpData.phoneOTP}
                  onChange={handleOTPChange}
                  className="form-input"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
                {errors.phoneOTP && <div className="error-message">{errors.phoneOTP}</div>}
                {!otpData.phoneSent && (
                  <button type="button" onClick={sendPhoneOTP} className="btn btn-outline" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    Resend SMS OTP
                  </button>
                )}
              </div>

              {errors.general && <div className="error-message">{errors.general}</div>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTPs'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Complete Registration */}
        {step === 3 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <CheckCircle size={64} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <h1 className="text-2xl font-bold mb-2">Verification Complete!</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Your email and phone number have been verified successfully
              </p>
            </div>

            <div style={{ background: 'var(--glass-bg)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Account Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Account Type:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {formData.userType === 'farmer' ? (
                      <>
                        <Tractor size={14} style={{ color: 'var(--accent-primary)' }} />
                        Farmer/Producer
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} style={{ color: 'var(--accent-primary)' }} />
                        Buyer/Business
                      </>
                    )}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Username:</span>
                  <span>{formData.username}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Email:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {formData.email}
                    <CheckCircle size={14} style={{ color: 'var(--accent-primary)' }} />
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Phone:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {formData.phone}
                    <CheckCircle size={14} style={{ color: 'var(--accent-primary)' }} />
                  </span>
                </div>
                {formData.organization && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{formData.userType === 'farmer' ? 'Farm/Organization:' : 'Company/Business:'}</span>
                    <span>{formData.organization}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleFinalSubmit}>
              {errors.general && <div className="error-message">{errors.general}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
              {t('auth.signInHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;