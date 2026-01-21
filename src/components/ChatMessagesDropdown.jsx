import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Context/AuthContext';
import { 
  getWelderConversations, 
  getUnreadCount,
  markMessagesAsRead
} from '../services/chatService';

const ChatMessagesDropdown = ({ onNavigate }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user && user.role === 'WELDER') {
      fetchConversations();
      fetchUnreadCount();
      
      // Poll for new messages every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (isOpen) {
          fetchConversations();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, isOpen]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const data = await getWelderConversations();
      // Filter to show only conversations with unread messages or recent messages
      const conversationsWithUnread = Array.isArray(data) 
        ? data.filter(conv => conv.unread || conv.lastMessage)
        : [];
      // Sort by unread first, then by last message time
      conversationsWithUnread.sort((a, b) => {
        if (a.unread && !b.unread) return -1;
        if (!a.unread && b.unread) return 1;
        if (a.time && b.time) {
          return new Date(b.time) - new Date(a.time);
        }
        return 0;
      });
      setConversations(conversationsWithUnread.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchConversations();
    }
    setIsOpen(!isOpen);
  };

  const handleConversationClick = async (userId) => {
    try {
      // Mark messages as read when clicking on conversation
      await markMessagesAsRead(userId);
      setIsOpen(false);
      // Navigate to customer chat page using the dashboard's navigation
      if (onNavigate) {
        onNavigate('customer-chat');
        // Dispatch event to open specific conversation
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openChatWithUser', { detail: { userId } }));
        }, 100);
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
      // Still navigate even if marking as read fails
      setIsOpen(false);
      if (onNavigate) {
        onNavigate('customer-chat');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openChatWithUser', { detail: { userId } }));
        }, 100);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getMessagePreview = (message, hasImage) => {
    if (hasImage && !message) return '📷 Image';
    if (message && message.length > 50) {
      return message.substring(0, 50) + '...';
    }
    return message || 'No message';
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

  // Don't render if no user or not a welder
  if (!user || user.role !== 'WELDER') {
    return null;
  }

  return (
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
        title="Messages"
      >
        <i className="fas fa-comments"></i>
        {unreadCount > 0 && (
          <span 
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
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
            <h6 className="mb-0 fw-bold">Messages</h6>
            {conversations.length > 0 && (
              <button
                className="btn btn-sm btn-link text-primary p-0"
                onClick={() => {
                  setIsOpen(false);
                  if (onNavigate) {
                    onNavigate('customer-chat');
                  }
                }}
              >
                View All
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center p-4">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <i className="fas fa-comments fa-2x mb-2"></i>
              <p className="mb-0">No messages</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {conversations.map((conversation) => {
                const userName = conversation.customer || conversation.userName || conversation.name || 'Customer';
                const lastMessage = conversation.lastMessage || '';
                const hasImage = conversation.hasImage || false;
                const isUnread = conversation.unread || false;
                const userId = conversation.customerId || conversation.userId || conversation.id;
                
                return (
                  <div
                    key={userId}
                    className={`list-group-item list-group-item-action ${isUnread ? 'bg-light' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleConversationClick(userId)}
                  >
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                             style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                          {getInitials(userName)}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1 fw-semibold">{userName}</h6>
                          <div className="d-flex align-items-center gap-2">
                            {isUnread && (
                              <span className="badge bg-primary rounded-pill">New</span>
                            )}
                            {conversation.time && (
                              <small className="text-muted">{formatDate(conversation.time)}</small>
                            )}
                          </div>
                        </div>
                        <p className="mb-0 small text-muted">{getMessagePreview(lastMessage, hasImage)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessagesDropdown;
