// src/pages/Customer/component/CartPage.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import { useAuth } from "../../../Context/AuthContext";
import { WarningMessageToast } from '../../../utils/Tostify.util';

const CartPage = () => {
  const { t } = useTranslation();
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    getCartItemsCount 
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goldColor = '#CE9233';

  if (cartItems.length === 0) {
    return (
        <>
        <Header/>
      <div className="min-vh-100 bg-light">
        <div className="container py-5">
          <div className="row">
            <div className="col-12 text-center py-5">
              <i className="fas fa-shopping-cart fs-1 text-muted mb-4"></i>
              <h3 className="text-muted mb-3">{t('cart.yourCartIsEmpty')}</h3>
              <p className="text-muted mb-4">{t('cart.addSomeProducts')}</p>
              <button 
                className="btn btn-primary px-4"
                style={{ backgroundColor: goldColor, borderColor: goldColor, color: 'white' }}
                onClick={() => navigate('/products')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                {t('cart.continueShopping')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
      </>
    );
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      WarningMessageToast(t('cart.pleaseLoginToCheckout'));
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 200 ? 0 : 15.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <>
    <Header/>
    <div className="min-vh-100 bg-light py-5">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 fw-bold text-dark">{t('cart.title')}</h1>
              <span className="text-muted">{getCartItemsCount()} {t('cart.items')}</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('cart.cartItems')}</h5>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={clearCart}
                >
                  <i className="fas fa-trash me-1"></i>
                  {t('cart.clearCart')}
                </button>
              </div>
              <div className="card-body p-0">
                {cartItems.map(item => (
                  <div key={item.id} className="border-bottom p-4">
                    <div className="row align-items-center">
                      <div className="col-md-2">
                        <img
                          src={item.image || item.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}
                          alt={item.name}
                          className="img-fluid rounded"
                          style={{ height: '80px', objectFit: 'cover' }}
                        />
                      </div>
                      
                      <div className="col-md-4">
                        <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                        <p className="text-muted small mb-2">{item.category}</p>
                        <span className="text-primary fw-bold">Rs. {item.price.toFixed(2)}</span>
                      </div>

                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            className="form-control form-control-sm mx-2 text-center"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            style={{ width: '60px' }}
                          />
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-md-2 text-center">
                        <span className="fw-bold text-dark">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                      </div>

                      <div className="col-md-1 text-end">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/products')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                {t('cart.continueShopping')}
              </button>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-white">
                <h5 className="mb-0">{t('checkout.orderSummary')}</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">{t('cart.subtotal')} ({getCartItemsCount()} {t('cart.items')})</span>
                    <span className="fw-semibold">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">{t('cart.shipping')}</span>
                    <span className={shipping === 0 ? 'text-success' : 'fw-semibold'}>
                      {shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">{t('cart.tax')}</span>
                    <span className="fw-semibold">Rs. {tax.toFixed(2)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span className="fw-bold">{t('cart.total')}</span>
                    <span className="fw-bold text-primary h5">Rs. {total.toFixed(2)}</span>
                  </div>

                  {subtotal < 200 && (
                    <div className="alert alert-info py-2">
                      <small>
                        <i className="fas fa-shipping-fast me-1"></i>
                        {t('cart.freeShipping')}
                      </small>
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button 
                    className="btn btn-primary py-3 fw-semibold"
                    style={{ backgroundColor: goldColor, borderColor: goldColor }}
                    onClick={handleProceedToCheckout}
                  >
                    <i className="fas fa-lock me-2"></i>
                    {t('cart.proceedToCheckout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CartPage;