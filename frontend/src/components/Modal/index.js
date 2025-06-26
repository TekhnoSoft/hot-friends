import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './style.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  className = '',
  showCloseButton = true,
  maxWidth = '400px'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-container ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseButton && (
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          )}
        </div>

        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 