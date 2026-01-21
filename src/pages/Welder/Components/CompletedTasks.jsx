// components/welder/pages/CompletedTasks.js
import React, { useState, useEffect } from 'react';
import { getOrdersByWelder } from '../../../services/customOrderService';
import { ErrorMessageToast } from '../../../utils/Tostify.util';
import { useAuth } from '../../../Context/AuthContext';

const CompletedTasks = ({ onViewJob, onNavigate }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [completedJobs, setCompletedJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchCompletedOrders();
    }, [user]);

    const fetchCompletedOrders = async () => {
        try {
            setLoading(true);
            
            if (!user || !user.id) {
                ErrorMessageToast('Unable to identify welder. Please log in again.');
                setLoading(false);
                return;
            }
            
            // Get all orders assigned to this welder
            const allAssignedOrders = await getOrdersByWelder(user.id);
            
            // Filter only completed orders (COMPLETED, CONFIRMED_BY_CUSTOMER, CLOSED)
            const completed = allAssignedOrders.filter(o => o.status === 'COMPLETED');
            const confirmed = allAssignedOrders.filter(o => o.status === 'CONFIRMED_BY_CUSTOMER');
            const closed = allAssignedOrders.filter(o => o.status === 'CLOSED');
            
            // Combine all completed-related statuses
            const allCompletedOrders = [...completed, ...confirmed, ...closed];
            
            const transformedJobs = allCompletedOrders.map(order => {
                const measurements = order.measurementsJson ? JSON.parse(order.measurementsJson) : {};
                const measurementsStr = measurements.height && measurements.width && measurements.thickness
                    ? `${measurements.height}ft x ${measurements.width}ft x ${measurements.thickness}mm`
                    : 'N/A';
                
                let status = 'completed';
                if (order.status === 'CONFIRMED_BY_CUSTOMER') {
                    status = 'confirmed';
                } else if (order.status === 'CLOSED') {
                    status = 'closed';
                }
                
                return {
                    id: order.id,
                    customer: order.customerName,
                    product: order.productType,
                    material: order.materialType,
                    measurements: measurementsStr,
                    status: status,
                    priority: order.priority || 'medium',
                    quote: order.estimatedCost || order.totalAmount || 0,
                    createdAt: order.createdAt,
                    completedAt: order.updatedAt || order.createdAt,
                    deadline: order.deadline,
                    customerPhone: order.mobileNumber,
                    customerLocation: order.address,
                    description: order.description,
                    orderNumber: order.orderNumber,
                    originalOrder: order,
                    paymentStatus: order.paymentStatus || 'PENDING'
                };
            });
            
            // Sort by completed date (most recent first)
            transformedJobs.sort((a, b) => {
                const dateA = new Date(a.completedAt);
                const dateB = new Date(b.completedAt);
                return dateB - dateA;
            });
            
            setCompletedJobs(transformedJobs);
        } catch (error) {
            console.error('Failed to fetch completed orders:', error);
            ErrorMessageToast(error.message || 'Failed to load completed tasks');
            setCompletedJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            completed: { class: 'bg-info text-white', text: 'Completed', icon: 'fas fa-check-double' },
            confirmed: { class: 'bg-success text-white', text: 'Confirmed by Customer', icon: 'fas fa-check-circle' },
            closed: { class: 'bg-dark text-white', text: 'Closed', icon: 'fas fa-lock' }
        };
        return config[status] || { class: 'bg-light text-dark', text: status, icon: 'fas fa-question' };
    };

    const getPaymentBadge = (paymentStatus) => {
        if (paymentStatus === 'PAID') {
            return { class: 'bg-success text-white', text: 'Paid', icon: 'fas fa-check' };
        } else if (paymentStatus === 'PARTIAL') {
            return { class: 'bg-warning text-dark', text: 'Partial', icon: 'fas fa-clock' };
        }
        return { class: 'bg-danger text-white', text: 'Pending', icon: 'fas fa-hourglass-half' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatPrice = (price) => {
        if (!price) return 'Rs. 0.00';
        return `Rs. ${Number(price).toFixed(2)}`;
    };

    const filteredByStatus = filterStatus === 'all' 
        ? completedJobs 
        : completedJobs.filter(job => job.status === filterStatus);

    const searchedJobs = filteredByStatus.filter(job =>
        job.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.id.toString().includes(searchTerm)
    );

    const stats = {
        total: completedJobs.length,
        completed: completedJobs.filter(j => j.status === 'completed').length,
        confirmed: completedJobs.filter(j => j.status === 'confirmed').length,
        closed: completedJobs.filter(j => j.status === 'closed').length,
        totalEarnings: completedJobs.reduce((sum, job) => sum + (job.quote || 0), 0)
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h3 mb-1 text-gray-800">Overall Completed Tasks</h1>
                    <p className="text-muted mb-0">View all your completed work orders</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Total Completed</h6>
                                    <h3 className="mb-0 fw-bold text-primary">{stats.total}</h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 text-primary rounded d-flex align-items-center justify-content-center" 
                                     style={{ width: '60px', height: '60px', minWidth: '60px' }}>
                                    <i className="fas fa-check-double" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Customer Confirmed</h6>
                                    <h3 className="mb-0 fw-bold text-success">{stats.confirmed}</h3>
                                </div>
                                <div className="bg-success bg-opacity-10 text-success rounded d-flex align-items-center justify-content-center" 
                                     style={{ width: '60px', height: '60px', minWidth: '60px' }}>
                                    <i className="fas fa-check-circle" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Closed Orders</h6>
                                    <h3 className="mb-0 fw-bold text-dark">{stats.closed}</h3>
                                </div>
                                <div className="bg-dark bg-opacity-10 text-dark rounded d-flex align-items-center justify-content-center" 
                                     style={{ width: '60px', height: '60px', minWidth: '60px' }}>
                                    <i className="fas fa-lock" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted mb-1">Total Earnings</h6>
                                    <h3 className="mb-0 fw-bold text-info">{formatPrice(stats.totalEarnings)}</h3>
                                </div>
                                <div className="bg-info bg-opacity-10 text-info rounded d-flex align-items-center justify-content-center" 
                                     style={{ width: '60px', height: '60px', minWidth: '60px' }}>
                                    <i className="fas fa-coins" style={{ fontSize: '2rem' }}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Search</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by customer, product, or order number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Filter by Status</label>
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="confirmed">Customer Confirmed</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Completed Jobs List */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">Loading completed tasks...</p>
                        </div>
                    ) : searchedJobs.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-inbox text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5>No Completed Tasks Found</h5>
                            <p className="text-muted">
                                {searchTerm || filterStatus !== 'all' 
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'You haven\'t completed any tasks yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Material</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Completed Date</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchedJobs.map((job) => {
                                        const statusBadge = getStatusBadge(job.status);
                                        const paymentBadge = getPaymentBadge(job.paymentStatus);
                                        return (
                                            <tr key={job.id}>
                                                <td>
                                                    <span className="fw-bold text-primary">
                                                        #{job.orderNumber || job.id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div className="fw-bold">{job.customer || 'N/A'}</div>
                                                        <small className="text-muted">{job.customerPhone || ''}</small>
                                                    </div>
                                                </td>
                                                <td>{job.product || 'N/A'}</td>
                                                <td>
                                                    <span className="badge bg-secondary">
                                                        {job.material || 'N/A'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fw-bold text-success">
                                                        {formatPrice(job.quote)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${statusBadge.class}`}>
                                                        <i className={`${statusBadge.icon} me-1`}></i>
                                                        {statusBadge.text}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${paymentBadge.class}`}>
                                                        <i className={`${paymentBadge.icon} me-1`}></i>
                                                        {paymentBadge.text}
                                                    </span>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {formatDate(job.completedAt)}
                                                    </small>
                                                </td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => {
                                                            if (onViewJob) {
                                                                onViewJob(job);
                                                            }
                                                            if (onNavigate) {
                                                                onNavigate('job-details');
                                                            }
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <i className="fas fa-eye me-1"></i>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompletedTasks;
