import React, { useState, useRef, useEffect } from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import { useTranslation } from "react-i18next";
import NotificationDropdown from "../../../components/NotificationDropdown";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

const Header = () => {
  const { getCartItemsCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cartItemsCount = typeof getCartItemsCount === "function" ? getCartItemsCount() : 0;
  
  // Profile dropdown state
  const [profileOpenMobile, setProfileOpenMobile] = useState(false);
  const [profileOpenDesktop, setProfileOpenDesktop] = useState(false);
  const profileDropdownRefMobile = useRef(null);
  const profileDropdownRefDesktop = useRef(null);
  
  // Get user name
  const userName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'User';
  
  // Get initials for profile circle
  const getInitials = () => {
    if (user?.name || user?.fullName) {
      const name = (user?.name || user?.fullName).trim();
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRefMobile.current && !profileDropdownRefMobile.current.contains(event.target)) {
        setProfileOpenMobile(false);
      }
      if (profileDropdownRefDesktop.current && !profileDropdownRefDesktop.current.contains(event.target)) {
        setProfileOpenDesktop(false);
      }
    };

    if (profileOpenMobile || profileOpenDesktop) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpenMobile, profileOpenDesktop]);

  return (
    <>
      {/* Topbar Start */}
      <div className="container-fluid bg-primary text-white d-none d-lg-flex">
        <div className="container py-3">
          <div className="d-flex align-items-center">
            <a href="/">
              <h2 className="text-white fw-bold m-0">SmartWeld</h2>
            </a>
            <div className="ms-auto d-flex align-items-center">
              <small className="ms-4"><i className="fa fa-map-marker-alt me-2"></i>Lalitpur, kumaripati</small>
              <small className="ms-4"><i className="fa fa-envelope me-2"></i>info@example.com</small>
              <small className="ms-4"><i className="fa fa-phone-alt me-2"></i>+977- 9865000000</small>
              <div className="ms-3 d-flex">
                <a className="btn btn-sm-square btn-light text-primary rounded-circle mx-1 d-flex justify-content-center align-items-center" href=""><i className="fab fa-facebook-f"></i></a>
                <a className="btn btn-sm-square btn-light text-primary rounded-circle mx-1 d-flex justify-content-center align-items-center" href=""><i className="fab fa-twitter"></i></a>
                <a className="btn btn-sm-square btn-light text-primary rounded-circle mx-1 d-flex justify-content-center align-items-center" href=""><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Topbar End */}

      {/* Navbar Start */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div className="container">

          {/* Cart & Login - Visible on mobile */}
          <div className="d-flex align-items-center d-lg-none gap-2">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Cart Icon */}
            <button 
              className="btn btn-outline-dark position-relative" 
              onClick={() => navigate('/cart')}
              style={{ padding: '6px 10px' }}
            >
              <i className="fas fa-shopping-cart"></i>
              {cartItemsCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                  {cartItemsCount}
                </span>
              )}
            </button>
            
            {/* Notification Icon - Next to Cart */}
            {user && <NotificationDropdown />}
            
            {/* User Menu - Mobile */}
            {user ? (
              <div className="dropdown" ref={profileDropdownRefMobile} style={{ position: 'relative' }}>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setProfileOpenMobile(!profileOpenMobile);
                  }}
                  style={{ 
                    background: 'transparent', 
                    border: 'none',
                    padding: '0',
                    margin: '0',
                    boxShadow: 'none',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ 
                         width: '36px', 
                         height: '36px', 
                         fontSize: '12px', 
                         fontWeight: 'bold',
                         cursor: 'pointer',
                         lineHeight: '36px'
                       }}>
                    {getInitials()}
                  </div>
                  <i className="fa fa-chevron-down" aria-hidden="true"></i>
                </button>
                {profileOpenMobile && (
                  <div className="dropdown-menu show" style={{ display: 'block', right: 0, left: 'auto', minWidth: '200px' }}>
                    <div className="dropdown-header">
                      <div className="fw-bold">{userName}</div>
                      <small className="text-muted">{user?.email || t('common.userAccount')}</small>
                    </div>
                    <div className="dropdown-divider"></div>
                    <a className="dropdown-item" href="/profile">
                      <i className="fas fa-user me-2"></i>{t('common.profile')}
                    </a>
                    <div className="dropdown-divider"></div>
                    {user.role === 'ADMIN' && (
                      <a className="dropdown-item" href="/admin">
                        <i className="fas fa-user-shield me-2"></i>{t('common.adminPanel')}
                      </a>
                    )}
                    <button 
                      className="dropdown-item text-danger"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>{t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" className="btn btn-primary btn-sm">
                <i className="fas fa-user"></i>
              </a>
            )}
          </div>

          {/* Toggle Button */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Content */}
          <div className="collapse navbar-collapse" id="navbarContent">
            {/* Navigation Links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" href="/">{t('common.home')}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/aboutus">{t('common.about')}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/services">{t('common.services')}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/products">{t('common.products')}</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  {t('common.pages')}
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="/feature">{t('common.features')}</a></li>
                  <li><a className="dropdown-item" href="/team">{t('common.ourTeam')}</a></li>
                  <li><a className="dropdown-item" href="/testimonial">{t('common.testimonial')}</a></li>
                  <li><a className="dropdown-item" href="/appointment">{t('common.appointment')}</a></li>
                  <li><a className="dropdown-item" href="/Error-404">{t('common.404Page')}</a></li>
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/contactus">{t('common.contact')}</a>
              </li>
            </ul>

            {/* Cart & Login - Visible on desktop */}
            <div className="d-flex align-items-center ms-lg-auto gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Cart Icon */}
              <button 
                className="btn btn-outline-dark position-relative"
                onClick={() => navigate('/cart')}
                style={{ padding: '6px 12px' }}
              >
                <i className="fas fa-shopping-cart"></i>
                {cartItemsCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              
              {/* Notification Icon - Next to Cart */}
              {user && <NotificationDropdown />}
              
              {/* User Menu - Desktop */}
              {user ? (
                <div className="dropdown" ref={profileDropdownRefDesktop} style={{ position: 'relative' }}>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setProfileOpenDesktop(!profileOpenDesktop);
                    }}
                    style={{ 
                      background: 'transparent', 
                      border: 'none',
                      padding: '0',
                      margin: '0',
                      boxShadow: 'none',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ 
                           width: '40px', 
                           height: '40px', 
                           fontSize: '14px', 
                           fontWeight: 'bold',
                           cursor: 'pointer',
                           lineHeight: '40px'
                         }}>
                      {getInitials()}
                    </div>
                  </button>
                  {profileOpenDesktop && (
                    <div className="dropdown-menu show" style={{ display: 'block', right: 0, left: 'auto', minWidth: '200px' }}>
                      <div className="dropdown-header">
                        <div className="fw-bold">{userName}</div>
                        <small className="text-muted">{user?.email || t('common.userAccount')}</small>
                      </div>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item" href="/profile">
                        <i className="fas fa-user me-2"></i>{t('common.profile')}
                      </a>
                      <div className="dropdown-divider"></div>
                      {user.role === 'ADMIN' && (
                        <a className="dropdown-item" href="/admin">
                          <i className="fas fa-user-shield me-2"></i>{t('common.adminPanel')}
                        </a>
                      )}
                      <button 
                        className="dropdown-item text-danger"
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>{t('common.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <a href="/login" className="btn btn-primary">
                  {t('common.loginSignup')}
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Navbar End */}
    </>
  );
};

export default Header;