import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      default:
        return 'toast-success';
    }
  };

  return (
    <div className={`toast ${getTypeClass()} ${isVisible ? 'toast-show' : 'toast-hide'}`}>
      <div className="toast-content">
        {getIcon()}
        <span>{message}</span>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="toast-close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;