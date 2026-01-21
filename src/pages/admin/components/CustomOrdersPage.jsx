// src/components/AdminPanel/CustomOrdersPage.js
import React, { useEffect, useState } from 'react';
import { getAllCustomOrders, approveCustomOrder, rejectCustomOrder, adminVerifyAndClose, updatePaymentInfo, updatePaymentStatus, getAllWelders, assignWeldersToOrder } from '../../../services/customOrderService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';

const CustomOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [welders, setWelders] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [selectedWelders, setSelectedWelders] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchWelders();
  }, []);

  const fetchWelders = async () => {
    try {
      const data = await getAllWelders();
      setWelders(data || []);
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to load welders');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomOrders();
      setOrders(data || []);
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to load custom orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWelders = async (orderId) => {
    if (selectedWelders.length === 0) {
      ErrorMessageToast('Please select at least one welder to assign');
      return;
    }
    try {
      await assignWeldersToOrder(orderId, selectedWelders);
      SuccesfulMessageToast('Welders assigned successfully!');
      // After assignment, approve the order
      await approveCustomOrder(orderId);
      SuccesfulMessageToast('Order approved and welders assigned successfully!');
      await fetchOrders();
      setShowAssignModal(null);
      setSelectedWelders([]);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to assign welders');
    }
  };

  const handleApprove = async (id) => {
    // Check if welders are already assigned
    const order = orders.find(o => o.id === id);
    if (order && order.assignedWeldersJson) {
      try {
        const assignedIds = JSON.parse(order.assignedWeldersJson);
        if (assignedIds && assignedIds.length > 0) {
          // Welders already assigned, just approve
          await approveCustomOrder(id);
          SuccesfulMessageToast('Order approved successfully!');
          await fetchOrders();
          if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder(null);
          }
          return;
        }
      } catch (e) {
        // If parsing fails, show assignment modal
      }
    }
    // No welders assigned, show assignment modal
    setShowAssignModal(id);
    setSelectedWelders([]);
  };

  const handleReject = async (id) => {
    try {
      await rejectCustomOrder(id);
      SuccesfulMessageToast('Order rejected successfully!');
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to reject order');
    }
  };

  const handleVerifyAndClose = async (id) => {
    if (!window.confirm('Are you sure you want to verify and close this order? This action cannot be undone.')) {
      return;
    }
    try {
      await adminVerifyAndClose(id);
      SuccesfulMessageToast('Order verified and closed successfully!');
      await fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to verify and close order');
    }
  };

  const handleUpdatePayment = async (id, paymentMethod, additionalCharges) => {
    try {
      await updatePaymentInfo(id, paymentMethod, additionalCharges);
      SuccesfulMessageToast('Payment information updated successfully!');
      await fetchOrders();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to update payment information');
    }
  };

  const handleUpdatePaymentStatus = async (id, paymentStatus) => {
    try {
      await updatePaymentStatus(id, paymentStatus);
      SuccesfulMessageToast('Payment status updated successfully!');
      await fetchOrders();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to update payment status');
    }
  };

  const parseMeasurements = (order) => {
    try {
      return JSON.parse(order.measurementsJson || '{}');
    } catch {
      return {};
    }
  };

  const parseAiDesign = (order) => {
    try {
      return JSON.parse(order.aiDesignJson || '{}');
    } catch {
      return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { class: 'bg-warning text-dark', text: 'Pending', icon: 'fas fa-clock' },
      APPROVED: { class: 'bg-success text-white', text: 'Approved', icon: 'fas fa-check-circle' },
      CONFIRMED_BY_CUSTOMER: { class: 'bg-info text-white', text: 'Confirmed', icon: 'fas fa-check-double' },
      ISSUE_RAISED: { class: 'bg-warning text-dark', text: 'Issue Raised', icon: 'fas fa-exclamation-triangle' },
      CLOSED: { class: 'bg-success text-white', text: 'Closed', icon: 'fas fa-check-circle' },
      REJECTED: { class: 'bg-danger text-white', text: 'Rejected', icon: 'fas fa-times-circle' },
      CANCELLED: { class: 'bg-secondary text-white', text: 'Cancelled', icon: 'fas fa-ban' }
    };
    return config[status] || { class: 'bg-secondary text-white', text: status, icon: 'fas fa-question' };
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobileNumber?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    APPROVED: orders.filter(o => o.status === 'APPROVED').length,
    REJECTED: orders.filter(o => o.status === 'REJECTED').length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length
  };

  return (
    <div>
      {/* Header Section */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
        <div>
          <h1 className="h2 mb-1">Custom Orders Management</h1>
          <p className="text-muted mb-0">Manage and review custom product orders</p>
        </div>
        <button className="btn btn-outline-primary" onClick={fetchOrders}>
          <i className="fas fa-sync me-2"></i>Refresh
        </button>
      </div>

      {/* Filter Cards */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    <i className="fas fa-search me-2"></i>Search Orders
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by customer name, order number, product, or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    <i className="fas fa-filter me-2"></i>Filter by Status
                  </label>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilterStatus('all')}
                    >
                      All <span className="badge bg-light text-dark ms-2">{statusCounts.all}</span>
                    </button>
                    <button
                      type="button"
                      className={`btn ${filterStatus === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setFilterStatus('PENDING')}
                    >
                      Pending <span className="badge bg-light text-dark ms-2">{statusCounts.PENDING}</span>
                    </button>
                    <button
                      type="button"
                      className={`btn ${filterStatus === 'APPROVED' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFilterStatus('APPROVED')}
                    >
                      Approved <span className="badge bg-light text-dark ms-2">{statusCounts.APPROVED}</span>
                    </button>
                    <button
                      type="button"
                      className={`btn ${filterStatus === 'REJECTED' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setFilterStatus('REJECTED')}
                    >
                      Rejected <span className="badge bg-light text-dark ms-2">{statusCounts.REJECTED}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-5">
          <div className="card shadow-sm">
            <div className="card-body py-5">
              <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
              <h5 className="text-muted">No custom orders found</h5>
              <p className="text-muted">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No orders have been placed yet'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Product</th>
                    <th>Material</th>
                    <th>Cost</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end" style={{ width: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    return (
                      <tr key={order.id} className={order.status === 'PENDING' ? 'table-warning' : ''}>
                        <td className="fw-bold">{order.id}</td>
                        <td>
                          <span className="badge bg-light text-dark">{order.orderNumber || order.id}</span>
                        </td>
                        <td>
                          <div className="fw-semibold">{order.customerName || 'N/A'}</div>
                          <small className="text-muted d-block" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {order.address}
                          </small>
                        </td>
                        <td>
                          <i className="fas fa-phone text-primary me-1"></i>
                          {order.mobileNumber || '-'}
                        </td>
                        <td>
                          <i className="fas fa-cube text-info me-1"></i>
                          {order.productType || '-'}
                        </td>
                        <td>
                          <span className="badge bg-secondary">{order.materialType || '-'}</span>
                        </td>
                        <td>
                          <strong className="text-success">Rs. {order.estimatedCost ? order.estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</strong>
                        </td>
                        <td>
                          <span className={`badge ${statusBadge.class} d-flex align-items-center`} style={{ width: 'fit-content' }}>
                            <i className={`${statusBadge.icon} me-1`}></i>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">{formatDate(order.createdAt)}</small>
                        </td>
                        <td className="text-end">
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setSelectedOrder(order)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {order.status === 'PENDING' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleApprove(order.id)}
                                  title="Approve Order"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleReject(order.id)}
                                  title="Reject Order"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-file-invoice me-2"></i>
                  Order Details - #{selectedOrder.orderNumber || selectedOrder.id}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedOrder(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card border-primary">
                      <div className="card-header bg-light">
                        <h6 className="mb-0"><i className="fas fa-user me-2"></i>Customer Information</h6>
                      </div>
                      <div className="card-body">
                        <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                        <p><strong>Mobile:</strong> {selectedOrder.mobileNumber}</p>
                        <p><strong>Address:</strong> {selectedOrder.address}</p>
                        {selectedOrder.description && (
                          <p><strong>Description:</strong> {selectedOrder.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-info">
                      <div className="card-header bg-light">
                        <h6 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>Order Information</h6>
                      </div>
                      <div className="card-body">
                        <p><strong>Product Type:</strong> {selectedOrder.productType}</p>
                        <p><strong>Material:</strong> {selectedOrder.materialType}</p>
                        <p><strong>Design Type:</strong> {selectedOrder.designType}</p>
                        {selectedOrder.designTemplate && (
                          <p><strong>Design Template:</strong> {selectedOrder.designTemplate}</p>
                        )}
                        <p><strong>Estimated Cost:</strong> <span className="text-success fw-bold">Rs. {selectedOrder.estimatedCost ? selectedOrder.estimatedCost.toFixed(2) : '0.00'}</span></p>
                        <p>
                          <strong>Status:</strong>{' '}
                          <span className={`badge ${getStatusBadge(selectedOrder.status).class}`}>
                            <i className={`${getStatusBadge(selectedOrder.status).icon} me-1`}></i>
                            {getStatusBadge(selectedOrder.status).text}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOrder.measurementsJson && (
                  <div className="mb-3">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0"><i className="fas fa-ruler-combined me-2"></i>Measurements</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {Object.entries(parseMeasurements(selectedOrder)).map(([key, value]) => (
                            <div key={key} className="col-md-4 mb-2">
                              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {parseAiDesign(selectedOrder) && (
                  <div className="mb-3">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0"><i className="fas fa-robot me-2"></i>AI Design Details</h6>
                      </div>
                      <div className="card-body">
                        <p><strong>Preview:</strong> {parseAiDesign(selectedOrder).preview}</p>
                        <p><strong>Material Breakdown:</strong> {parseAiDesign(selectedOrder).materialBreakdown}</p>
                        <p><strong>Estimated Time:</strong> {parseAiDesign(selectedOrder).estimatedTime}</p>
                        <p><strong>Complexity:</strong> {parseAiDesign(selectedOrder).complexity}</p>
                        {parseAiDesign(selectedOrder).costBreakdown && (
                          <div>
                            <strong>Cost Breakdown:</strong>
                            <ul className="list-unstyled ms-3">
                              <li><i className="fas fa-check text-success me-2"></i>Material: Rs. {parseAiDesign(selectedOrder).costBreakdown.material}</li>
                              <li><i className="fas fa-check text-success me-2"></i>Labor: Rs. {parseAiDesign(selectedOrder).costBreakdown.labor}</li>
                              <li><i className="fas fa-check text-success me-2"></i><strong>Total: Rs. {parseAiDesign(selectedOrder).costBreakdown.total}</strong></li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(selectedOrder.referenceImageUrl || (selectedOrder.designType === 'template' && selectedOrder.designTemplate)) && (
                  <div className="mb-3">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="fas fa-image me-2"></i>
                          {selectedOrder.designType === 'template' ? 'Design Template' : 'Reference Image'}
                        </h6>
                      </div>
                      <div className="card-body text-center">
                        {selectedOrder.referenceImageUrl ? (
                          <img
                            src={selectedOrder.referenceImageUrl}
                            alt={selectedOrder.designType === 'template' ? `${selectedOrder.productType} - ${selectedOrder.designTemplate} Design` : 'Reference Image'}
                            className="img-fluid rounded shadow-sm"
                            style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              // Fallback for design template images
                              if (selectedOrder.designType === 'template' && selectedOrder.productType && selectedOrder.designTemplate) {
                                const fallbackUrl = `https://via.placeholder.com/400x300/007bff/ffffff?text=${encodeURIComponent(selectedOrder.productType + ' - ' + selectedOrder.designTemplate)}`;
                                e.target.src = fallbackUrl;
                              }
                            }}
                          />
                        ) : selectedOrder.designType === 'template' && selectedOrder.designTemplate ? (
                          <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            Design Template: <strong>{selectedOrder.designTemplate}</strong>
                          </div>
                        ) : null}
                        {selectedOrder.designType === 'template' && selectedOrder.designTemplate && (
                          <p className="mt-2 mb-0">
                            <strong>Template:</strong> {selectedOrder.designTemplate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-1"><strong>Created:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    {selectedOrder.updatedAt && (
                      <p className="mb-0"><strong>Last Updated:</strong> {formatDate(selectedOrder.updatedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {selectedOrder.status === 'PENDING' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleApprove(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                    >
                      <i className="fas fa-check me-1"></i> Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleReject(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                    >
                      <i className="fas fa-times me-1"></i> Reject
                    </button>
                  </>
                )}
                {selectedOrder.status === 'CONFIRMED_BY_CUSTOMER' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      handleVerifyAndClose(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                  >
                    <i className="fas fa-check-double me-1"></i> Verify & Close
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Welders Modal */}
      {showAssignModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-users me-2"></i>
                  Assign Welders to Order
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAssignModal(null);
                    setSelectedWelders([]);
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> Please assign at least one welder before approving the order. The order will be automatically approved after assignment.
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Select Welders <span className="text-danger">*</span>
                  </label>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '10px' }}>
                    {welders.length === 0 ? (
                      <p className="text-muted text-center py-3">No active welders available</p>
                    ) : (
                      welders.map(welder => (
                        <div key={welder.id} className="form-check mb-2 p-2 border-bottom">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`welder-${welder.id}`}
                            checked={selectedWelders.includes(welder.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedWelders([...selectedWelders, welder.id]);
                              } else {
                                setSelectedWelders(selectedWelders.filter(id => id !== welder.id));
                              }
                            }}
                          />
                          <label className="form-check-label w-100" htmlFor={`welder-${welder.id}`}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{welder.fullName || 'Welder'}</strong>
                                <br />
                                <small className="text-muted">
                                  <i className="fas fa-envelope me-1"></i>{welder.email}
                                  {welder.phoneNumber && (
                                    <> | <i className="fas fa-phone me-1"></i>{welder.phoneNumber}</>
                                  )}
                                </small>
                                {welder.skills && (
                                  <div className="mt-1">
                                    <small className="text-primary">
                                      <i className="fas fa-tools me-1"></i>
                                      {welder.skills.split(',').slice(0, 3).join(', ')}
                                      {welder.skills.split(',').length > 3 && '...'}
                                    </small>
                                  </div>
                                )}
                                {welder.experience && (
                                  <small className="text-muted">
                                    <i className="fas fa-calendar-alt me-1"></i>
                                    {welder.experience} years experience
                                  </small>
                                )}
                              </div>
                              <span className={`badge ${welder.status === 'ACTIVE' ? 'bg-success' : 'bg-info'}`}>
                                {welder.status}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedWelders.length > 0 && (
                    <div className="mt-2">
                      <small className="text-success">
                        <i className="fas fa-check-circle me-1"></i>
                        {selectedWelders.length} welder(s) selected
                      </small>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAssignModal(null);
                    setSelectedWelders([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAssignWelders(showAssignModal)}
                  disabled={selectedWelders.length === 0}
                >
                  <i className="fas fa-check me-1"></i>
                  Assign & Approve Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOrdersPage;
