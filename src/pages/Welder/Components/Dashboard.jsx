// components/welder/pages/Dashboard.js
import React from 'react';

const Dashboard = ({ onViewJob, onNavigate }) => {
    const stats = [
        {
            title: 'New Orders',
            value: '5',
            icon: 'fas fa-inbox',
            color: 'primary',
            change: '+2',
            onClick: () => onNavigate('job-management')
        },
        {
            title: 'Orders in Progress',
            value: '3',
            icon: 'fas fa-hammer',
            color: 'warning',
            change: '+1',
            onClick: () => onNavigate('job-management')
        },
        {
            title: 'Ready for Delivery',
            value: '2',
            icon: 'fas fa-check-circle',
            color: 'success',
            change: '+1',
            onClick: () => onNavigate('job-management')
        },
    ];

    const recentOrders = {
        new: [
            { id: 101, customer: 'John Sharma', product: 'Main Gate', time: '2 hours ago' },
            { id: 102, customer: 'Sita Rai', product: 'Window Grill', time: '5 hours ago' },
            { id: 103, customer: 'Mike Smith', product: 'Stair Railing', time: '1 day ago' }
        ],
        inProgress: [
            { id: 201, customer: 'Anita Gurung', product: 'Custom Table', progress: 75 },
            { id: 202, customer: 'Raj Kumar', product: 'Security Grill', progress: 50 }
        ],
        ready: [
            { id: 301, customer: 'David Wilson', product: 'Office Gate', status: 'Ready for pickup' },
            { id: 302, customer: 'Priya Shrestha', product: 'Balcony Railing', status: 'Ready for delivery' }
        ]
    };

    const materialRequirements = [
        { material: 'MS Steel', quantity: '45 kg', jobs: '3 orders', status: 'In Stock' },
        { material: 'Stainless Steel', quantity: '25 kg', jobs: '2 orders', status: 'Low Stock' },
        { material: 'Iron Rods', quantity: '30 pieces', jobs: '2 orders', status: 'In Stock' },
        { material: 'Welding Electrodes', quantity: '5 packs', jobs: 'All orders', status: 'Order Needed' }
    ];

    const aiDesignSuggestions = [
        {
            id: 1,
            jobId: 101,
            customer: 'John Sharma',
            design: 'Modern Gate with Geometric Pattern',
            improvement: '30% stronger structure',
            materialSave: 'Save 15% material',
            timeSave: '2 hours faster fabrication'
        },
        {
            id: 2,
            jobId: 102,
            customer: 'Sita Rai',
            design: 'Minimalist Window Grill',
            improvement: 'Better airflow design',
            materialSave: 'Save 10% material',
            timeSave: '1 hour faster'
        }
    ];

    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Welder Dashboard</h1>
                <div className="btn-group">
                    <button className="btn btn-primary">
                        <i className="fas fa-plus me-2"></i>New Quote
                    </button>
                    <button className="btn btn-outline-primary">
                        <i className="fas fa-sync-alt me-2"></i>Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row">
                {stats.map((stat, index) => (
                    <div key={index} className="col-xl-4 col-md-6 mb-4">
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
                            {recentOrders.new.map(order => (
                                <div key={order.id} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                    <div>
                                        <h6 className="mb-1">#{order.id} - {order.product}</h6>
                                        <small className="text-muted">Customer: {order.customer}</small>
                                        <br/>
                                        <small className="text-muted">{order.time}</small>
                                    </div>
                                    <div>
                                        <button className="btn btn-success btn-sm me-1">
                                            Accept
                                        </button>
                                        <button className="btn btn-danger btn-sm">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                className="btn btn-outline-primary btn-sm w-100 mt-2"
                                onClick={() => onNavigate('job-management')}
                            >
                                View All New Orders
                            </button>
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
                            {recentOrders.inProgress.map(order => (
                                <div key={order.id} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <h6 className="mb-0">#{order.id} - {order.product}</h6>
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
                                        <button className="btn btn-outline-primary btn-sm">Update Progress</button>
                                        <button className="btn btn-outline-success btn-sm">Mark Complete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Material Requirements */}
                <div className="card shadow">
                    <div className="card-header bg-info text-white py-3">
                        <h6 className="m-0 font-weight-bold">
                            <i className="fas fa-boxes me-2"></i>
                            Material Requirements
                        </h6>
                    </div>
                    <div className="card-body">
                        {materialRequirements.map((material, index) => (
                            <div key={index} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                <div>
                                    <h6 className="mb-1">{material.material}</h6>
                                    <small className="text-muted">
                                        {material.quantity} • {material.jobs}
                                    </small>
                                </div>
                                <span className={`badge ${
                                    material.status === 'In Stock' ? 'bg-success' : 
                                    material.status === 'Low Stock' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                    {material.status}
                                </span>
                            </div>
                        ))}
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
    );
};

export default Dashboard;