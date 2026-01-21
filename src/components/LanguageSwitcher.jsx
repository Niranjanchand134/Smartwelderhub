import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    setIsOpen(false);
  };

  const currentLanguage = i18n.language || 'en';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="btn btn-outline-primary btn-sm"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minWidth: '80px',
          fontSize: '0.875rem',
          padding: '6px 12px'
        }}
      >
        {currentLanguage === 'en' ? 'EN' : 'नेपाली'} <i className="fa fa-chevron-down ms-1" style={{ fontSize: '0.7rem' }}></i>
      </button>
      {isOpen && (
        <ul className="dropdown-menu show dropdown-menu-end" style={{ display: 'block', minWidth: '120px' }}>
          <li>
            <button
              className={`dropdown-item ${currentLanguage === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
              style={{
                background: currentLanguage === 'en' ? '#f8f9fa' : 'transparent',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              English
            </button>
          </li>
          <li>
            <button
              className={`dropdown-item ${currentLanguage === 'np' ? 'active' : ''}`}
              onClick={() => changeLanguage('np')}
              style={{
                background: currentLanguage === 'np' ? '#f8f9fa' : 'transparent',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              नेपाली
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;

