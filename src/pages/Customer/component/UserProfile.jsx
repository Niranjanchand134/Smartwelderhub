import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { getUserDetailsById, updateUserProfile } from '../../../services/authService';
import { getAllOrders } from '../../../services/orderService';
import { getAllCustomOrders } from '../../../services/customOrderService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';
import Header from './Header';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [customOrders, setCustomOrders] = useState([]);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        profileImage: null
    });

    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalCustomOrders: 0,
        pendingCustomOrders: 0,
        completedCustomOrders: 0
    });

    useEffect(() => {
        if (user && user.id) {
            fetchUserProfile();
            fetchOrders();
            fetchCustomOrders();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserDetailsById(user.id);
            setUserProfile(data);
            
            setFormData({
                fullName: data.fullName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                profileImage: data.profileImage || null
            });
        } catch (error) {
            ErrorMessageToast(error.message || t('userProfile.failedToLoadProfile'));
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        // Only fetch if user is logged in
        if (!user || !user.id || !user.email) {
            setOrders([]);
            setOrderStats(prev => ({
                ...prev,
                totalOrders: 0,
                pendingOrders: 0,
                completedOrders: 0
            }));
            return;
        }

        try {
            const data = await getAllOrders();
            
            // Filter orders to only show current user's orders by matching customerEmail
            const userOrders = (data || []).filter(order => {
                if (!order.customerEmail || !user.email) {
                    return false;
                }
                // Case-insensitive email matching
                return order.customerEmail.toLowerCase().trim() === user.email.toLowerCase().trim();
            });
            
            setOrders(userOrders);
            
            // Calculate stats from filtered orders
            const total = userOrders.length;
            const pending = userOrders.filter(o => 
                o.status === 'PENDING' || o.status === 'PROCESSING'
            ).length;
            const completed = userOrders.filter(o => 
                o.status === 'COMPLETED' || o.status === 'DELIVERED'
            ).length;
            
            setOrderStats(prev => ({
                ...prev,
                totalOrders: total,
                pendingOrders: pending,
                completedOrders: completed
            }));
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setOrders([]);
        }
    };

    const fetchCustomOrders = async () => {
        // Only fetch if user is logged in
        if (!user || !user.id) {
            setCustomOrders([]);
            setOrderStats(prev => ({
                ...prev,
                totalCustomOrders: 0,
                pendingCustomOrders: 0,
                completedCustomOrders: 0
            }));
            return;
        }

        try {
            const data = await getAllCustomOrders();
            
            // Filter orders to only show current user's orders by customerId or customerName (for old orders)
            const userCustomOrders = (data || []).filter(order => {
                // Primary: Match by customerId (for new orders)
                if (order.customerId && user.id) {
                    return order.customerId === user.id;
                }
                
                // Fallback: Match by customerName for old orders (when customerId is null)
                if (!order.customerId && order.customerName) {
                    // Try matching with user.name
                    if (user.name && order.customerName.trim().toLowerCase() === user.name.trim().toLowerCase()) {
                        return true;
                    }
                    // Try matching with user.fullName
                    if (user.fullName && order.customerName.trim().toLowerCase() === user.fullName.trim().toLowerCase()) {
                        return true;
                    }
                }
                
                return false;
            });
            
            setCustomOrders(userCustomOrders);
            
            // Calculate custom order stats from filtered orders
            const total = userCustomOrders.length;
            const pending = userCustomOrders.filter(o => 
                o.status === 'PENDING' || o.status === 'IN_PROGRESS'
            ).length;
            const completed = userCustomOrders.filter(o => 
                o.status === 'CLOSED' || o.status === 'CONFIRMED_BY_CUSTOMER'
            ).length;
            
            setOrderStats(prev => ({
                ...prev,
                totalCustomOrders: total,
                pendingCustomOrders: pending,
                completedCustomOrders: completed
            }));
        } catch (error) {
            console.error('Failed to fetch custom orders:', error);
            setCustomOrders([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            ErrorMessageToast(t('userProfile.pleaseSelectImage'));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            ErrorMessageToast(t('userProfile.imageSizeLimit'));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result;
            setFormData(prev => ({
                ...prev,
                profileImage: base64Image
            }));
        };
        reader.readAsDataURL(file);
    };

    const removeProfileImage = () => {
        setFormData(prev => ({
            ...prev,
            profileImage: null
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                profileImage: formData.profileImage || null
            };

            await updateUserProfile(user.id, updateData);
            SuccesfulMessageToast(t('userProfile.profileUpdatedSuccessfully'));
            setIsEditing(false);
            await fetchUserProfile();
            
            // Dispatch event to notify header to refresh profile image
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (error) {
            ErrorMessageToast(error.message || t('userProfile.failedToUpdateProfile'));
        }
    };

    const handleCancel = () => {
        if (userProfile) {
            setFormData({
                fullName: userProfile.fullName || '',
                email: userProfile.email || '',
                phoneNumber: userProfile.phoneNumber || '',
                profileImage: userProfile.profileImage || null
            });
        }
        setIsEditing(false);
    };

    const getInitials = () => {
        if (formData.fullName) {
            const parts = formData.fullName.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            }
            return formData.fullName.charAt(0).toUpperCase();
        }
        if (formData.email) {
            return formData.email.substring(0, 2).toUpperCase();
        }
        return 'U';
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container-fluid py-5">
                    <div className="container text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">{t('userProfile.loadingProfile') || 'Loading profile...'}</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!userProfile) {
        return (
            <>
                <Header />
                <div className="container-fluid py-5">
                    <div className="container text-center py-5">
                        <h5>{t('userProfile.profileNotFound') || 'Profile not found'}</h5>
                        <p className="text-muted">{t('userProfile.unableToLoadProfile') || 'Unable to load your profile information.'}</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            
            {/* Page Header Start */}
            <div className="container-fluid page-header pt-5 mb-6 wow fadeIn" data-wow-delay="0.1s">
                <div className="container text-center pt-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <div className="bg-white p-5">
                                <h1 className="display-6 text-uppercase mb-3 animated slideInDown">{t('userProfile.myProfile') || 'My Profile'}</h1>
                                <nav aria-label="breadcrumb animated slideInDown">
                                    <ol className="breadcrumb justify-content-center mb-0">
                                        <li className="breadcrumb-item"><a href="/">{t('common.home')}</a></li>
                                        <li className="breadcrumb-item"><a href="#">{t('common.pages')}</a></li>
                                        <li className="breadcrumb-item" aria-current="page">{t('userProfile.myProfile') || 'My Profile'}</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Page Header End */}

            <div className="container-fluid py-5">
                <div className="container">
                    {/* Profile Header */}
                    <div className="row mb-5">
                        <div className="col-12">
                            <div className="card shadow-sm border-0">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <div className="me-4">
                                                {formData.profileImage ? (
                                                    <img 
                                                        src={formData.profileImage} 
                                                        alt="Profile" 
                                                        className="rounded-circle"
                                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div 
                                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                        style={{ width: '100px', height: '100px', fontSize: '2.5rem', fontWeight: 'bold' }}
                                                    >
                                                        {getInitials()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="mb-1">{formData.fullName || 'User'}</h3>
                                                <p className="text-muted mb-1"><i className="fa fa-envelope me-2"></i>{formData.email}</p>
                                                {formData.phoneNumber && (
                                                    <p className="text-muted mb-0"><i className="fa fa-phone me-2"></i>{formData.phoneNumber}</p>
                                                )}
                                                <span className="badge bg-primary mt-2">{userProfile.role || 'USER'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            {!isEditing ? (
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    <i className="fas fa-edit me-2"></i>{t('userProfile.editProfile')}
                                                </button>
                                            ) : (
                                                <div>
                                                    <button 
                                                        className="btn btn-success me-2"
                                                        onClick={handleSubmit}
                                                    >
                                                        <i className="fas fa-save me-2"></i>{t('userProfile.saveChanges')}
                                                    </button>
                                                    <button 
                                                        className="btn btn-secondary"
                                                        onClick={handleCancel}
                                                    >
                                                        <i className="fas fa-times me-2"></i>{t('userProfile.cancel')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {/* Left Column - Profile Information */}
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0"><i className="fas fa-user me-2"></i>{t('userProfile.profileInformation') || 'Profile Information'}</h5>
                                </div>
                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">{t('userProfile.fullName')}</label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                ) : (
                                                    <p className="form-control-plaintext">{formData.fullName || (t('userProfile.notSet') || 'Not set')}</p>
                                                )}
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">{t('userProfile.email')}</label>
                                                <p className="form-control-plaintext">{formData.email}</p>
                                                <small className="text-muted">{t('userProfile.emailCannotBeChanged') || 'Email cannot be changed'}</small>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold">{t('userProfile.phoneNumber')}</label>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        name="phoneNumber"
                                                        value={formData.phoneNumber}
                                                        onChange={handleInputChange}
                                                    />
                                                ) : (
                                                    <p className="form-control-plaintext">{formData.phoneNumber || (t('userProfile.notSet') || 'Not set')}</p>
                                                )}
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-bold">{t('userProfile.profileImage')}</label>
                                                {isEditing ? (
                                                    <div>
                                                        {formData.profileImage ? (
                                                            <div className="mb-3 position-relative d-inline-block">
                                                                <img 
                                                                    src={formData.profileImage} 
                                                                    alt="Profile" 
                                                                    className="img-thumbnail"
                                                                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                                    onClick={removeProfileImage}
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <p className="small mb-2 text-muted">{t('userProfile.noProfileImage') || 'No profile image'}</p>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            accept="image/*"
                                                            onChange={handleProfileImageUpload}
                                                        />
                                                        <small className="text-muted">{t('userProfile.imageUploadHint') || 'Max size: 5MB. Recommended: Square image (200x200px)'}</small>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        {formData.profileImage ? (
                                                            <img 
                                                                src={formData.profileImage} 
                                                                alt="Profile" 
                                                                className="img-thumbnail"
                                                                style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                            />
                                                        ) : (
                                                            <p className="text-muted">{t('userProfile.noProfileImageUploaded') || 'No profile image uploaded'}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Order Statistics */}
                            <div className="card shadow-sm border-0">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0"><i className="fas fa-chart-bar me-2"></i>{t('userProfile.orderStatistics') || 'Order Statistics'}</h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="text-center p-3 bg-light rounded">
                                                <h3 className="text-primary mb-1">{orderStats.totalOrders}</h3>
                                                <p className="mb-0 text-muted">{t('userProfile.totalOrders')}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="text-center p-3 bg-light rounded">
                                                <h3 className="text-warning mb-1">{orderStats.pendingOrders}</h3>
                                                <p className="mb-0 text-muted">{t('userProfile.pendingOrders')}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="text-center p-3 bg-light rounded">
                                                <h3 className="text-success mb-1">{orderStats.completedOrders}</h3>
                                                <p className="mb-0 text-muted">{t('userProfile.completedOrders')}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="text-center p-3 bg-light rounded">
                                                <h3 className="text-info mb-1">{orderStats.totalCustomOrders}</h3>
                                                <p className="mb-0 text-muted">{t('userProfile.customOrders')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Account Info & Quick Actions */}
                        <div className="col-lg-4">
                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0"><i className="fas fa-info-circle me-2"></i>{t('userProfile.accountInformation') || 'Account Information'}</h5>
                                </div>
                                <div className="card-body p-4">
                                    <div className="mb-3">
                                        <small className="text-muted d-block">{t('userProfile.accountStatus') || 'Account Status'}</small>
                                        <span className="badge bg-success">{t('userProfile.active') || 'Active'}</span>
                                    </div>
                                    {userProfile.createdAt && (
                                        <div className="mb-3">
                                            <small className="text-muted d-block">{t('userProfile.memberSince') || 'Member Since'}</small>
                                            <p className="mb-0">{new Date(userProfile.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {userProfile.lastLogin && (
                                        <div className="mb-3">
                                            <small className="text-muted d-block">{t('userProfile.lastLogin') || 'Last Login'}</small>
                                            <p className="mb-0">{new Date(userProfile.lastLogin).toLocaleString()}</p>
                                        </div>
                                    )}
                                    <div>
                                        <small className="text-muted d-block">{t('userProfile.role') || 'Role'}</small>
                                        <span className="badge bg-primary">{userProfile.role || 'USER'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 mb-4">
                                <div className="card-header bg-primary text-white">
                                    <h5 className="mb-0"><i className="fas fa-bolt me-2"></i>{t('userProfile.quickActions') || 'Quick Actions'}</h5>
                                </div>
                                <div className="card-body p-3">
                                    <div className="d-grid gap-2">
                                        <a href="/products" className="btn btn-outline-primary">
                                            <i className="fas fa-shopping-bag me-2"></i>{t('userProfile.browseProducts') || 'Browse Products'}
                                        </a>
                                        <a href="/cart" className="btn btn-outline-primary">
                                            <i className="fas fa-shopping-cart me-2"></i>{t('userProfile.viewCart') || 'View Cart'}
                                        </a>
                                        <a href="/custom-product-order" className="btn btn-outline-primary">
                                            <i className="fas fa-hammer me-2"></i>{t('userProfile.customOrder') || 'Custom Order'}
                                        </a>
                                        <a href="/Contactus" className="btn btn-outline-primary">
                                            <i className="fas fa-headset me-2"></i>{t('userProfile.contactSupport') || 'Contact Support'}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="card shadow-sm border-0 border-danger">
                                <div className="card-header bg-danger text-white">
                                    <h5 className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>{t('userProfile.dangerZone') || 'Danger Zone'}</h5>
                                </div>
                                <div className="card-body p-3">
                                    <button 
                                        className="btn btn-outline-danger w-100"
                                        onClick={() => {
                                            if (window.confirm(t('userProfile.confirmLogout') || 'Are you sure you want to logout?')) {
                                                logout();
                                                navigate('/login');
                                            }
                                        }}
                                    >
                                        <i className="fas fa-sign-out-alt me-2"></i>{t('common.logout')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders Section */}
                    {(orders.length > 0 || customOrders.length > 0) && (
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-primary text-white">
                                        <h5 className="mb-0"><i className="fas fa-list me-2"></i>{t('userProfile.recentOrders') || 'Recent Orders'}</h5>
                                    </div>
                                    <div className="card-body p-4">
                                        {orders.length > 0 && (
                                            <div className="mb-4">
                                                <h6 className="mb-3">{t('userProfile.productOrders') || 'Product Orders'}</h6>
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>{t('userProfile.orderId') || 'Order ID'}</th>
                                                                <th>{t('userProfile.date') || 'Date'}</th>
                                                                <th>{t('userProfile.status')}</th>
                                                                <th>{t('userProfile.total')}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {orders.slice(0, 5).map((order) => (
                                                                <tr key={order.id}>
                                                                    <td>#{order.id}</td>
                                                                    <td>{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</td>
                                                                    <td>
                                                                        <span className={`badge ${
                                                                            order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'bg-success' :
                                                                            order.status === 'PENDING' || order.status === 'PROCESSING' ? 'bg-warning' :
                                                                            'bg-secondary'
                                                                        }`}>
                                                                            {order.status}
                                                                        </span>
                                                                    </td>
                                                                    <td>Rs. {order.totalAmount || '0.00'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {customOrders.length > 0 && (
                                            <div>
                                                <h6 className="mb-3">{t('userProfile.customOrders')}</h6>
                                                <div className="table-responsive">
                                                    <table className="table table-hover">
                                                        <thead>
                                                            <tr>
                                                                <th>{t('userProfile.orderId') || 'Order ID'}</th>
                                                                <th>{t('userProfile.date') || 'Date'}</th>
                                                                <th>{t('userProfile.status')}</th>
                                                                <th>{t('userProfile.description') || 'Description'}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {customOrders.slice(0, 5).map((order) => (
                                                                <tr key={order.id}>
                                                                    <td>#{order.id}</td>
                                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                                    <td>
                                                                        <span className={`badge ${
                                                                            order.status === 'CLOSED' || order.status === 'CONFIRMED_BY_CUSTOMER' ? 'bg-success' :
                                                                            order.status === 'IN_PROGRESS' ? 'bg-warning' :
                                                                            'bg-secondary'
                                                                        }`}>
                                                                            {order.status}
                                                                        </span>
                                                                    </td>
                                                                    <td>{order.description?.substring(0, 50) || 'N/A'}...</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
};

export default UserProfile;
