// components/welder/pages/Materials.js
import React, { useState, useEffect } from 'react';
import MaterialRequestForm from './MaterialRequestForm';
import { getMaterialRequestsByWelderId } from '../../../services/materialRequestService';
import { useAuth } from '../../../Context/AuthContext';

const Materials = () => {
    const { user } = useAuth();
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [materialRequests, setMaterialRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const materials = [
        {
            id: 1,
            name: 'MS Steel',
            currentStock: '120 kg',
            required: '45 kg',
            status: 'In Stock',
            jobs: ['Gate - John', 'Table - Anita', 'Grill - Raj'],
            reorderLevel: '50 kg'
        },
        {
            id: 2,
            name: 'Stainless Steel',
            currentStock: '15 kg',
            required: '25 kg',
            status: 'Low Stock',
            jobs: ['Window Grill - Sita', 'Railing - Mike'],
            reorderLevel: '20 kg'
        },
        {
            id: 3,
            name: 'Iron Rods',
            currentStock: '45 pieces',
            required: '30 pieces',
            status: 'In Stock',
            jobs: ['Gate - John', 'Railing - Mike'],
            reorderLevel: '20 pieces'
        },
        {
            id: 4,
            name: 'Welding Electrodes',
            currentStock: '2 packs',
            required: '5 packs',
            status: 'Order Needed',
            jobs: ['All ongoing jobs'],
            reorderLevel: '5 packs'
        }
    ];

    useEffect(() => {
        if (user && user.id) {
            fetchMaterialRequests();
        }
    }, [user]);

    const fetchMaterialRequests = async () => {
        if (!user || !user.id) return;
        
        setLoading(true);
        try {
            const requests = await getMaterialRequestsByWelderId(user.id);
            setMaterialRequests(requests);
        } catch (error) {
            console.error('Failed to fetch material requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSuccess = () => {
        fetchMaterialRequests();
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-warning';
            case 'APPROVED':
                return 'bg-success';
            case 'REJECTED':
                return 'bg-danger';
            case 'FULFILLED':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'URGENT':
                return 'bg-danger';
            case 'HIGH':
                return 'bg-warning';
            case 'MEDIUM':
                return 'bg-info';
            case 'LOW':
                return 'bg-secondary';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">My Material Requests</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowRequestForm(true)}
                >
                    <i className="fas fa-plus me-2"></i>Request Material
                </button>
            </div>

            {/* Material Requests Section */}
            <div className="mt-5">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : materialRequests.length === 0 ? (
                    <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        No material requests found. Click "Request Material" to create a new request.
                    </div>
                ) : (
                    <div className="row">
                        {materialRequests.map((request) => (
                            <div key={request.id} className="col-lg-6 mb-4">
                                <div className={`card border-left-${
                                    request.status === 'APPROVED' ? 'success' : 
                                    request.status === 'PENDING' ? 'warning' : 
                                    request.status === 'REJECTED' ? 'danger' : 'info'
                                } shadow h-100`}>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h5 className="card-title text-primary">{request.materialName}</h5>
                                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>

                                        <div className="row mb-3">
                                            <div className="col-6">
                                                <strong>Quantity Requested:</strong>
                                                <div className="h5 text-success">{request.quantity} {request.unit}</div>
                                            </div>
                                            <div className="col-6">
                                                <strong>Priority:</strong>
                                                <div className="h5 text-warning">
                                                    <span className={`badge ${getPriorityBadgeClass(request.priority)}`}>
                                                        {request.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <strong>Material Type:</strong>
                                            <div>
                                                <span className="badge bg-light text-dark me-1 mb-1">
                                                    {request.materialType.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-outline-primary"
                                                data-bs-toggle="modal"
                                                data-bs-target={`#requestModal${request.id}`}
                                            >
                                                <i className="fas fa-eye me-2"></i>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Request Detail Modals */}
            {materialRequests.map((request) => (
                <div
                    key={request.id}
                    className="modal fade"
                    id={`requestModal${request.id}`}
                    tabIndex="-1"
                    aria-labelledby={`requestModalLabel${request.id}`}
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id={`requestModalLabel${request.id}`}>
                                    Material Request Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Request Number:</strong>
                                        <p>{request.requestNumber}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Status:</strong>
                                        <p>
                                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <strong>Material Name:</strong>
                                        <p>{request.materialName}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Material Type:</strong>
                                        <p>
                                            <span className="badge bg-secondary">
                                                {request.materialType.replace('_', ' ')}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-4">
                                        <strong>Quantity:</strong>
                                        <p>{request.quantity} {request.unit}</p>
                                    </div>
                                    <div className="col-md-4">
                                        <strong>Priority:</strong>
                                        <p>
                                            <span className={`badge ${getPriorityBadgeClass(request.priority)}`}>
                                                {request.priority}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-4">
                                        <strong>Requested Date:</strong>
                                        <p>{formatDate(request.createdAt)}</p>
                                    </div>
                                </div>
                                {request.description && (
                                    <div className="mb-3">
                                        <strong>Description:</strong>
                                        <p>{request.description}</p>
                                    </div>
                                )}
                                {request.adminNotes && (
                                    <div className="mb-3">
                                        <strong>Admin Notes:</strong>
                                        <p className="text-info">{request.adminNotes}</p>
                                    </div>
                                )}
                                {request.rejectionReason && (
                                    <div className="mb-3">
                                        <strong>Rejection Reason:</strong>
                                        <p className="text-danger">{request.rejectionReason}</p>
                                    </div>
                                )}
                                {request.approvedAt && (
                                    <div className="mb-3">
                                        <strong>Approved Date:</strong>
                                        <p>{formatDate(request.approvedAt)}</p>
                                    </div>
                                )}
                                {request.fulfilledAt && (
                                    <div className="mb-3">
                                        <strong>Fulfilled Date:</strong>
                                        <p>{formatDate(request.fulfilledAt)}</p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Material Request Form Modal */}
            {showRequestForm && (
                <MaterialRequestForm
                    onClose={() => setShowRequestForm(false)}
                    onSuccess={handleRequestSuccess}
                />
            )}
        </div>
    );
};

export default Materials;