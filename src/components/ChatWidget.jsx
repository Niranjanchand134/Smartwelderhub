import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    getUserConversations,
    sendMessage,
    sendMessageWithImage
} from '../services/chatService';
import {
    getSupportConversation,
    sendSupportMessage
} from '../services/customerSupportService';
import { extractNavigationIntent, findNavigationRoute } from '../utils/navigationRoutes';
import { getAllProducts } from '../services/productService';
import { useAuth } from '../Context/AuthContext';

const ChatWidget = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, authToken } = useAuth();
    
    // Check if we should show the chat widget
    // Hide in admin and welder sections, and require login
    const shouldShowChat = () => {
        // Don't show if user is not logged in
        if (!authToken || !user) {
            return false;
        }
        
        const path = location.pathname;
        const userRole = user?.role?.toUpperCase();
        
        // Don't show in admin section
        if (path.startsWith('/admin')) {
            return false;
        }
        
        // Don't show in welder section
        if (path.startsWith('/welder')) {
            return false;
        }
        
        // Don't show if user is admin or welder (even if on a public page)
        if (userRole === 'ADMIN' || userRole === 'WELDER') {
            return false;
        }
        
        // Show only for logged-in regular users (not admin/welder)
        return true;
    };
    
    // Early return if chat should not be shown
    if (!shouldShowChat()) {
        return null;
    }
    const [showMessenger, setShowMessenger] = useState(false);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [welderId, setWelderId] = useState(null);
    const [welderName, setWelderName] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [supportMessages, setSupportMessages] = useState([]);
    const [supportLoading, setSupportLoading] = useState(false);
    const [supportSending, setSupportSending] = useState(false);
    const [supportNewMessage, setSupportNewMessage] = useState('');
    const [products, setProducts] = useState([]);
    const messagesEndRef = useRef(null);
    const supportMessagesEndRef = useRef(null);

    useEffect(() => {
        if (selectedChat === 'welder' && showMessenger) {
            loadConversation();
            const interval = setInterval(() => {
                loadConversation();
            }, 5000);
            return () => clearInterval(interval);
        } else if (selectedChat === 'customer' && showMessenger) {
            loadSupportConversation();
            const interval = setInterval(() => {
                loadSupportConversation();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedChat, showMessenger]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        scrollSupportToBottom();
    }, [supportMessages]);

    // Fetch products when component mounts (for product name matching)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAllProducts();
                setProducts(data || []);
            } catch (error) {
                console.error('Failed to fetch products for navigation:', error);
            }
        };
        fetchProducts();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollSupportToBottom = () => {
        supportMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversation = async () => {
        try {
            setLoading(true);
            const data = await getUserConversations();
            if (data.welderId) {
                setWelderId(data.welderId);
                setWelderName(data.welderName);
                setMessages(Array.isArray(data.messages) ? data.messages : []);
            }
        } catch (error) {
            console.error('Failed to load conversation:', error);
            setMessages([]);
            setWelderId(null);
            setWelderName(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleMessenger = (e) => {
        e.preventDefault();
        if (showMessenger) {
            // Closing chat - reset everything
            setShowMessenger(false);
            setSelectedChat(null);
            setMessages([]);
            setSupportMessages([]);
        } else {
            // Opening chat - always start with selection screen
            setShowMessenger(true);
            setSelectedChat(null); // Ensure no chat is selected
            setMessages([]);
            setSupportMessages([]);
        }
    };

    const selectChat = async (chatType) => {
        setSelectedChat(chatType);
        if (chatType === 'welder') {
            await loadConversation();
        } else if (chatType === 'customer') {
            await loadSupportConversation();
        }
    };

    const loadSupportConversation = async () => {
        try {
            setSupportLoading(true);
            const data = await getSupportConversation();
            setSupportMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load support conversation:', error);
            setSupportMessages([]);
        } finally {
            setSupportLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert(t('messenger.imageSizeError'));
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert(t('messenger.imageFileError'));
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
        if ((!newMessage.trim() && !selectedImage) || !welderId || sending || selectedChat !== 'welder') return;

        setSending(true);
        try {
            if (selectedImage) {
                await sendMessageWithImage(welderId, newMessage.trim() || null, selectedImage);
                setSelectedImage(null);
                setImagePreview(null);
            } else {
                await sendMessage(welderId, newMessage.trim());
            }
            setNewMessage('');
            await loadConversation();
        } catch (error) {
            console.error('Failed to send message:', error);
            alert(t('messenger.failedToSendMessage'));
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

    const handleSendSupportMessage = async () => {
        if (!supportNewMessage.trim() || supportSending || selectedChat !== 'customer') return;

        const messageText = supportNewMessage.trim();
        
        // Check for navigation intent BEFORE sending message - try both methods
        let navRoute = extractNavigationIntent(messageText, products);
        
        // If extractNavigationIntent didn't find it, try direct route search
        if (!navRoute) {
            navRoute = findNavigationRoute(messageText, products);
        }
        
        // If navigation is detected, navigate immediately and STOP (don't send to AI)
        if (navRoute && navRoute.path) {
            // Clear input and close chat BEFORE navigation
            setSupportNewMessage('');
            setShowMessenger(false);
            
            // Check if route requires authentication
            if (navRoute.requiresAuth && (!authToken || !user)) {
                navigate('/login');
                // STOP HERE - don't send message to AI
                return;
            }
            
            // Navigate to the detected route
            navigate(navRoute.path);
            
            // STOP HERE - don't send message to AI when navigation is detected
            return;
        }

        // Only proceed with AI message if NO navigation intent was detected
        setSupportSending(true);
        try {
            await sendSupportMessage(messageText);
            setSupportNewMessage('');
            await loadSupportConversation();
        } catch (error) {
            console.error('Failed to send support message:', error);
            alert(t('messenger.failedToSendMessage'));
        } finally {
            setSupportSending(false);
        }
    };

    const handleSupportKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendSupportMessage();
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    return (
        <>
            {/* Chat Window - Fixed at bottom right */}
            {showMessenger && (
                <div 
                    className="position-fixed bg-white rounded shadow-lg"
                    style={{
                        width: '350px',
                        height: '500px',
                        zIndex: '9998',
                        right: '20px',
                        bottom: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #ddd'
                    }}
                >
                    {/* Chat Header */}
                    <div className="bg-primary text-white p-3 rounded-top d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">{t('messenger.messenger') || 'Messenger'}</h6>
                        <button 
                            className="btn btn-sm btn-link text-white p-0"
                            onClick={toggleMessenger}
                            style={{ textDecoration: 'none' }}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    {/* Chat Selection Screen - Show when no chat is selected */}
                    {!selectedChat ? (
                        <div className="flex-grow-1 overflow-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="text-center mb-4">
                                <h6 className="mb-2">{t('messenger.selectDepartment') || 'Select a Department'}</h6>
                                <p className="text-muted small mb-4">{t('messenger.pleaseSelectWho') || 'Please select who you would like to chat with'}</p>
                            </div>
                            
                            {/* Welder Option */}
                            <div 
                                className="d-flex align-items-center p-3 mb-3 border rounded"
                                onClick={() => selectChat('welder')}
                                style={{
                                    cursor: 'pointer', 
                                    transition: 'all 0.3s',
                                    backgroundColor: 'white'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3" 
                                    style={{width: '50px', height: '50px'}}>
                                    <i className="fas fa-hard-hat text-white fs-4"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-0">{t('messenger.welderSupport') || 'Chat with Welder'}</h6>
                                    <small className="text-muted">{t('messenger.technicalWeldingAssistance') || 'Technical welding assistance'}</small>
                                </div>
                                <i className="bi bi-chevron-right"></i>
                            </div>
                            
                            {/* Customer Support Option */}
                            <div 
                                className="d-flex align-items-center p-3 border rounded"
                                onClick={() => selectChat('customer')}
                                style={{
                                    cursor: 'pointer', 
                                    transition: 'all 0.3s',
                                    backgroundColor: 'white'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <div className="rounded-circle bg-success d-flex align-items-center justify-content-center me-3" 
                                    style={{width: '50px', height: '50px'}}>
                                    <i className="fas fa-headset text-white fs-4"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-0">{t('messenger.customerSupport') || 'Customer Support'}</h6>
                                    <small className="text-muted">{t('messenger.generalInquiriesHelp') || 'General inquiries and help'}</small>
                                </div>
                                <i className="bi bi-chevron-right"></i>
                            </div>
                        </div>
                    ) : (
                        /* Messages Area - Only show when a chat is selected */
                        <div className="flex-grow-1 overflow-auto p-3" style={{ backgroundColor: '#f8f9fa' }}>
                        {selectedChat === 'welder' ? (
                            <div>
                                {loading ? (
                                    <div className="text-center text-muted">{t('messenger.loadingConversation')}</div>
                                ) : (
                                    <>
                                        {messages.length === 0 ? (
                                            <div className="mb-3">
                                                <div className="bg-light p-2 rounded mb-2" style={{maxWidth: '80%'}}>
                                                    <small>
                                                        {t('messenger.startConversation') || 'Start a conversation with a welder!'}
                                                    </small>
                                                </div>
                                            </div>
                                        ) : (
                                            messages.map(message => (
                                                <div 
                                                    key={message.id}
                                                    className={`d-flex mb-2 ${
                                                        message.sender === 'customer' ? 'justify-content-end' : 'justify-content-start'
                                                    }`}
                                                >
                                                    <div 
                                                        className={`rounded p-2 ${
                                                            message.sender === 'customer' 
                                                                ? 'bg-primary text-white' 
                                                                : 'bg-light text-dark'
                                                        }`}
                                                        style={{ maxWidth: '80%', wordWrap: 'break-word' }}
                                                    >
                                                        {message.imageUrl && (
                                                            <div className="mb-1">
                                                                <img 
                                                                    src={message.imageUrl} 
                                                                    alt="Chat image" 
                                                                    style={{ 
                                                                        maxWidth: '100%', 
                                                                        maxHeight: '200px', 
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        display: 'block',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                    onClick={() => window.open(message.imageUrl, '_blank')}
                                                                />
                                                            </div>
                                                        )}
                                                        {message.text && (
                                                            <div className="mb-1">
                                                                <small style={{ whiteSpace: 'pre-wrap' }}>{message.text}</small>
                                                            </div>
                                                        )}
                                                        <small className={`d-block ${
                                                            message.sender === 'customer' ? 'text-white-50' : 'text-muted'
                                                        }`} style={{fontSize: '0.7rem'}}>
                                                            {formatTime(message.time)}
                                                        </small>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                        ) : (
                            <div>
                                {supportLoading ? (
                                    <div className="text-center text-muted">{t('messenger.loadingConversation')}</div>
                                ) : (
                                    <>
                                        {supportMessages.length === 0 ? (
                                            <div className="mb-3">
                                                <div className="bg-light p-2 rounded mb-2" style={{maxWidth: '80%'}}>
                                                    <small>
                                                        {t('messenger.hiThereAI') || 'Hi! I\'m your AI assistant. How can I help you today?'}
                                                    </small>
                                                </div>
                                            </div>
                                        ) : (
                                            supportMessages.map(message => (
                                                <div 
                                                    key={message.id}
                                                    className={`d-flex mb-2 ${
                                                        message.isFromUser ? 'justify-content-end' : 'justify-content-start'
                                                    }`}
                                                >
                                                    <div 
                                                        className={`rounded p-2 ${
                                                            message.isFromUser 
                                                                ? 'bg-primary text-white' 
                                                                : 'bg-light text-dark'
                                                        }`}
                                                        style={{ maxWidth: '80%', wordWrap: 'break-word' }}
                                                    >
                                                        <div className="mb-1">
                                                            <small style={{ whiteSpace: 'pre-wrap' }}>{message.message}</small>
                                                        </div>
                                                        <small className={`d-block ${
                                                            message.isFromUser ? 'text-white-50' : 'text-muted'
                                                        }`} style={{fontSize: '0.7rem'}}>
                                                            {formatTime(message.createdAt)}
                                                        </small>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={supportMessagesEndRef} />
                                    </>
                                )}
                            </div>
                        )}
                        </div>
                    )}

                    {/* Chat Input - Only show when department is selected */}
                    {selectedChat === 'welder' && welderId && (
                        <div className="p-3 border-top bg-white">
                            {imagePreview && (
                                <div className="mb-2 position-relative" style={{ display: 'inline-block' }}>
                                    <img 
                                        src={imagePreview} 
                                        alt="Preview" 
                                        style={{ 
                                            maxWidth: '100px', 
                                            maxHeight: '100px', 
                                            borderRadius: '4px',
                                            border: '1px solid #ddd'
                                        }}
                                    />
                                    <button 
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                        style={{ margin: '2px', padding: '2px 6px' }}
                                        onClick={removeImage}
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                </div>
                            )}
                            <div className="input-group">
                                <input 
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="chatImageInput"
                                    onChange={handleImageSelect}
                                />
                                <label 
                                    htmlFor="chatImageInput" 
                                    className="btn btn-outline-secondary btn-sm"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <i className="bi bi-image"></i>
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder={t('messenger.typeAMessage') || 'Type a message...'}
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
                                        <i className="bi bi-send"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                    {selectedChat === 'customer' && (
                        <div className="p-3 border-top bg-white">
                            <div className="input-group">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder={t('messenger.typeAMessage') || 'Type a message...'}
                                    value={supportNewMessage}
                                    onChange={(e) => setSupportNewMessage(e.target.value)}
                                    onKeyPress={handleSupportKeyPress}
                                    disabled={supportSending}
                                />
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleSendSupportMessage}
                                    disabled={supportSending || !supportNewMessage.trim()}
                                >
                                    {supportSending ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <i className="bi bi-send"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Chat Button - Fixed at bottom right */}
            {!showMessenger && (
                <button
                    onClick={toggleMessenger}
                    className="btn btn-primary rounded-circle shadow-lg"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#0084ff',
                        borderColor: '#0084ff',
                        zIndex: '9999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        border: 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    data-bs-title={t('footer.messageUsOnMessenger') || 'Chat with us'}
                >
                    <i className="fab fa-facebook-messenger fs-4 text-white"></i>
                </button>
            )}
        </>
    );
};

export default ChatWidget;
