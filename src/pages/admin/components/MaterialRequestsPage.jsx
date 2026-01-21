// components/admin/pages/MaterialRequestsPage.js
import React, { useState, useEffect } from 'react';
import {
  getAllMaterialRequests,
  getMaterialRequestsByStatus,
  approveMaterialRequest,
  rejectMaterialRequest,
  fulfillMaterialRequest,
  getMaterialRequestById
} from '../../../services/materialRequestService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';

const MaterialRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let data;
      if (filterStatus === 'ALL') {
        data = await getAllMaterialRequests();
      } else {
        data = await getMaterialRequestsByStatus(filterStatus);
      }
      // Sort by created date, newest first
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(data);
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to fetch material requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveMaterialRequest(id, adminNotes || null);
      SuccesfulMessageToast('Material request approved successfully!');
      setShowApproveModal(false);
      setAdminNotes('');
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to approve material request');
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      ErrorMessageToast('Please provide a rejection reason');
      return;
    }
    try {
      await rejectMaterialRequest(id, rejectionReason);
      SuccesfulMessageToast('Material request rejected successfully!');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      await fetchRequests();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to reject material request');
    }
  };

  const handleFulfill = async (id) => {
    try {
      await fulfillMaterialRequest(id);
      SuccesfulMessageToast('Material request marked as fulfilled!');
      await fetchRequests();
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(null);
      }
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to fulfill material request');
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setShowApproveModal(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
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
      <div className="d-sm-flex align-items-center justify-content-between mb-4 mt-4">
        <h1 className="h3 mb-0 text-gray-800">
          <i className="fas fa-boxes me-2"></i>
          Material Requests
        </h1>
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStatus('ALL')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn ${filterStatus === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            Pending
          </button>
          <button
            type="button"
            className={`btn ${filterStatus === 'APPROVED' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setFilterStatus('APPROVED')}
          >
            Approved
          </button>
          <button
            type="button"
            className={`btn ${filterStatus === 'REJECTED' ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => setFilterStatus('REJECTED')}
          >
            Rejected
          </button>
          <button
            type="button"
            className={`btn ${filterStatus === 'FULFILLED' ? 'btn-info' : 'btn-outline-info'}`}
            onClick={() => setFilterStatus('FULFILLED')}
          >
            Fulfilled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          No material requests found.
        </div>
      ) : (
        <div className="card shadow">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Request #</th>
                    <th>Welder ID</th>
                    <th>Material Name</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Requested Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <strong>{request.requestNumber}</strong>
                      </td>
                      <td>{request.welderId}</td>
                      <td>{request.materialName}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {request.materialType.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {request.quantity} {request.unit}
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(request.priority)}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(request.createdAt)}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedRequest(request)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {request.status === 'PENDING' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => openApproveModal(request)}
                                title="Approve Request"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => openRejectModal(request)}
                                title="Reject Request"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          {request.status === 'APPROVED' && (
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleFulfill(request.id)}
                              title="Mark as Fulfilled"
                            >
                              <i className="fas fa-check-double"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg" style={{ maxHeight: '90vh' }}>
            <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
              <div className="modal-header">
                <h5 className="modal-title">Material Request Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                ></button>
              </div>
              <div className="modal-body" style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Request Number:</strong>
                    <p>{selectedRequest.requestNumber}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong>
                    <p>
                      <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Welder ID:</strong>
                    <p>{selectedRequest.welderId}</p>
                  </div>
                  <div className="col-md-6">
                    <strong>Material Name:</strong>
                    <p>{selectedRequest.materialName}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <strong>Material Type:</strong>
                    <p>
                      <span className="badge bg-secondary">
                        {selectedRequest.materialType.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-4">
                    <strong>Quantity:</strong>
                    <p>{selectedRequest.quantity} {selectedRequest.unit}</p>
                  </div>
                  <div className="col-md-4">
                    <strong>Priority:</strong>
                    <p>
                      <span className={`badge ${getPriorityBadgeClass(selectedRequest.priority)}`}>
                        {selectedRequest.priority}
                      </span>
                    </p>
                  </div>
                </div>
                {selectedRequest.description && (
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p>{selectedRequest.description}</p>
                  </div>
                )}
                {selectedRequest.adminNotes && (
                  <div className="mb-3">
                    <strong>Admin Notes:</strong>
                    <p className="text-info">{selectedRequest.adminNotes}</p>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="mb-3">
                    <strong>Rejection Reason:</strong>
                    <p className="text-danger">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Requested Date:</strong>
                    <p>{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  {selectedRequest.approvedAt && (
                    <div className="col-md-6">
                      <strong>Approved Date:</strong>
                      <p>{formatDate(selectedRequest.approvedAt)}</p>
                    </div>
                  )}
                  {selectedRequest.rejectedAt && (
                    <div className="col-md-6">
                      <strong>Rejected Date:</strong>
                      <p>{formatDate(selectedRequest.rejectedAt)}</p>
                    </div>
                  )}
                  {selectedRequest.fulfilledAt && (
                    <div className="col-md-6">
                      <strong>Fulfilled Date:</strong>
                      <p>{formatDate(selectedRequest.fulfilledAt)}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        openApproveModal(selectedRequest);
                        setSelectedRequest(null);
                      }}
                    >
                      <i className="fas fa-check me-1"></i> Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        openRejectModal(selectedRequest);
                        setSelectedRequest(null);
                      }}
                    >
                      <i className="fas fa-times me-1"></i> Reject
                    </button>
                  </>
                )}
                {selectedRequest.status === 'APPROVED' && (
                  <button
                    className="btn btn-info"
                    onClick={() => {
                      handleFulfill(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                  >
                    <i className="fas fa-check-double me-1"></i> Mark as Fulfilled
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Approve Material Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                    setAdminNotes('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Request:</strong> {selectedRequest.requestNumber}
                </p>
                <p>
                  <strong>Material:</strong> {selectedRequest.materialName} ({selectedRequest.quantity} {selectedRequest.unit})
                </p>
                <div className="mb-3">
                  <label htmlFor="adminNotes" className="form-label">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="adminNotes"
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                    setAdminNotes('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedRequest.id)}
                >
                  <i className="fas fa-check me-1"></i> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Material Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Request:</strong> {selectedRequest.requestNumber}
                </p>
                <p>
                  <strong>Material:</strong> {selectedRequest.materialName} ({selectedRequest.quantity} {selectedRequest.unit})
                </p>
                <div className="mb-3">
                  <label htmlFor="rejectionReason" className="form-label">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="rejectionReason"
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleReject(selectedRequest.id)}
                >
                  <i className="fas fa-times me-1"></i> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequestsPage;

