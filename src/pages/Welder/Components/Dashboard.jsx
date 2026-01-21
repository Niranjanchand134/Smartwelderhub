// components/welder/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { getWelderDashboard } from '../../../services/customOrderService';
import { ErrorMessageToast } from '../../../utils/Tostify.util';

const Dashboard = ({ onViewJob, onNavigate }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        {
            title: 'New Orders',
            value: '0',
            icon: 'fas fa-inbox',
            color: 'primary',
            change: '',
            onClick: () => onNavigate('orders')
        },
        {
            title: 'Orders in Progress',
            value: '0',
            icon: 'fas fa-hammer',
            color: 'warning',
            change: '',
            onClick: () => onNavigate('orders')
        },
    ]);
    const [recentOrders, setRecentOrders] = useState({
        new: [],
        inProgress: []
    });
    const [materialRequirements, setMaterialRequirements] = useState([]);

    useEffect(() => {
        if (user && user.id) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await getWelderDashboard(user.id);
            
            // Update stats
            setStats([
                {
                    title: 'New Orders',
                    value: data.stats?.newOrders?.toString() || '0',
                    icon: 'fas fa-inbox',
                    color: 'primary',
                    change: '',
                    onClick: () => onNavigate('orders')
                },
                {
                    title: 'Orders in Progress',
                    value: data.stats?.inProgress?.toString() || '0',
                    icon: 'fas fa-hammer',
                    color: 'warning',
                    change: '',
                    onClick: () => onNavigate('orders')
                },
            ]);

            // Format recent orders
            const formatTimeAgo = (dateString) => {
                if (!dateString) return 'Recently';
                const date = new Date(dateString);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 60) return `${diffMins} minutes ago`;
                if (diffHours < 24) return `${diffHours} hours ago`;
                return `${diffDays} days ago`;
            };

            setRecentOrders({
                new: (data.newOrders || []).map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    customer: order.customer || 'Unknown',
                    product: order.product || 'Custom Product',
                    time: formatTimeAgo(order.createdAt)
                })),
                inProgress: (data.inProgressOrders || []).map(order => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    customer: order.customer || 'Unknown',
                    product: order.product || 'Custom Product',
                    progress: order.progress || 0
                }))
            });

            // Material requirements from backend
            setMaterialRequirements(data.materialRequirements || []);
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewJob = (order) => {
        onViewJob(order);
        onNavigate('job-details');
    };

    const handleAcceptOrder = (orderId) => {
        // TODO: Implement accept order functionality
        console.log('Accept order:', orderId);
    };

    const handleRejectOrder = (orderId) => {
        // TODO: Implement reject order functionality
        console.log('Reject order:', orderId);
    };

    const handleUpdateProgress = (orderId) => {
        const order = recentOrders.inProgress.find(o => o.id === orderId);
        if (order) {
            onViewJob(order);
            onNavigate('orders');
        }
    };

    const handleMarkComplete = (orderId) => {
        // TODO: Implement mark complete functionality
        console.log('Mark complete:', orderId);
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Welder Dashboard</h1>
                <div className="btn-group">
                    <button className="btn btn-outline-primary" onClick={fetchDashboardData}>
                        <i className="fas fa-sync-alt me-2"></i>Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row">
                {stats.map((stat, index) => (
                    <div key={index} className="col-xl-6 col-md-6 mb-4">
                        <div 
                            className={`card border-left-${stat.color} shadow h-100 py-2 cursor-pointer`}
                            onClick={stat.onClick}
                            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className={`text-xs font-weight-bold text-${stat.color} text-uppercase mb-1`}>
                                            {stat.title}
                                        </div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                                            {stat.value}
                                        </div>
                                        <div className="text-success small font-weight-bold">
                                            {stat.change}
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className={`${stat.icon} fa-2x text-gray-300`}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Row */}
            <div className="row">
                {/* Left Column - Orders Overview */}
                <div className="col-lg-6">
                    {/* New Orders */}
                    <div className="card shadow mb-4">
                        <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold">
                                <i className="fas fa-inbox me-2"></i>
                                New Orders (Pending)
                            </h6>
                            <span className="badge bg-light text-primary">{recentOrders.new.length}</span>
                        </div>
                        <div className="card-body">
                            {recentOrders.new.length === 0 ? (
                                <p className="text-muted text-center mb-0">No new orders</p>
                            ) : (
                                <>
                                    {recentOrders.new.map(order => (
                                        <div key={order.id} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                            <div style={{ cursor: 'pointer' }} onClick={() => handleViewJob(order)}>
                                                <h6 className="mb-1">#{order.orderNumber || order.id} - {order.product}</h6>
                                                <small className="text-muted">Customer: {order.customer}</small>
                                                <br/>
                                                <small className="text-muted">{order.time}</small>
                                            </div>
                                            <div>
                                                <button 
                                                    className="btn btn-success btn-sm me-1"
                                                    onClick={() => handleAcceptOrder(order.id)}
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRejectOrder(order.id)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        className="btn btn-outline-primary btn-sm w-100 mt-2"
                                        onClick={() => onNavigate('orders')}
                                    >
                                        View All New Orders
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    {/* Orders in Progress */}
                    <div className="card shadow mb-4">
                        <div className="card-header bg-warning text-dark py-3">
                            <h6 className="m-0 font-weight-bold">
                                <i className="fas fa-hammer me-2"></i>
                                Orders in Progress
                            </h6>
                        </div>
                        <div className="card-body">
                            {recentOrders.inProgress.length === 0 ? (
                                <p className="text-muted text-center mb-0">No orders in progress</p>
                            ) : (
                                recentOrders.inProgress.map(order => (
                                    <div key={order.id} className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <h6 
                                                className="mb-0" 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleViewJob(order)}
                                            >
                                                #{order.orderNumber || order.id} - {order.product}
                                            </h6>
                                            <span className="badge bg-primary">{order.progress}%</span>
                                        </div>
                                        <div className="progress mb-2">
                                            <div 
                                                className="progress-bar progress-bar-striped progress-bar-animated" 
                                                style={{width: `${order.progress}%`}}
                                            >
                                                {order.progress}%
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button 
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => handleUpdateProgress(order.id)}
                                            >
                                                Update Progress
                                            </button>
                                            <button 
                                                className="btn btn-outline-success btn-sm"
                                                onClick={() => handleMarkComplete(order.id)}
                                            >
                                                Mark Complete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Material Requirements */}
                <div className="col-12">
                    <div className="card shadow">
                    <div className="card-header bg-info text-white py-3">
                        <h6 className="m-0 font-weight-bold">
                            <i className="fas fa-boxes me-2"></i>
                            Material Requirements
                        </h6>
                    </div>
                    <div className="card-body">
                        {materialRequirements.length === 0 ? (
                            <p className="text-muted text-center mb-3">No material requirements</p>
                        ) : (
                            materialRequirements.map((material, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                    <div>
                                        <h6 className="mb-1">{material.material}</h6>
                                        <small className="text-muted">
                                            {material.quantity} • {material.jobs}
                                        </small>
                                    </div>
                                    <span className={`badge ${
                                        material.status === 'In Stock' ? 'bg-success' : 
                                        material.status === 'Approved' ? 'bg-info' :
                                        material.status === 'Pending' ? 'bg-warning' : 'bg-danger'
                                    }`}>
                                        {material.status}
                                    </span>
                                </div>
                            ))
                        )}
                        <button 
                            className="btn btn-outline-info btn-sm w-100"
                            onClick={() => onNavigate('materials')}
                        >
                            Manage Materials
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;