// src/components/AdminPanel/Header.js
import React, { useState, useEffect, useRef } from 'react';
import NotificationDropdownAdmin from '../../../components/NotificationDropdownAdmin';
import { useAuth } from '../../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getAdminNotifications,
  getAdminUnreadCount,
  markNotificationAsRead,
  markAllAsReadForAdmin,
} from '../../../services/notificationService';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const messageDropdownRef = useRef(null);

  const closeAllDropdowns = () => {
    setNotificationOpen(false);
    setMessageOpen(false);
    setProfileOpen(false);
  };

  const fetchNotifications = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAdminNotifications();
      setNotifications(data || []);
    } catch (error) {
      // Silently handle 403 errors (user not admin) - don't spam console
      if (error.response?.status !== 403) {
        console.error('Failed to fetch notifications:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = React.useCallback(async () => {
    try {
      const count = await getAdminUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      // Silently handle 403 errors (user not admin) - don't spam console
      if (error.response?.status !== 403) {
        console.error('Failed to fetch unread count:', error);
      }
    }
  }, []);

  // Fetch admin notifications for Messages dropdown
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (messageOpen) {
          fetchNotifications();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, messageOpen, fetchNotifications, fetchUnreadCount]);

  // Close Messages dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageDropdownRef.current && !messageDropdownRef.current.contains(event.target)) {
        setMessageOpen(false);
      }
    };

    if (messageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [messageOpen]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadForAdmin();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'USER_REGISTERED':
        return 'fas fa-user-plus text-primary';
      case 'ORDER_PLACED':
        return 'fas fa-shopping-cart text-warning';
      case 'PAYMENT_CONFIRMED':
        return 'fas fa-check-circle text-success';
      default:
        return 'fas fa-bell text-info';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white rounded shadow-sm">
      <div className="container-fluid">
        <div className="d-flex w-100 align-items-center">
          {/* Search Bar */}
          <div className="input-group me-4 border rounded" style={{maxWidth: '400px'}}>
            <span className="input-group-text bg-white border-0">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control border-0" 
              placeholder="Search products, customers, orders..."
            />
          </div>

          {/* Icons and Profile */}
          <div className="d-flex align-items-center ms-auto">
            {/* Notifications Dropdown (real admin notifications) */}
            <div className="dropdown me-3">
              {/* Use shared admin notification dropdown component */}
              <NotificationDropdownAdmin />
            </div>

            {/* Messages Dropdown - Shows Admin Notifications */}
            <div className="dropdown me-3" ref={messageDropdownRef}>
              <button 
                className="btn btn-link text-muted position-relative p-2" 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMessageOpen(!messageOpen);
                  setNotificationOpen(false);
                  setProfileOpen(false);
                  if (!messageOpen) {
                    fetchNotifications();
                  }
                }}
              >
                <i className="fas fa-envelope fs-5"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {messageOpen && (
                <div 
                  className="dropdown-menu show" 
                  style={{
                    display: 'block', 
                    right: 0, 
                    left: 'auto',
                    width: '350px',
                    maxHeight: '500px',
                    overflowY: 'auto'
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h6 className="mb-0 fw-bold">User Activity</h6>
                    {unreadCount > 0 && (
                      <button
                        className="btn btn-sm btn-link text-primary p-0"
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="text-center p-4">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center p-4 text-muted">
                      <i className="fas fa-bell-slash fa-2x mb-2"></i>
                      <p className="mb-0">No notifications</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`list-group-item list-group-item-action ${
                            !notification.isRead ? 'bg-light' : ''
                          }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                        >
                          <div className="d-flex align-items-start">
                            <div className="me-3">
                              <i className={`${getNotificationIcon(notification.type)} fa-lg`}></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <h6 className="mb-1 fw-semibold">{notification.title}</h6>
                                {!notification.isRead && (
                                  <span className="badge bg-primary rounded-pill">New</span>
                                )}
                              </div>
                              <p className="mb-1 small text-muted">{notification.message}</p>
                              <small className="text-muted">{formatDate(notification.createdAt)}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="dropdown">
              <button 
                className="btn btn-link text-dark text-decoration-none d-flex align-items-center p-2" 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                  setNotificationOpen(false);
                  setMessageOpen(false);
                }}
              >
                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                     style={{width: '40px', height: '40px'}}>
                  {user?.email ? (user.email.charAt(0).toUpperCase() + (user.email.split('@')[0].charAt(1) || '').toUpperCase()) : 'A'}
                </div>
                <div className="d-none d-md-block text-start">
                  <div className="fw-bold">{user?.email?.split('@')[0] || 'Admin'}</div>
                  <small className="text-muted">{user?.role === 'ADMIN' ? 'Admin' : user?.role || 'User'}</small>
                </div>
                <i className="fas fa-chevron-down ms-2 text-muted"></i>
              </button>
              {profileOpen && (
                <div className="dropdown-menu show" style={{display: 'block', right: 0, left: 'auto'}}>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-user me-2"></i>Profile
                  </a>
                  <a className="dropdown-item" href="#">
                    <i className="fas fa-cog me-2"></i>Settings
                  </a>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
  // This would be handled by each component individually
});

export default AdminHeader;