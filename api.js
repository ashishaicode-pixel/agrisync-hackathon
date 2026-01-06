// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  BATCHES: `${API_BASE_URL}/api/batches`,
  VERIFY: `${API_BASE_URL}/api/verify`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  QUOTES: `${API_BASE_URL}/api/quotes`,
  MARKETPLACE: `${API_BASE_URL}/api/marketplace`,
  AI: `${API_BASE_URL}/api/ai`,
  OTP: `${API_BASE_URL}/api/otp`
};

export default API_BASE_URL;