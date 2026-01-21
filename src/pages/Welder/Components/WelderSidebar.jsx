// components/welder/WelderSidebar.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { getUserDetailsById } from '../../../services/authService';

const WelderSidebar = ({ activePage, onPageChange, collapsed }) => {
    const { user } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const [welderDetails, setWelderDetails] = useState(null);
    const [imageError, setImageError] = useState(false);

    // Get welder name from user context
    const welderName = user?.name || user?.fullName || user?.email?.split('@')[0] || 'Welder';
    
    // Fetch profile details when component mounts or user changes
    useEffect(() => {
        const fetchProfileData = async () => {
            if (user && user.id) {
                try {
                    const profileData = await getUserDetailsById(user.id);
                    setWelderDetails(profileData);
                    setImageError(false); // Reset image error when fetching new data
                    if (profileData && profileData.profileImage) {
                        setProfileImage(profileData.profileImage);
                    } else {
                        setProfileImage(null);
                    }
                } catch (error) {
                    console.error('Failed to fetch profile data:', error);
                    setProfileImage(null);
                }
            }
        };
        fetchProfileData();

        // Listen for profile update events
        const handleProfileUpdate = () => {
            fetchProfileData();
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [user]);

    // Get initials for profile circle
    const getInitials = () => {
        const name = welderDetails?.fullName || welderName;
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };
    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'fas fa-tachometer-alt',
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: 'fas fa-tasks',
        },
        {
            id: 'completed-tasks',
            label: 'Overall Completed',
            icon: 'fas fa-check-circle',
        },
        {
            id: 'customer-chat',
            label: 'Customer Chat',
            icon: 'fas fa-comments',
        },
        {
            id: 'materials',
            label: 'Materials',
            icon: 'fas fa-boxes',
        },
    ];

    return (
        <aside className="bg-white border-end shadow-sm fixed-top" 
               style={{ 
                   width: collapsed ? '80px' : '250px',
                   height: '100vh',
                   top: '73px',
                   transition: 'width 0.3s ease',
                   zIndex: 1020
               }}>
            {/* Profile Summary */}
            {!collapsed && (
                <div className="p-2 border-bottom text-center">
                    {profileImage && !imageError ? (
                        <img
                            src={profileImage}
                            alt={welderName}
                            className="rounded-circle mb-2"
                            style={{ width: '60px', height: '60px', objectFit: 'cover', border: '2px solid #0d6efd' }}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                             style={{ width: '60px', height: '60px', fontSize: '24px', fontWeight: 'bold' }}>
                            {getInitials()}
                        </div>
                    )}
                    <h6 className="mb-1" style={{ wordBreak: 'break-word' }}>
                        {welderDetails?.fullName || welderName}
                    </h6>
                    <small className="text-muted">
                        {welderDetails?.skills ? 
                            (welderDetails.skills.split(',')[0].trim() || 'Welding Specialist') : 
                            'Welding Specialist'}
                    </small>
                </div>
            )}

            {/* Navigation Menu */}
            <nav className="p-2">
                <ul className="nav nav-pills flex-column">
                    {menuItems.map(item => (
                        <li key={item.id} className="nav-item mb-2">
                            <button
                                className={`nav-link w-100 text-start d-flex align-items-center ${
                                    activePage === item.id ? 'active' : ''
                                }`}
                                onClick={() => onPageChange(item.id)}
                                style={{ 
                                    borderRadius: '8px',
                                    padding: '10px 14px'
                                }}
                            >
                                <i className={`${item.icon} me-3`} style={{ width: '20px' }}></i>
                                {!collapsed && (
                                    <>
                                        <span className="flex-grow-1">{item.label}</span>
                                    </>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Quick Stats - Only show when not collapsed */}
                {/* {!collapsed && (
                    <div className="mt-4 p-3 bg-light rounded">
                        <h6 className="small text-uppercase text-muted mb-3">Quick Stats</h6>
                        <div className="row text-center">
                            <div className="col-6 mb-2">
                                <div className="text-primary fw-bold">5</div>
                                <small className="text-muted">New Orders</small>
                            </div>
                            <div className="col-6 mb-2">
                                <div className="text-warning fw-bold">3</div>
                                <small className="text-muted">In Progress</small>
                            </div>
                            <div className="col-6 mb-2">
                                <div className="text-success fw-bold">2</div>
                                <small className="text-muted">Ready</small>
                            </div>
                            <div className="col-6 mb-2">
                                <div className="text-info fw-bold">47</div>
                                <small className="text-muted">Completed</small>
                            </div>
                        </div>
                    </div>
                )} */}
            </nav>
        </aside>
    );
};

export default WelderSidebar;