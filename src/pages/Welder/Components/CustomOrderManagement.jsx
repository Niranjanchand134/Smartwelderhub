// components/welder/pages/CustomOrderManagement.js
import React, { useState, useEffect } from 'react';
import { 
    getCustomOrdersByStatus, 
    updateOrderProgress, 
    startOrder, 
    markAsReadyForDelivery, 
    markAsCompleted,
    uploadCompletionPhotos,
    addWelderNotes,
    resolveIssue,
    getOrdersByWelder
} from '../../../services/customOrderService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';
import { useAuth } from '../../../Context/AuthContext';

const CustomOrderManagement = ({ onViewJob, onNavigate }) => {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProgress, setEditingProgress] = useState(null);
    const [progressValue, setProgressValue] = useState(0);
    const [showCompletionModal, setShowCompletionModal] = useState(null);
    const [showMarkCompletedModal, setShowMarkCompletedModal] = useState(null);
    const [completionPhotos, setCompletionPhotos] = useState([]);
    const [completedPhotos, setCompletedPhotos] = useState([]);
    const [welderNotes, setWelderNotes] = useState('');
    const [completedWelderNotes, setCompletedWelderNotes] = useState('');
    const [showIssueResolutionModal, setShowIssueResolutionModal] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState({});
    const [completedPhotoPreviewUrls, setCompletedPhotoPreviewUrls] = useState({});
    const [selectedJobDetails, setSelectedJobDetails] = useState(null);

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        try {
            setLoading(true);
            
            // Get all orders assigned to this welder
            if (!user || !user.id) {
                ErrorMessageToast('Unable to identify welder. Please log in again.');
                setLoading(false);
                return;
            }
            
            const allAssignedOrders = await getOrdersByWelder(user.id);
            
            // Filter orders by status
            const approved = allAssignedOrders.filter(o => o.status === 'APPROVED');
            const inProgress = allAssignedOrders.filter(o => o.status === 'IN_PROGRESS');
            const ready = allAssignedOrders.filter(o => o.status === 'READY_FOR_DELIVERY');
            const completed = allAssignedOrders.filter(o => o.status === 'COMPLETED');
            const confirmed = allAssignedOrders.filter(o => o.status === 'CONFIRMED_BY_CUSTOMER');
            const closed = allAssignedOrders.filter(o => o.status === 'CLOSED');
            const issuesRaised = allAssignedOrders.filter(o => o.status === 'ISSUE_RAISED');

            // Combine all completed-related statuses
            const allCompletedOrders = [...completed, ...confirmed, ...closed];
            const allOrders = [...approved, ...inProgress, ...ready, ...allCompletedOrders, ...issuesRaised];
            
            const transformedJobs = allOrders.map(order => {
                const measurements = order.measurementsJson ? JSON.parse(order.measurementsJson) : {};
                const measurementsStr = measurements.height && measurements.width && measurements.thickness
                    ? `${measurements.height}ft x ${measurements.width}ft x ${measurements.thickness}mm`
                    : 'N/A';
                
                let category = 'new';
                let status = 'assigned';
                
                if (order.status === 'APPROVED') {
                    category = 'new';
                    status = 'assigned';
                } else if (order.status === 'IN_PROGRESS') {
                    category = 'inProgress';
                    status = 'in_progress';
                } else if (order.status === 'READY_FOR_DELIVERY') {
                    category = 'ready';
                    status = 'ready_for_inspection';
                } else if (order.status === 'COMPLETED' || order.status === 'CONFIRMED_BY_CUSTOMER' || order.status === 'CLOSED') {
                    category = 'completed';
                    // Keep original status for display purposes
                    if (order.status === 'CONFIRMED_BY_CUSTOMER') {
                        status = 'confirmed';
                    } else if (order.status === 'CLOSED') {
                        status = 'closed';
                    } else {
                        status = 'completed';
                    }
                } else if (order.status === 'ISSUE_RAISED') {
                    category = 'issues';
                    status = 'issue_raised';
                }
                
                return {
                    id: order.id,
                    customer: order.customerName,
                    product: order.productType,
                    material: order.materialType,
                    measurements: measurementsStr,
                    status: status,
                    priority: 'medium',
                    category: category,
                    quote: order.estimatedCost || 0,
                    createdAt: order.createdAt,
                    deadline: order.updatedAt || order.createdAt,
                    customerPhone: order.mobileNumber,
                    customerLocation: order.address,
                    description: order.description,
                    orderNumber: order.orderNumber,
                    progressPercentage: order.progressPercentage || 0,
                    originalOrder: order,
                    issueRaised: order.issueRaised || false,
                    issueDescription: order.issueDescription || ''
                };
            });
            
            setJobs(transformedJobs);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartOrder = async (id) => {
        try {
            await startOrder(id);
            SuccesfulMessageToast('Order started successfully!');
            await fetchAllOrders();
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to start order');
        }
    };

    const handleProgressUpdate = async (id, newProgress) => {
        try {
            await updateOrderProgress(id, newProgress);
            SuccesfulMessageToast('Progress updated successfully!');
            setEditingProgress(null);
            await fetchAllOrders();
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to update progress');
        }
    };

    const handleProgressChange = (id, change) => {
        const job = jobs.find(j => j.id === id);
        if (!job) return;
        
        const currentProgress = job.progressPercentage || 0;
        const newProgress = Math.max(0, Math.min(100, currentProgress + change));
        
        handleProgressUpdate(id, newProgress);
    };

    const handleMarkReady = async (id) => {
        setShowCompletionModal(id);
    };

    // Convert File to Base64 Data URL
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleUploadCompletion = async (id) => {
        try {
            if (completionPhotos.length === 0) {
                ErrorMessageToast('Please upload at least one completion photo');
                return;
            }
            
            // Convert File objects to Base64 data URLs (persistent storage)
            const photoUrls = await Promise.all(
                completionPhotos.map(async (photo) => {
                    if (typeof photo === 'string') {
                        return photo; // Already a URL or base64 string
                    }
                    // Convert File object to base64 data URL
                    return await fileToBase64(photo);
                })
            );
            
            await uploadCompletionPhotos(id, photoUrls);
            if (welderNotes) {
                await addWelderNotes(id, welderNotes);
            }
            await markAsReadyForDelivery(id);
            SuccesfulMessageToast('Order marked as ready for delivery with completion photos!');
            // Clean up blob URLs
            Object.values(photoPreviewUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            setShowCompletionModal(null);
            setCompletionPhotos([]);
            setPhotoPreviewUrls({});
            setWelderNotes('');
            await fetchAllOrders();
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to mark as ready');
        }
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        setCompletionPhotos(prev => {
            const newPhotos = [...prev, ...files];
            // Create preview URLs for new File objects
            const newPreviewUrls = { ...photoPreviewUrls };
            newPhotos.forEach((photo, index) => {
                if (typeof photo !== 'string' && !newPreviewUrls[index]) {
                    newPreviewUrls[index] = URL.createObjectURL(photo);
                }
            });
            setPhotoPreviewUrls(newPreviewUrls);
            return newPhotos;
        });
    };

    const handleCompletedPhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        setCompletedPhotos(prev => {
            const newPhotos = [...prev, ...files];
            // Create preview URLs for new File objects
            const newPreviewUrls = { ...completedPhotoPreviewUrls };
            newPhotos.forEach((photo, index) => {
                if (typeof photo !== 'string' && !newPreviewUrls[index]) {
                    newPreviewUrls[index] = URL.createObjectURL(photo);
                }
            });
            setCompletedPhotoPreviewUrls(newPreviewUrls);
            return newPhotos;
        });
    };

    const removeCompletedPhoto = (index) => {
        setCompletedPhotos(prev => {
            // Clean up blob URL if it exists
            if (completedPhotoPreviewUrls[index]) {
                URL.revokeObjectURL(completedPhotoPreviewUrls[index]);
                const newUrls = { ...completedPhotoPreviewUrls };
                delete newUrls[index];
                // Reindex remaining URLs
                const reindexedUrls = {};
                Object.keys(newUrls).forEach(key => {
                    const keyNum = parseInt(key);
                    if (keyNum > index) {
                        reindexedUrls[keyNum - 1] = newUrls[key];
                    } else if (keyNum < index) {
                        reindexedUrls[keyNum] = newUrls[key];
                    }
                });
                setCompletedPhotoPreviewUrls(reindexedUrls);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const removePhoto = (index) => {
        setCompletionPhotos(prev => {
            // Clean up blob URL if it exists
            if (photoPreviewUrls[index]) {
                URL.revokeObjectURL(photoPreviewUrls[index]);
                const newUrls = { ...photoPreviewUrls };
                delete newUrls[index];
                // Reindex remaining URLs
                const reindexedUrls = {};
                Object.keys(newUrls).forEach(key => {
                    const keyNum = parseInt(key);
                    if (keyNum > index) {
                        reindexedUrls[keyNum - 1] = newUrls[key];
                    } else if (keyNum < index) {
                        reindexedUrls[keyNum] = newUrls[key];
                    }
                });
                setPhotoPreviewUrls(reindexedUrls);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleMarkCompleted = async (id) => {
        setShowMarkCompletedModal(id);
    };

    const handleUploadAndMarkCompleted = async (id) => {
        try {
            if (completedPhotos.length === 0) {
                ErrorMessageToast('Please upload at least one completion photo');
                return;
            }
            
            // Convert File objects to Base64 data URLs (persistent storage)
            const photoUrls = await Promise.all(
                completedPhotos.map(async (photo) => {
                    if (typeof photo === 'string') {
                        return photo; // Already a URL or base64 string
                    }
                    // Convert File object to base64 data URL
                    return await fileToBase64(photo);
                })
            );
            
            await uploadCompletionPhotos(id, photoUrls);
            if (completedWelderNotes) {
                await addWelderNotes(id, completedWelderNotes);
            }
            await markAsCompleted(id);
            SuccesfulMessageToast('Order marked as completed with photos!');
            
            // Clean up blob URLs
            Object.values(completedPhotoPreviewUrls).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            setShowMarkCompletedModal(null);
            setCompletedPhotos([]);
            setCompletedPhotoPreviewUrls({});
            setCompletedWelderNotes('');
            await fetchAllOrders();
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to mark as completed');
        }
    };

    const handleResolveIssue = async (id) => {
        try {
            await resolveIssue(id, resolutionNotes);
            SuccesfulMessageToast('Issue resolved successfully! Order moved back to In Progress.');
            setShowIssueResolutionModal(null);
            setResolutionNotes('');
            await fetchAllOrders();
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to resolve issue');
        }
    };

    const jobCategories = {
        new: {
            title: 'New Orders (Approved)',
            count: jobs.filter(job => job.category === 'new').length,
            icon: 'fas fa-inbox',
            color: 'primary'
        },
        inProgress: {
            title: 'Orders in Progress',
            count: jobs.filter(job => job.category === 'inProgress').length,
            icon: 'fas fa-hammer',
            color: 'warning'
        },
        ready: {
            title: 'Ready for Delivery',
            count: jobs.filter(job => job.category === 'ready').length,
            icon: 'fas fa-check-circle',
            color: 'success'
        },
        completed: {
            title: 'Completed Orders',
            count: jobs.filter(job => job.category === 'completed').length,
            icon: 'fas fa-clipboard-check',
            color: 'info'
        },
        issues: {
            title: 'Issues Raised',
            count: jobs.filter(job => job.category === 'issues').length,
            icon: 'fas fa-exclamation-triangle',
            color: 'danger'
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            assigned: { class: 'bg-warning text-dark', text: 'Assigned', icon: 'fas fa-clock' },
            in_progress: { class: 'bg-primary text-white', text: 'In Progress', icon: 'fas fa-hammer' },
            ready_for_inspection: { class: 'bg-success text-white', text: 'Ready for Delivery', icon: 'fas fa-check' },
            completed: { class: 'bg-info text-white', text: 'Completed', icon: 'fas fa-check-double' },
            confirmed: { class: 'bg-success text-white', text: 'Confirmed by Customer', icon: 'fas fa-check-circle' },
            closed: { class: 'bg-dark text-white', text: 'Closed', icon: 'fas fa-lock' },
            issue_raised: { class: 'bg-danger text-white', text: 'Issue Raised', icon: 'fas fa-exclamation-triangle' },
            cancelled: { class: 'bg-danger text-white', text: 'Cancelled', icon: 'fas fa-times' },
            rejected: { class: 'bg-secondary text-white', text: 'Rejected', icon: 'fas fa-ban' }
        };
        return config[status] || { class: 'bg-light text-dark', text: status, icon: 'fas fa-question' };
    };

    const getPriorityBadge = (priority) => {
        const config = {
            high: { class: 'bg-danger text-white', text: 'High' },
            medium: { class: 'bg-warning text-dark', text: 'Medium' },
            low: { class: 'bg-success text-white', text: 'Low' }
        };
        return config[priority] || { class: 'bg-light text-dark', text: priority };
    };

    const filteredJobs = activeFilter === 'all' 
        ? jobs 
        : jobs.filter(job => job.category === activeFilter);

    const searchedJobs = filteredJobs.filter(job =>
        job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.id.toString().includes(searchTerm) ||
        job.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleJobAction = (jobId, action) => {
        console.log(`${action} action performed on job ${jobId}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <div className="container-fluid">
            {/* Page Header */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Custom Order Management</h1>
                <div className="btn-group">
                    <button className="btn btn-primary" onClick={fetchAllOrders}>
                        <i className="fas fa-sync me-2"></i>Refresh
                    </button>
                </div>
            </div>

            {/* Job Categories Overview */}
            <div className="row mb-4">
                {Object.entries(jobCategories).map(([key, category]) => (
                    <div key={key} className="col-xl-3 col-md-4 col-sm-6 mb-3">
                        <div 
                            className={`card border-left-${category.color} shadow h-100 cursor-pointer ${
                                activeFilter === key ? 'border-2' : ''
                            }`}
                            onClick={() => setActiveFilter(key)}
                            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                        >
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className={`text-xs font-weight-bold text-${category.color} text-uppercase mb-1`}>
                                            {category.title}
                                        </div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                                            {category.count}
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className={`${category.icon} fa-2x text-gray-300`}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filter Bar */}
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search jobs by customer, product, order number, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="btn btn-primary">
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="btn-group float-end">
                                <button 
                                    className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => setActiveFilter('all')}
                                >
                                    All Jobs
                                </button>
                                <button 
                                    className={`btn btn-sm ${activeFilter === 'new' ? 'btn-warning' : 'btn-outline-warning'}`}
                                    onClick={() => setActiveFilter('new')}
                                >
                                    New
                                </button>
                                <button 
                                    className={`btn btn-sm ${activeFilter === 'inProgress' ? 'btn-info' : 'btn-outline-info'}`}
                                    onClick={() => setActiveFilter('inProgress')}
                                >
                                    In Progress
                                </button>
                                <button 
                                    className={`btn btn-sm ${activeFilter === 'completed' ? 'btn-success' : 'btn-outline-success'}`}
                                    onClick={() => setActiveFilter('completed')}
                                >
                                    Completed
                                </button>
                                <button 
                                    className={`btn btn-sm ${activeFilter === 'issues' ? 'btn-danger' : 'btn-outline-danger'}`}
                                    onClick={() => setActiveFilter('issues')}
                                >
                                    Issues
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading orders...</p>
                </div>
            ) : (
                <div className="row">
                    {searchedJobs.map(job => {
                        const status = getStatusBadge(job.status);
                        const priority = getPriorityBadge(job.priority);
                        
                        return (
                            <div key={job.id} className="col-lg-6 col-xl-4 mb-4">
                                <div className="card h-100 shadow border-left-3" 
                                     style={{borderLeftColor: 
                                        job.priority === 'high' ? '#dc3545' : 
                                        job.priority === 'medium' ? '#ffc107' : '#28a745'
                                    }}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="card-title text-primary">
                                                <i className={`${status.icon} me-2`}></i>
                                                #{job.id} - {job.product}
                                            </h6>
                                            <span className={`badge ${priority.class}`}>{priority.text}</span>
                                        </div>
                                        
                                        <p className="card-text mb-2">
                                            <strong>Customer:</strong> {job.customer}<br/>
                                            <strong>Material:</strong> {job.material}<br/>
                                            <strong>Measurements:</strong> {job.measurements}<br/>
                                            <strong>Quote:</strong> Rs. {job.quote.toLocaleString()}
                                        </p>

                                        {job.description && (
                                            <p className="small text-muted mb-2">
                                                <em>{job.description}</em>
                                            </p>
                                        )}

                                        {job.issueRaised && job.issueDescription && (
                                            <div className="alert alert-danger mb-3">
                                                <h6 className="alert-heading">
                                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                                    Issue Raised by Customer
                                                </h6>
                                                <p className="mb-0"><strong>Issue:</strong> {job.issueDescription}</p>
                                            </div>
                                        )}
                                        
                                        <div className="mb-3">
                                            <span className={`badge ${status.class} me-2`}>
                                                {status.text}
                                            </span>
                                            <small className="text-muted">Order: {job.orderNumber}</small>
                                        </div>

                                        {/* Progress Bar for In Progress Jobs */}
                                        {job.status === 'in_progress' && (
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <small className="text-muted">Progress</small>
                                                    <strong className="text-primary">{job.progressPercentage || 0}%</strong>
                                                </div>
                                                <div className="progress mb-2" style={{ height: '25px' }}>
                                                    <div 
                                                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                                                        style={{width: `${job.progressPercentage || 0}%`}}
                                                        role="progressbar"
                                                    >
                                                        {job.progressPercentage || 0}%
                                                    </div>
                                                </div>
                                                <div className="btn-group w-100" role="group">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleProgressChange(job.id, -10)}
                                                        disabled={job.progressPercentage <= 0}
                                                        title="Decrease by 10%"
                                                    >
                                                        <i className="fas fa-minus"></i> 10%
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleProgressChange(job.id, -5)}
                                                        disabled={job.progressPercentage <= 0}
                                                        title="Decrease by 5%"
                                                    >
                                                        <i className="fas fa-minus"></i> 5%
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => handleProgressChange(job.id, 5)}
                                                        disabled={job.progressPercentage >= 100}
                                                        title="Increase by 5%"
                                                    >
                                                        <i className="fas fa-plus"></i> 5%
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => handleProgressChange(job.id, 10)}
                                                        disabled={job.progressPercentage >= 100}
                                                        title="Increase by 10%"
                                                    >
                                                        <i className="fas fa-plus"></i> 10%
                                                    </button>
                                                </div>
                                                {job.progressPercentage >= 100 && (
                                                    <button
                                                        className="btn btn-success btn-sm w-100 mt-2"
                                                        onClick={() => handleMarkReady(job.id)}
                                                    >
                                                        <i className="fas fa-check me-1"></i>Mark as Ready for Delivery
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons Based on Status */}
                                        {job.status === 'assigned' && (
                                            <div className="btn-group w-100">
                                                <button 
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleStartOrder(job.id)}
                                                >
                                                    <i className="fas fa-play me-1"></i>Start Order
                                                </button>
                                                <button 
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => setSelectedJobDetails(job)}
                                                >
                                                    <i className="fas fa-eye me-1"></i>View Details
                                                </button>
                                            </div>
                                        )}

                                        {job.status === 'ready_for_inspection' && (
                                            <div className="d-grid gap-2">
                                                <button 
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => handleMarkCompleted(job.id)}
                                                >
                                                    <i className="fas fa-check-double me-1"></i>Mark as Completed
                                                </button>
                                                <button 
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => setSelectedJobDetails(job)}
                                                >
                                                    <i className="fas fa-eye me-1"></i>View Details
                                                </button>
                                            </div>
                                        )}

                                        {job.status === 'issue_raised' && (
                                            <div className="d-grid gap-2">
                                                <button 
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => setShowIssueResolutionModal(job.id)}
                                                >
                                                    <i className="fas fa-check-circle me-1"></i>Resolve Issue
                                                </button>
                                                <button 
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => setSelectedJobDetails(job)}
                                                >
                                                    <i className="fas fa-eye me-1"></i>View Details
                                                </button>
                                            </div>
                                        )}

                                        {(job.status === 'completed' || job.status === 'confirmed' || job.status === 'closed') && (
                                            <div className="text-center">
                                                <span className={`badge ${getStatusBadge(job.status).class} me-2`}>
                                                    <i className={`${getStatusBadge(job.status).icon} me-1`}></i>
                                                    {getStatusBadge(job.status).text}
                                                </span>
                                                <button 
                                                    className="btn btn-outline-primary btn-sm w-100 mt-2"
                                                    onClick={() => onViewJob && onViewJob(job)}
                                                >
                                                    <i className="fas fa-eye me-1"></i>View Details
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }                    )}
                </div>
            )}

            {!loading && searchedJobs.length === 0 && (
                <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No jobs found</h5>
                    <p className="text-muted">
                        {searchTerm ? 'No jobs match your search criteria.' : 'There are no jobs in this category.'}
                    </p>
                    {searchTerm && (
                        <button 
                            className="btn btn-primary"
                            onClick={() => setSearchTerm('')}
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            )}

            {/* Completion Photos Upload Modal */}
            {showCompletionModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">
                                    <i className="fas fa-camera me-2"></i>
                                    Mark Order as Ready for Delivery
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => {
                                        setShowCompletionModal(null);
                                        setCompletionPhotos([]);
                                        setWelderNotes('');
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-images me-2"></i>Upload Completion Photos *
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoUpload}
                                    />
                                    <small className="text-muted">Upload photos of the completed work</small>
                                </div>

                                {completionPhotos.length > 0 && (
                                    <div className="mb-3">
                                        <label className="form-label">Selected Photos:</label>
                                        <div className="row g-2">
                                            {completionPhotos.map((photo, index) => {
                                                // Get preview URL - use stored blob URL or direct URL for strings
                                                const previewSrc = typeof photo === 'string' 
                                                    ? photo 
                                                    : (photoPreviewUrls[index] || URL.createObjectURL(photo));
                                                
                                                return (
                                                    <div key={index} className="col-md-3 position-relative">
                                                        <img
                                                            src={previewSrc}
                                                            alt={`Completion ${index + 1}`}
                                                            className="img-thumbnail"
                                                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                                        />
                                                        <button
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                            onClick={() => removePhoto(index)}
                                                            style={{ margin: '2px' }}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-sticky-note me-2"></i>Welder Notes (Optional)
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={welderNotes}
                                        onChange={(e) => setWelderNotes(e.target.value)}
                                        placeholder="Add any notes about the work completed..."
                                    />
                                </div>

                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Note:</strong> After marking as ready, the customer will be able to view the completion photos and confirm or raise any issues.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowCompletionModal(null);
                                        setCompletionPhotos([]);
                                        setWelderNotes('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleUploadCompletion(showCompletionModal)}
                                    disabled={completionPhotos.length === 0}
                                >
                                    <i className="fas fa-check me-1"></i>Mark as Ready for Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Issue Resolution Modal */}
            {showIssueResolutionModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    <i className="fas fa-tools me-2"></i>
                                    Resolve Customer Issue
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => {
                                        setShowIssueResolutionModal(null);
                                        setResolutionNotes('');
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {(() => {
                                    const job = jobs.find(j => j.id === showIssueResolutionModal);
                                    return job && job.issueDescription ? (
                                        <>
                                            <div className="alert alert-warning mb-3">
                                                <h6 className="alert-heading">
                                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                                    Customer Issue
                                                </h6>
                                                <p className="mb-0">{job.issueDescription}</p>
                                            </div>

                                            <div className="card mb-3">
                                                <div className="card-header bg-light">
                                                    <h6 className="mb-0">Order Details</h6>
                                                </div>
                                                <div className="card-body">
                                                    <p className="mb-1"><strong>Order #:</strong> {job.orderNumber || job.id}</p>
                                                    <p className="mb-1"><strong>Customer:</strong> {job.customer}</p>
                                                    <p className="mb-1"><strong>Product:</strong> {job.product}</p>
                                                    <p className="mb-0"><strong>Material:</strong> {job.material}</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : null;
                                })()}

                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-comment-dots me-2"></i>Resolution Notes *
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        placeholder="Describe how you resolved the issue. What work was done to fix it?"
                                        required
                                    />
                                    <small className="text-muted">This will be added to the order notes and visible to the customer.</small>
                                </div>

                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Note:</strong> After resolving the issue, the order will be moved back to "In Progress" status. You can then continue working on it and mark it as ready when finished.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowIssueResolutionModal(null);
                                        setResolutionNotes('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleResolveIssue(showIssueResolutionModal)}
                                    disabled={!resolutionNotes.trim()}
                                >
                                    <i className="fas fa-check-circle me-1"></i>Resolve Issue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark as Completed Modal with Photo Upload */}
            {showMarkCompletedModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-info text-white">
                                <h5 className="modal-title">
                                    <i className="fas fa-check-double me-2"></i>
                                    Mark Order as Completed
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => {
                                        // Clean up blob URLs
                                        Object.values(completedPhotoPreviewUrls).forEach(url => {
                                            if (url && url.startsWith('blob:')) {
                                                URL.revokeObjectURL(url);
                                            }
                                        });
                                        setShowMarkCompletedModal(null);
                                        setCompletedPhotos([]);
                                        setCompletedPhotoPreviewUrls({});
                                        setCompletedWelderNotes('');
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-images me-2"></i>Upload Completion Photos *
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        multiple
                                        onChange={handleCompletedPhotoUpload}
                                    />
                                    <small className="text-muted">Upload photos of the completed work. These will be shown to the customer for confirmation.</small>
                                </div>

                                {completedPhotos.length > 0 && (
                                    <div className="mb-3">
                                        <label className="form-label">Selected Photos:</label>
                                        <div className="row g-2">
                                            {completedPhotos.map((photo, index) => {
                                                // Get preview URL - use stored blob URL or direct URL for strings
                                                const previewSrc = typeof photo === 'string' 
                                                    ? photo 
                                                    : (completedPhotoPreviewUrls[index] || URL.createObjectURL(photo));
                                                
                                                return (
                                                    <div key={index} className="col-md-3 position-relative">
                                                        <img
                                                            src={previewSrc}
                                                            alt={`Completion ${index + 1}`}
                                                            className="img-thumbnail"
                                                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                                                        />
                                                        <button
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                            onClick={() => removeCompletedPhoto(index)}
                                                            style={{ margin: '2px' }}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        <i className="fas fa-sticky-note me-2"></i>Welder Notes (Optional)
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={completedWelderNotes}
                                        onChange={(e) => setCompletedWelderNotes(e.target.value)}
                                        placeholder="Add any notes about the work completed..."
                                    />
                                </div>

                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Note:</strong> After marking as completed, the customer will be able to view the completion photos and confirm or raise any issues.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        // Clean up blob URLs
                                        Object.values(completedPhotoPreviewUrls).forEach(url => {
                                            if (url && url.startsWith('blob:')) {
                                                URL.revokeObjectURL(url);
                                            }
                                        });
                                        setShowMarkCompletedModal(null);
                                        setCompletedPhotos([]);
                                        setCompletedPhotoPreviewUrls({});
                                        setCompletedWelderNotes('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-info"
                                    onClick={() => handleUploadAndMarkCompleted(showMarkCompletedModal)}
                                    disabled={completedPhotos.length === 0}
                                >
                                    <i className="fas fa-check-double me-1"></i>Mark as Completed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedJobDetails && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="fas fa-file-invoice me-2"></i>
                                    Order Details - #{selectedJobDetails.orderNumber || selectedJobDetails.id}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setSelectedJobDetails(null)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="row">
                                    {/* Left Column - Order Information */}
                                    <div className="col-md-6">
                                        <div className="card mb-3">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Order Information</h6>
                                            </div>
                                            <div className="card-body">
                                                <p><strong>Order Number:</strong> {selectedJobDetails.orderNumber || selectedJobDetails.id}</p>
                                                <p><strong>Status:</strong> 
                                                    <span className={`badge ${getStatusBadge(selectedJobDetails.status).class} ms-2`}>
                                                        <i className={`${getStatusBadge(selectedJobDetails.status).icon} me-1`}></i>
                                                        {getStatusBadge(selectedJobDetails.status).text}
                                                    </span>
                                                </p>
                                                <p><strong>Priority:</strong> 
                                                    <span className={`badge ${getPriorityBadge(selectedJobDetails.priority).class} ms-2`}>
                                                        {getPriorityBadge(selectedJobDetails.priority).text}
                                                    </span>
                                                </p>
                                                {selectedJobDetails.progressPercentage !== undefined && (
                                                    <p><strong>Progress:</strong> {selectedJobDetails.progressPercentage}%</p>
                                                )}
                                                <p><strong>Created:</strong> {formatDate(selectedJobDetails.createdAt)}</p>
                                                <p><strong>Last Updated:</strong> {formatDate(selectedJobDetails.deadline)}</p>
                                            </div>
                                        </div>

                                        <div className="card mb-3">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0"><i className="fas fa-user me-2"></i>Customer Information</h6>
                                            </div>
                                            <div className="card-body">
                                                <p><strong>Name:</strong> {selectedJobDetails.customer}</p>
                                                <p><strong>Phone:</strong> {selectedJobDetails.customerPhone}</p>
                                                <p><strong>Location:</strong> {selectedJobDetails.customerLocation}</p>
                                            </div>
                                        </div>

                                        <div className="card mb-3">
                                            <div className="card-header bg-light">
                                                <h6 className="mb-0"><i className="fas fa-box me-2"></i>Product Details</h6>
                                            </div>
                                            <div className="card-body">
                                                <p><strong>Product Type:</strong> {selectedJobDetails.product}</p>
                                                <p><strong>Material:</strong> {selectedJobDetails.material}</p>
                                                <p><strong>Measurements:</strong> {selectedJobDetails.measurements}</p>
                                                <p><strong>Estimated Cost:</strong> Rs. {selectedJobDetails.quote.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Additional Details */}
                                    <div className="col-md-6">
                                        {selectedJobDetails.description && (
                                            <div className="card mb-3">
                                                <div className="card-header bg-light">
                                                    <h6 className="mb-0"><i className="fas fa-align-left me-2"></i>Description</h6>
                                                </div>
                                                <div className="card-body">
                                                    <p className="mb-0">{selectedJobDetails.description}</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedJobDetails.originalOrder && (
                                            <>
                                                {selectedJobDetails.originalOrder.welderNotes && (
                                                    <div className="card mb-3">
                                                        <div className="card-header bg-light">
                                                            <h6 className="mb-0"><i className="fas fa-sticky-note me-2"></i>Welder Notes</h6>
                                                        </div>
                                                        <div className="card-body">
                                                            <p className="mb-0">{selectedJobDetails.originalOrder.welderNotes}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedJobDetails.issueRaised && selectedJobDetails.issueDescription && (
                                                    <div className="card mb-3 border-danger">
                                                        <div className="card-header bg-danger text-white">
                                                            <h6 className="mb-0"><i className="fas fa-exclamation-triangle me-2"></i>Customer Issue</h6>
                                                        </div>
                                                        <div className="card-body">
                                                            <p className="mb-0"><strong>Issue Description:</strong> {selectedJobDetails.issueDescription}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedJobDetails.originalOrder.completionPhotosJson && (() => {
                                                    try {
                                                        const photos = JSON.parse(selectedJobDetails.originalOrder.completionPhotosJson);
                                                        if (photos && photos.length > 0) {
                                                            return (
                                                                <div className="card mb-3">
                                                                    <div className="card-header bg-light">
                                                                        <h6 className="mb-0"><i className="fas fa-images me-2"></i>Completion Photos</h6>
                                                                    </div>
                                                                    <div className="card-body">
                                                                        <div className="row g-2">
                                                                            {photos.map((photo, index) => (
                                                                                <div key={index} className="col-md-6">
                                                                                    <img
                                                                                        src={photo}
                                                                                        alt={`Completion ${index + 1}`}
                                                                                        className="img-thumbnail w-100"
                                                                                        style={{ height: '150px', objectFit: 'cover' }}
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    } catch (e) {
                                                        return null;
                                                    }
                                                    return null;
                                                })()}

                                                {selectedJobDetails.originalOrder.referenceImageUrl && (
                                                    <div className="card mb-3">
                                                        <div className="card-header bg-light">
                                                            <h6 className="mb-0"><i className="fas fa-image me-2"></i>Reference Image</h6>
                                                        </div>
                                                        <div className="card-body text-center">
                                                            <img
                                                                src={selectedJobDetails.originalOrder.referenceImageUrl}
                                                                alt="Reference"
                                                                className="img-fluid rounded"
                                                                style={{ maxHeight: '300px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedJobDetails.originalOrder.aiDesignJson && (() => {
                                                    try {
                                                        const aiDesign = JSON.parse(selectedJobDetails.originalOrder.aiDesignJson);
                                                        if (aiDesign) {
                                                            return (
                                                                <div className="card mb-3">
                                                                    <div className="card-header bg-light">
                                                                        <h6 className="mb-0"><i className="fas fa-robot me-2"></i>AI Design Details</h6>
                                                                    </div>
                                                                    <div className="card-body">
                                                                        {aiDesign.preview && <p><strong>Preview:</strong> {aiDesign.preview}</p>}
                                                                        {aiDesign.materialBreakdown && <p><strong>Material:</strong> {aiDesign.materialBreakdown}</p>}
                                                                        {aiDesign.estimatedTime && <p><strong>Estimated Time:</strong> {aiDesign.estimatedTime}</p>}
                                                                        {aiDesign.complexity && <p><strong>Complexity:</strong> {aiDesign.complexity}</p>}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    } catch (e) {
                                                        return null;
                                                    }
                                                    return null;
                                                })()}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedJobDetails(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomOrderManagement;
