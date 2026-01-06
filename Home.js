import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { QrCode, Shield, Smartphone, TrendingUp, Users, Globe, Sparkles } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
        color: 'white',
        padding: '6rem 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '60px',
          height: '60px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          animation: 'float 4s ease-in-out infinite reverse'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="float-animation">
            <Sparkles size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
          </div>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {t('home.title')}
          </h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2rem' }}>
            {t('home.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/dashboard" className="btn" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '1.125rem',
                padding: '1rem 2rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn" style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '1.125rem',
                  padding: '1rem 2rem',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  Get Started Free
                </Link>
                <Link to="/login" className="btn" style={{
                  background: 'transparent',
                  borderColor: 'white',
                  color: 'white',
                  fontSize: '1.125rem',
                  padding: '1rem 2rem',
                  border: '2px solid rgba(255, 255, 255, 0.5)'
                }}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why Choose AgriSync?
          </h2>
          <div className="grid grid-3">
            <div className="card-glass text-center slide-in">
              <QrCode size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <h3 className="text-xl font-semibold mb-4">QR Code Traceability</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Generate unique QR codes for each batch. Buyers can instantly verify product origin and journey with our advanced tracking system.
              </p>
            </div>
            <div className="card-glass text-center slide-in">
              <Shield size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <h3 className="text-xl font-semibold mb-4">Trust & Transparency</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Build trust with buyers through transparent supply chain records, AI-powered trust scoring, and certification tracking.
              </p>
            </div>
            <div className="card-glass text-center slide-in">
              <Smartphone size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <h3 className="text-xl font-semibold mb-4">AI-Powered Mobile</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Works on any device with offline support, AI chat assistance, and smart photo recognition for rural areas.
              </p>
            </div>
            <div className="card-glass text-center slide-in">
              <TrendingUp size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <h3 className="text-xl font-semibold mb-4">Premium Markets</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Access premium markets by proving ethical practices and sustainable farming methods with data-driven insights.
              </p>
            </div>
            <div className="card-glass text-center slide-in">
              <Users size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <h3 className="text-xl font-semibold mb-4">Built for Small Producers</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Designed specifically for smallholder farmers with AI guidance, voice commands, and minimal tech literacy requirements.
              </p>
            </div>
            <div className="card-glass text-center slide-in">
              <Globe size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
              <h3 className="text-xl font-semibold mb-4">Global Standards</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Supports international certification standards, blockchain anchoring, and multi-language compliance requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="glass" style={{ padding: '6rem 0', margin: '2rem 0' }}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">
            How It Works
          </h2>
          <div className="grid grid-3">
            <div className="text-center fade-in">
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)'
              }}>
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Create & Track</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Register your harvest with AI-assisted data entry. Our smart system guides you through optimal documentation practices.
              </p>
            </div>
            <div className="text-center fade-in">
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)'
              }}>
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Events</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Log processing steps with photo recognition, GPS tracking, and AI-powered quality assessments throughout the supply chain.
              </p>
            </div>
            <div className="text-center fade-in">
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem',
                boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)'
              }}>
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Verify & Trust</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Buyers scan QR codes for instant verification with AI-calculated trust scores, complete journey visualization, and producer connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Supply Chain?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Join thousands of producers building trust, accessing premium markets, and revolutionizing agriculture with AI-powered traceability
          </p>
          {!user && (
            <Link to="/register" className="btn btn-primary" style={{
              fontSize: '1.125rem',
              padding: '1rem 2rem'
            }}>
              Start Free Today
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;