import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/AuthContext';
import { 
  getUserNotifications, 
  getUserUnreadCount,
  markNotificationAsRead,
  markAllAsReadForUser,
  deleteNotification,
  deleteAllUserNotifications
} from '../services/notificationService';

const NotificationDropdownWelder = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (isOpen) {
          fetchNotifications();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, isOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getUserNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUserUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

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
      await markAllAsReadForUser();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = () => {
    setShowConfirmModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      await deleteAllUserNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setShowConfirmModal(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CHAT_MESSAGE':
        return 'fas fa-comments text-primary';
      case 'MATERIAL_REQUEST_APPROVED':
        return 'fas fa-check-circle text-success';
      case 'MATERIAL_REQUEST_REJECTED':
        return 'fas fa-times-circle text-danger';
      case 'MATERIAL_REQUEST_FULFILLED':
        return 'fas fa-box-check text-info';
      case 'ORDER_PLACED':
        return 'fas fa-shopping-cart text-warning';
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

  // Close dropdown when clicking outside
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

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <>
      <div className="dropdown position-relative" ref={dropdownRef} style={{ zIndex: 1050, display: 'block', visibility: 'visible' }}>
        <button
          className="btn btn-link text-dark position-relative"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggle();
          }}
          style={{ 
            border: 'none',
            padding: '8px',
            minWidth: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            visibility: 'visible',
            opacity: 1
          }}
          title="Notifications"
        >
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span 
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style={{ 
                fontSize: '0.7rem', 
                padding: '2px 6px',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: '1'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div 
            className="dropdown-menu dropdown-menu-end show"
            style={{
              width: '350px',
              maxHeight: '500px',
              overflowY: 'auto',
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              zIndex: 1051,
              display: 'block'
            }}
          >
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h6 className="mb-0 fw-bold">Notifications</h6>
              <div className="d-flex gap-2">
                {notifications.length > 0 && (
                  <button
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={handleClearAll}
                    title="Clear all notifications"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    className="btn btn-sm btn-link text-primary p-0"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
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
                          <div className="d-flex align-items-center gap-2">
                            {!notification.isRead && (
                              <span className="badge bg-primary rounded-pill">New</span>
                            )}
                            <button
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              title="Delete notification"
                              style={{ fontSize: '0.875rem' }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop-wrapper" style={{ position: 'fixed', inset: 0, zIndex: 1060 }}>
          <div className="modal-backdrop show" style={{ zIndex: 1060 }}></div>
          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1070 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                    Confirm Delete
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowConfirmModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-0">
                    Are you sure you want to delete all notifications? This action cannot be undone.
                  </p>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowConfirmModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={confirmDeleteAll}
                  >
                    <i className="fas fa-trash-alt me-1"></i>
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationDropdownWelder;
