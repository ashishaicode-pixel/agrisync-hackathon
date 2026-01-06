import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  User, Bell, Shield, Palette, CreditCard, 
  Key, Smartphone, Mail, Save, Camera, Check
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage, t, languages } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    organization: user?.organization || '',
    phone: user?.phone || '',
    bio: '',
    location: '',
    website: ''
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailScans: false,
    emailMarketing: false,
    pushOrders: true,
    pushScans: true,
    smsOrders: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: '30'
  });

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'security', label: t('settings.security'), icon: Shield },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'billing', label: t('settings.billing'), icon: CreditCard },
    { id: 'api', label: t('settings.apiKeys'), icon: Key }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: '2rem 0', minHeight: '100vh' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="text-3xl font-bold mb-2">{t('settings.title')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('settings.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Sidebar */}
          <div style={{ width: '250px', flexShrink: 0 }}>
            <div className="card-glass" style={{ padding: '0.5rem' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'var(--text-primary)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            {activeTab === 'profile' && (
              <div className="card-glass">
                <h2 className="text-xl font-semibold mb-6">{t('settings.profileSettings')}</h2>
                
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <button className="btn btn-secondary" style={{ marginBottom: '0.5rem' }}>
                      <Camera size={16} />
                      {t('settings.changePhoto')}
                    </button>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {t('settings.photoHint')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('settings.username')}</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({...profile, username: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('settings.email')}</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('settings.organization')}</label>
                    <input
                      type="text"
                      value={profile.organization}
                      onChange={(e) => setProfile({...profile, organization: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('settings.phone')}</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('batch.location')}</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      className="form-input"
                      placeholder={t('settings.cityCountry')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('settings.website')}</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                      className="form-input"
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('settings.bio')}</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="form-input"
                    rows="4"
                    placeholder={t('settings.bioPlaceholder')}
                  />
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card-glass">
                <h2 className="text-xl font-semibold mb-6">{t('settings.notificationPrefs')}</h2>
                
                <div style={{ marginBottom: '2rem' }}>
                  <h3 className="font-semibold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={18} />
                    {t('settings.emailNotifications')}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ToggleOption
                      label={t('settings.orderUpdates')}
                      description={t('settings.orderUpdatesDesc')}
                      checked={notifications.emailOrders}
                      onChange={() => setNotifications({...notifications, emailOrders: !notifications.emailOrders})}
                    />
                    <ToggleOption
                      label={t('settings.qrScanAlerts')}
                      description={t('settings.qrScanAlertsDesc')}
                      checked={notifications.emailScans}
                      onChange={() => setNotifications({...notifications, emailScans: !notifications.emailScans})}
                    />
                    <ToggleOption
                      label={t('settings.marketingTips')}
                      description={t('settings.marketingTipsDesc')}
                      checked={notifications.emailMarketing}
                      onChange={() => setNotifications({...notifications, emailMarketing: !notifications.emailMarketing})}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 className="font-semibold mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Smartphone size={18} />
                    {t('settings.pushNotifications')}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ToggleOption
                      label={t('settings.orderAlerts')}
                      description={t('settings.orderAlertsDesc')}
                      checked={notifications.pushOrders}
                      onChange={() => setNotifications({...notifications, pushOrders: !notifications.pushOrders})}
                    />
                    <ToggleOption
                      label={t('settings.scanNotifications')}
                      description={t('settings.scanNotificationsDesc')}
                      checked={notifications.pushScans}
                      onChange={() => setNotifications({...notifications, pushScans: !notifications.pushScans})}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card-glass">
                <h2 className="text-xl font-semibold mb-6">{t('settings.security')}</h2>
                
                <div style={{ marginBottom: '2rem' }}>
                  <ToggleOption
                    label={t('settings.twoFactor')}
                    description={t('settings.twoFactorDesc')}
                    checked={security.twoFactor}
                    onChange={() => setSecurity({...security, twoFactor: !security.twoFactor})}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <ToggleOption
                    label={t('settings.loginAlerts')}
                    description={t('settings.loginAlertsDesc')}
                    checked={security.loginAlerts}
                    onChange={() => setSecurity({...security, loginAlerts: !security.loginAlerts})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('settings.sessionTimeout')}</label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                    className="form-input"
                    style={{ width: 'auto' }}
                  >
                    <option value="15">15 {t('settings.minutes')}</option>
                    <option value="30">30 {t('settings.minutes')}</option>
                    <option value="60">1 {t('settings.hour')}</option>
                    <option value="240">4 {t('settings.hours')}</option>
                    <option value="never">{t('settings.never')}</option>
                  </select>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                  <h3 className="font-semibold mb-4">{t('settings.changePassword')}</h3>
                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">{t('settings.currentPassword')}</label>
                      <input type="password" className="form-input" />
                    </div>
                    <div></div>
                    <div className="form-group">
                      <label className="form-label">{t('settings.newPassword')}</label>
                      <input type="password" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('settings.confirmNewPassword')}</label>
                      <input type="password" className="form-input" />
                    </div>
                  </div>
                  <button className="btn btn-secondary">{t('settings.updatePassword')}</button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="card-glass">
                <h2 className="text-xl font-semibold mb-6">{t('settings.appearance')}</h2>
                
                <div style={{ marginBottom: '2rem' }}>
                  <h3 className="font-semibold mb-4">{t('settings.theme')}</h3>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => isDark && toggleTheme()}
                      className={`btn ${!isDark ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '1.5rem', flexDirection: 'column', gap: '0.5rem' }}
                    >
                      <div style={{ fontSize: '2rem' }}>☀️</div>
                      {t('settings.lightMode')}
                    </button>
                    <button
                      onClick={() => !isDark && toggleTheme()}
                      className={`btn ${isDark ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '1.5rem', flexDirection: 'column', gap: '0.5rem' }}
                    >
                      <div style={{ fontSize: '2rem' }}>🌙</div>
                      {t('settings.darkMode')}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">{t('settings.language')}</h3>
                  <select 
                    className="form-input" 
                    style={{ width: 'auto', minWidth: '200px' }}
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {t('settings.languageChangeHint')}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="card-glass">
                <h2 className="text-xl font-semibold mb-6">{t('settings.billingSubscription')}</h2>
                
                <div style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  color: 'white',
                  marginBottom: '2rem'
                }}>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('settings.currentPlan')}</div>
                  <div className="text-2xl font-bold mb-2">{t('settings.proPlan')}</div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>₹2,499/month • {t('settings.renewsOn')} Jan 15, 2025</div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 className="font-semibold mb-4">{t('settings.paymentMethod')}</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'var(--glass-bg)',
                    borderRadius: '12px'
                  }}>
                    <div style={{ fontSize: '2rem' }}>💳</div>
                    <div>
                      <div className="font-semibold">•••• •••• •••• 4242</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t('settings.expires')} 12/26</div>
                    </div>
                    <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>{t('settings.update')}</button>
                  </div>
                </div>

                <button className="btn btn-outline">{t('settings.viewBillingHistory')}</button>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="card-glass">
                <h2 className="text-xl font-semibold mb-6">{t('settings.apiKeys')}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  {t('settings.apiKeysDesc')}
                </p>
                
                <div style={{
                  padding: '1rem',
                  background: 'var(--glass-bg)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                  fontFamily: 'monospace'
                }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('settings.productionKey')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <code style={{ flex: 1 }}>sk_live_••••••••••••••••••••••••</code>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>{t('settings.copy')}</button>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'var(--glass-bg)',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  fontFamily: 'monospace'
                }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('settings.testKey')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <code style={{ flex: 1 }}>sk_test_••••••••••••••••••••••••</code>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>{t('settings.copy')}</button>
                  </div>
                </div>

                <button className="btn btn-primary">{t('settings.generateNewKey')}</button>
              </div>
            )}

            {/* Save Button */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSave}>
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? t('settings.saved') : t('settings.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleOption = ({ label, description, checked, onChange }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'var(--glass-bg)',
    borderRadius: '12px'
  }}>
    <div>
      <div className="font-semibold">{label}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{description}</div>
    </div>
    <button
      onClick={onChange}
      style={{
        width: '50px',
        height: '28px',
        borderRadius: '14px',
        background: checked ? 'var(--accent-primary)' : 'var(--border-color)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s'
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: '3px',
        left: checked ? '25px' : '3px',
        transition: 'left 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }} />
    </button>
  </div>
);

export default Settings;
