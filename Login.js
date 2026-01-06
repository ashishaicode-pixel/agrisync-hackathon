import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 0'
    }}>
      <div className="container" style={{ maxWidth: '400px' }}>
        <div className="card-glass">
          <div className="text-center mb-6">
            <LogIn size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
            <h1 className="text-2xl font-bold">{t('auth.welcomeBack')}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{t('auth.signIn')}</p>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.usernameOrEmail')}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? <div className="loading"></div> : t('nav.login')}
            </button>
          </form>

          <div className="text-center mt-6">
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                {t('auth.signUpHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
