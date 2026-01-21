// components/welder/pages/CustomerChat.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    getWelderConversations, 
    getWelderConversation, 
    sendMessage,
    sendMessageWithImage, 
    getUnreadCount 
} from '../../../services/chatService';

const CustomerChat = () => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const loadConversations = async () => {
        try {
            const data = await getWelderConversations();
            setConversations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load conversations:', error);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (userId) => {
        try {
            const data = await getWelderConversation(userId);
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count || 0);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    const handleChatSelect = (userId) => {
        setActiveChat(userId);
        loadMessages(userId);
    };

    useEffect(() => {
        loadConversations();
        loadUnreadCount();
        // Refresh every 5 seconds
        const interval = setInterval(() => {
            loadConversations();
            if (activeChat) {
                loadMessages(activeChat);
            }
            loadUnreadCount();
        }, 5000);
        return () => clearInterval(interval);
    }, [activeChat]);

    // Handle navigation from dropdown
    useEffect(() => {
        if (location.state?.openChat && location.state?.userId) {
            const userId = location.state.userId;
            handleChatSelect(userId);
            // Clear the state to prevent reopening on re-render
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Listen for custom event from dropdown
    useEffect(() => {
        const handleOpenChat = (event) => {
            const userId = event.detail?.userId;
            if (userId) {
                handleChatSelect(userId);
            }
        };

        window.addEventListener('openChatWithUser', handleOpenChat);
        return () => {
            window.removeEventListener('openChatWithUser', handleOpenChat);
        };
    }, []);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Image size must be less than 10MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !selectedImage) || !activeChat || sending) return;

        setSending(true);
        try {
            if (selectedImage) {
                await sendMessageWithImage(activeChat, newMessage.trim() || null, selectedImage);
                setSelectedImage(null);
                setImagePreview(null);
            } else {
                await sendMessage(activeChat, newMessage.trim());
            }
            setNewMessage('');
            // Reload messages
            await loadMessages(activeChat);
            await loadConversations();
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const activeConversation = conversations.find(chat => chat.id === activeChat);

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Customer Chat</h1>
                {unreadCount > 0 && (
                    <span className="badge bg-primary">{unreadCount} Unread Message{unreadCount > 1 ? 's' : ''}</span>
                )}
            </div>

            <div className="row">
                {/* Conversations List */}
                <div className="col-lg-4">
                    <div className="card shadow">
                        <div className="card-header bg-white">
                            <h6 className="m-0 font-weight-bold text-primary">Conversations</h6>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="p-3 text-center text-muted">Loading conversations...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-3 text-center text-muted">No conversations yet</div>
                            ) : (
                                conversations.map(chat => (
                                    <div 
                                        key={chat.id}
                                        className={`p-3 border-bottom cursor-pointer ${
                                            activeChat === chat.id ? 'bg-light' : ''
                                        }`}
                                        onClick={() => handleChatSelect(chat.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h6 className="mb-1">{chat.customer}</h6>
                                                <p className="mb-1 text-muted small">{chat.lastMessage}</p>
                                                <small className="text-muted">{formatTime(chat.time)}</small>
                                            </div>
                                            {chat.unread && <span className="badge bg-primary">New</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-primary">
                                {activeConversation ? `Chat with ${activeConversation.customer}` : 'Select a conversation'}
                            </h6>
                        </div>
                        <div className="card-body" style={{ height: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
                            {!activeChat ? (
                                <div className="text-center text-muted mt-5">Select a conversation to start chatting</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-muted mt-5">No messages yet. Start the conversation!</div>
                            ) : (
                                messages.map(message => (
                                    <div 
                                        key={message.id}
                                        className={`d-flex mb-3 ${
                                            message.sender === 'customer' ? 'justify-content-start' : 'justify-content-end'
                                        }`}
                                    >
                                        <div 
                                            className={`rounded p-3 ${
                                                message.sender === 'customer' 
                                                    ? 'bg-light text-dark' 
                                                    : 'bg-primary text-white'
                                            }`}
                                            style={{ maxWidth: '70%' }}
                                        >
                                            {message.imageUrl && (
                                                <div className="mb-2">
                                                    <img 
                                                        src={message.imageUrl} 
                                                        alt="Chat image" 
                                                        style={{ 
                                                            maxWidth: '100%', 
                                                            maxHeight: '300px', 
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            display: 'block',
                                                            objectFit: 'contain'
                                                        }}
                                                        onClick={() => window.open(message.imageUrl, '_blank')}
                                                        onError={(e) => {
                                                            console.error('Failed to load image:', message.imageUrl);
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {message.text && (
                                                <p className="mb-1" style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{message.text}</p>
                                            )}
                                            <small className={`d-block ${
                                                message.sender === 'customer' ? 'text-muted' : 'text-white-50'
                                            }`}>
                                                {formatTime(message.time)}
                                            </small>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {activeChat && (
                            <div className="card-footer">
                                {imagePreview && (
                                    <div className="mb-2 position-relative" style={{ display: 'inline-block' }}>
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            style={{ 
                                                maxWidth: '150px', 
                                                maxHeight: '150px', 
                                                borderRadius: '8px',
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                        <button 
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                            style={{ margin: '5px' }}
                                            onClick={removeImage}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                )}
                                <div className="input-group">
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="imageInput"
                                        onChange={handleImageSelect}
                                    />
                                    <label 
                                        htmlFor="imageInput" 
                                        className="btn btn-outline-secondary"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-image"></i>
                                    </label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={sending}
                                    />
                                    <button 
                                        className="btn btn-primary"
                                        onClick={handleSendMessage}
                                        disabled={sending || (!newMessage.trim() && !selectedImage)}
                                    >
                                        {sending ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            <i className="fas fa-paper-plane"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerChat;