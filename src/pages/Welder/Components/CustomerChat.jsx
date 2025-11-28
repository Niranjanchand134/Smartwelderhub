// components/welder/pages/CustomerChat.js
import React, { useState } from 'react';

const CustomerChat = () => {
    const [activeChat, setActiveChat] = useState(1);

    const conversations = [
        {
            id: 1,
            customer: 'John Sharma',
            lastMessage: 'Can we add decorative elements?',
            time: '2 hours ago',
            unread: true,
            messages: [
                { id: 1, text: 'Hi, I want to discuss my gate design', sender: 'customer', time: '10:00 AM' },
                { id: 2, text: 'Sure John, what would you like to modify?', sender: 'welder', time: '10:05 AM' },
                { id: 3, text: 'Can we add some decorative elements to the gate design?', sender: 'customer', time: '10:30 AM' }
            ]
        },
        {
            id: 2,
            customer: 'Sita Rai',
            lastMessage: 'When will my grill be ready?',
            time: '5 hours ago',
            unread: false,
            messages: [
                { id: 1, text: 'Hello, when will my window grill be ready?', sender: 'customer', time: '9:00 AM' },
                { id: 2, text: 'It will be ready by tomorrow afternoon', sender: 'welder', time: '9:15 AM' }
            ]
        }
    ];

    const [newMessage, setNewMessage] = useState('');

    const activeConversation = conversations.find(chat => chat.id === activeChat);

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Customer Chat</h1>
                <span className="badge bg-primary">7 Unread Messages</span>
            </div>

            <div className="row">
                {/* Conversations List */}
                <div className="col-lg-4">
                    <div className="card shadow">
                        <div className="card-header bg-white">
                            <h6 className="m-0 font-weight-bold text-primary">Conversations</h6>
                        </div>
                        <div className="card-body p-0">
                            {conversations.map(chat => (
                                <div 
                                    key={chat.id}
                                    className={`p-3 border-bottom cursor-pointer ${
                                        activeChat === chat.id ? 'bg-light' : ''
                                    }`}
                                    onClick={() => setActiveChat(chat.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="mb-1">{chat.customer}</h6>
                                            <p className="mb-1 text-muted small">{chat.lastMessage}</p>
                                            <small className="text-muted">{chat.time}</small>
                                        </div>
                                        {chat.unread && <span className="badge bg-primary">New</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-primary">
                                Chat with {activeConversation?.customer}
                            </h6>
                            <div className="btn-group">
                                <button className="btn btn-sm btn-outline-primary">
                                    <i className="fas fa-phone"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-success">
                                    <i className="fas fa-info-circle"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body" style={{ height: '400px', overflowY: 'auto' }}>
                            {activeConversation?.messages.map(message => (
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
                                        <p className="mb-1">{message.text}</p>
                                        <small className={`${
                                            message.sender === 'customer' ? 'text-muted' : 'text-white-50'
                                        }`}>
                                            {message.time}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="card-footer">
                            <div className="input-group">
                                <input 
                                    type="text"
                                    className="form-control"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button className="btn btn-primary">
                                    <i className="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerChat;