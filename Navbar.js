import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Leaf, LogOut, Plus, Home, Moon, Sun, 
  ShoppingBag, BarChart3, Package, Settings, Menu, X, ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = user?.role === 'buyer' ? [
    { path: '/marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { path: '/orders', label: 'My Orders', icon: Package },
  ] : [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { path: '/orders', label: t('nav.orders'), icon: Package },
    { path: '/analytics', label: t('nav.analytics'), icon: BarChart3 },
  ];

  return (
    <nav className="glass-strong" style={{
      padding: '0.75rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          color: 'var(--accent-primary)',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          <Leaf size={32} />
          AgriSync
        </Link>

        {/* Desktop Navigation */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          '@media (max-width: 768px)': { display: 'none' }
        }} className="desktop-nav">
          {/* Public Marketplace Link */}
          <Link 
            to="/marketplace" 
            className={`btn ${isActive('/marketplace') ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            <ShoppingBag size={16} />
            Marketplace
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '0.5rem' }}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <>
              {/* Main Nav Links */}
              {navLinks.filter(l => l.path !== '/marketplace').map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`btn ${isActive(link.path) ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              ))}

              {/* Create Batch Button - Only for Farmers/Producers */}
              {user.role === 'producer' && (
                <Link to="/create-batch" className="btn btn-primary">
                  <Plus size={16} />
                  New Batch
                </Link>
              )}

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="glass" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    background: 'var(--glass-bg)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: 'var(--text-primary)' }}>{user.username}</span>
                  <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
                </button>

                {dropdownOpen && (
                  <div 
                    className="card-glass"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      minWidth: '200px',
                      padding: '0.5rem',
                      zIndex: 100
                    }}
                  >
                    <Link 
                      to="/settings" 
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.25rem' }}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setDropdownOpen(false); }}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'flex-start', color: '#ef4444' }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-secondary mobile-menu-btn"
          style={{ padding: '0.5rem', display: 'none' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="card-glass mobile-menu" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          padding: '1rem',
          margin: '0.5rem',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/marketplace" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingBag size={16} /> Marketplace
            </Link>
            {user ? (
              <>
                {navLinks.filter(l => l.path !== '/marketplace').map(link => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className="btn btn-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon size={16} /> {link.label}
                  </Link>
                ))}
                <Link to="/create-batch" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                  <Plus size={16} /> New Batch
                </Link>
                <Link to="/settings" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                  <Settings size={16} /> Settings
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn btn-outline">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
            <button onClick={toggleTheme} className="btn btn-secondary">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;