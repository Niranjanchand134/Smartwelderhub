// src/pages/Customer/component/OrderConfirmation.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="card border-0 shadow-sm">
              <div className="card-body py-5">
                <i className="fas fa-check-circle text-success fs-1 mb-4"></i>
                <h2 className="fw-bold text-dark mb-3">{t('simpleOrderConfirmation.title')}</h2>
                <p className="text-muted mb-4">
                  {t('simpleOrderConfirmation.message')}
                </p>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary py-3"
                    onClick={() => navigate('/products')}
                  >
                    {t('simpleOrderConfirmation.continueShopping')}
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/')}
                  >
                    {t('simpleOrderConfirmation.backToHome')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;