// src/components/AdminPanel/RecentActivity.js
import React, { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../../services/customOrderService';
import { ErrorMessageToast } from '../../../utils/Tostify.util';

const RecentActivity = ({ setActiveMenu }) => {
  const [loading, setLoading] = useState(true);
  const [recentCustomOrders, setRecentCustomOrders] = useState([]);
  const [recentMaterialRequests, setRecentMaterialRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      
      if (data) {
        setRecentCustomOrders(data.recentCustomOrders || []);
        setRecentMaterialRequests(data.recentMaterialRequests || []);
      }
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'bg-warning',
      'APPROVED': 'bg-info',
      'IN_PROGRESS': 'bg-primary',
      'COMPLETED': 'bg-success',
      'READY_FOR_DELIVERY': 'bg-success',
      'CONFIRMED_BY_CUSTOMER': 'bg-success',
      'CLOSED': 'bg-secondary',
      'REJECTED': 'bg-danger',
      'FULFILLED': 'bg-success'
    };
    
    const statusClass = statusMap[status] || 'bg-primary';
    return `badge ${statusClass}`;
  };

  const formatStatus = (status) => {
    return status ? status.replace(/_/g, ' ') : 'Unknown';
  };

  if (loading) {
    return (
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {/* Recent Custom Orders */}
      <div className="col-xl-6 col-lg-12 mb-4">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center border-0 pb-0">
            <div className="d-flex align-items-center">
              <h5 className="mb-0 fw-bold me-2">Recent Custom Orders</h5>
              {recentCustomOrders.length > 0 && (
                <span className="badge bg-primary">{recentCustomOrders.length}</span>
              )}
            </div>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => setActiveMenu('custom-orders')}
            >
              View All
            </button>
          </div>
          <div className="card-body">
            {recentCustomOrders.length === 0 ? (
              <p className="text-muted text-center mb-0">No recent custom orders</p>
            ) : (
              recentCustomOrders.map((order) => (
                <div className="d-flex align-items-center mb-3 pb-3 border-bottom" key={order.id}>
                  <div className="bg-primary bg-opacity-10 text-primary rounded p-2 me-3">
                    <i className="fas fa-tools"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold">#{order.orderNumber || order.id} - {order.product || 'Custom Product'}</h6>
                    <small className="text-muted">
                      {order.customer || 'Unknown'} • {formatTimeAgo(order.createdAt)}
                    </small>
                  </div>
                  <span className={getStatusBadge(order.status)}>{formatStatus(order.status)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Material Requests */}
      <div className="col-xl-6 col-lg-12 mb-4">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center border-0 pb-0">
            <h5 className="mb-0 fw-bold">Recent Material Requests</h5>
            <button 
              className="btn btn-sm btn-outline-warning"
              onClick={() => setActiveMenu('material-requests')}
            >
              View All
            </button>
          </div>
          <div className="card-body">
            {recentMaterialRequests.length === 0 ? (
              <p className="text-muted text-center mb-0">No recent material requests</p>
            ) : (
              recentMaterialRequests.map((request) => (
                <div className="d-flex align-items-center mb-3 pb-3 border-bottom" key={request.id}>
                  <div className="bg-warning bg-opacity-10 text-warning rounded p-2 me-3">
                    <i className="fas fa-boxes"></i>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-bold">{request.materialName}</h6>
                    <small className="text-muted">
                      {request.welderName || 'Unknown'} • {request.quantity} {request.unit || ''} • {formatTimeAgo(request.createdAt)}
                    </small>
                  </div>
                  <span className={getStatusBadge(request.status)}>{formatStatus(request.status)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;