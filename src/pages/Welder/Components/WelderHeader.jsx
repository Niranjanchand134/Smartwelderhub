// components/welder/WelderHeader.js
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserDetailsById } from '../../../services/authService';

const WelderHeader = ({ onToggleSidebar, sidebarCollapsed, onNavigate }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const profileDropdownRef = useRef(null);
    
    // Get welder name from user context, fallback to email or default
    const welderName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'Welder';

    // Fetch profile image when component mounts or user changes
    useEffect(() => {
        const fetchProfileImage = async () => {
            if (user && user.id) {
                try {
                    const profileData = await getUserDetailsById(user.id);
                    if (profileData && profileData.profileImage) {
                        setProfileImage(profileData.profileImage);
                    } else {
                        setProfileImage(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch profile image:', error);
                    setProfileImage(null);
                }
            }
        };
        fetchProfileImage();

        // Listen for profile update events
        const handleProfileUpdate = () => {
            fetchProfileImage();
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [user]);
    
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
        return 'W';
    };
    
    const welderData = {
        name: welderName,
        status: "Available",
        notificationCount: 5,
        unreadMessages: 7
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        if (profileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileOpen]);

    return (
        <header className="navbar navbar-expand navbar-light bg-white border-bottom shadow-sm fixed-top" 
                style={{ zIndex: 1030, height: '73px' }}>
            <div className="container-fluid">
                {/* Left Section */}
                <div className="d-flex align-items-center">
                    
                    
                    <span className="navbar-brand mb-0 h6 ms-3 d-none d-md-block">
                        <i className="fas fa-tools text-primary me-2"></i>
                        Welder Panel
                    </span>
                    
                    <button 
                        className="btn btn-link text-dark"
                        onClick={onToggleSidebar}
                    >
                        <i className={`fas ${sidebarCollapsed ? 'fa-bars' : 'fa-chevron-left'}`}></i>
                    </button>
                </div>

                {/* Center Section - Status & Stats */}
                {/* <div className="d-flex align-items-center mx-auto">
                    <div className="d-flex align-items-center">
                        <span className={`badge ${welderData.status === 'Available' ? 'bg-success' : 'bg-warning'} me-2`}>
                            <i className="fas fa-circle me-1" style={{ fontSize: '6px' }}></i>
                            {welderData.status}
                        </span>
                        <small className="text-muted d-none d-lg-block">
                            Welcome back, {welderData.name}
                        </small>
                    </div>
                </div> */}

                {/* Right Section */}
                <div className="d-flex align-items-center">
                    {/* Notifications */}
                    <div className="dropdown me-3">
                        <button className="btn btn-link text-dark position-relative" 
                                data-bs-toggle="dropdown">
                            <i className="fas fa-bell"></i>
                            {welderData.notificationCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {welderData.notificationCount}
                                </span>
                            )}
                        </button>
                        <div className="dropdown-menu dropdown-menu-end" style={{ width: '300px' }}>
                            <h6 className="dropdown-header">Notifications</h6>
                            <a className="dropdown-item d-flex align-items-center" href="#">
                                <div className="bg-primary rounded-circle p-2 me-2">
                                    <i className="fas fa-tools text-white"></i>
                                </div>
                                <div>
                                    <small className="d-block">New job assigned</small>
                                    <small className="text-muted">Custom Gate - John Sharma</small>
                                </div>
                            </a>
                            <a className="dropdown-item d-flex align-items-center" href="#">
                                <div className="bg-success rounded-circle p-2 me-2">
                                    <i className="fas fa-rupee-sign text-white"></i>
                                </div>
                                <div>
                                    <small className="d-block">Payment received</small>
                                    <small className="text-muted">Rs. 25,000 from Sita Rai</small>
                                </div>
                            </a>
                            <a className="dropdown-item d-flex align-items-center" href="#">
                                <div className="bg-info rounded-circle p-2 me-2">
                                    <i className="fas fa-robot text-white"></i>
                                </div>
                                <div>
                                    <small className="d-block">AI Design Suggestion</small>
                                    <small className="text-muted">3 new optimizations available</small>
                                </div>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item text-center small text-primary" href="#">
                                View All Notifications
                            </a>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="dropdown me-3">
                        <button className="btn btn-link text-dark position-relative" 
                                data-bs-toggle="dropdown">
                            <i className="fas fa-comments"></i>
                            {welderData.unreadMessages > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                                    {welderData.unreadMessages}
                                </span>
                            )}
                        </button>
                        <div className="dropdown-menu dropdown-menu-end" style={{ width: '300px' }}>
                            <h6 className="dropdown-header">Messages</h6>
                            <a className="dropdown-item d-flex align-items-center" href="#">
                                <div className="bg-warning rounded-circle p-2 me-2">
                                    <i className="fas fa-user text-white"></i>
                                </div>
                                <div>
                                    <small className="d-block">John Sharma</small>
                                    <small className="text-muted">Can we add decorative elements?</small>
                                </div>
                                <span className="badge bg-primary ms-2">New</span>
                            </a>
                            <a className="dropdown-item d-flex align-items-center" href="#">
                                <div className="bg-success rounded-circle p-2 me-2">
                                    <i className="fas fa-user text-white"></i>
                                </div>
                                <div>
                                    <small className="d-block">Sita Rai</small>
                                    <small className="text-muted">When will my grill be ready?</small>
                                </div>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item text-center small text-primary" href="#">
                                View All Messages
                            </a>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="dropdown" ref={profileDropdownRef}>
                        <button 
                            className="btn btn-link text-dark text-decoration-none d-flex align-items-center p-2" 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setProfileOpen(!profileOpen);
                            }}
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={welderName}
                                    className="rounded-circle"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', border: '2px solid #0d6efd' }}
                                />
                            ) : (
                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                                     style={{ width: '40px', height: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                                    {getInitials()}
                                </div>
                            )}
                            <i className="fas fa-chevron-down ms-2 text-muted"></i>
                        </button>
                        {profileOpen && (
                            <div className="dropdown-menu show" style={{ display: 'block', right: 0, left: 'auto' }}>
                                <div className="dropdown-header d-flex align-items-center">
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt={welderData.name}
                                            className="rounded-circle me-2"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                             style={{ width: '40px', height: '40px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {getInitials()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="fw-bold">{welderData.name}</div>
                                        <small className="text-muted">{user?.email || 'Welder Account'}</small>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => {
                                        setProfileOpen(false);
                                        if (onNavigate) {
                                            onNavigate('profile');
                                        }
                                    }}
                                    style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                                >
                                    <i className="fas fa-user me-2"></i>Profile
                                </button>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => setProfileOpen(false)}
                                    style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                                >
                                    <i className="fas fa-cog me-2"></i>Settings
                                </button>
                                <button 
                                    className="dropdown-item" 
                                    onClick={() => setProfileOpen(false)}
                                    style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                                >
                                    <i className="fas fa-bell me-2"></i>Notifications
                                </button>
                                <div className="dropdown-divider"></div>
                                <a className="dropdown-item" href="#">
                                    <i className="fas fa-question-circle me-2"></i>Help & Support
                                </a>
                                <div className="dropdown-divider"></div>
                                <button 
                                    className="dropdown-item text-danger" 
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
        </header>
    );
};

export default WelderHeader;