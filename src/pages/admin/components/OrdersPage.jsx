// src/components/AdminPanel/OrdersPage.js
import React, { useEffect, useState } from 'react';
import { getAllOrders } from '../../../services/orderService';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const parseItems = (order) => {
    try {
      return JSON.parse(order.itemsJson || '[]');
    } catch {
      return [];
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <div>
          <h1 className="h2 fw-bold">Order Management</h1>
          <p className="text-muted">View and manage customer orders and deliveries.</p>
        </div>
        <button className="btn btn-outline-secondary" onClick={fetchOrders}>
          <i className="fas fa-sync-alt me-2"></i>Refresh
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-receipt fs-1 text-muted mb-3"></i>
              <h5>No orders yet</h5>
              <p className="text-muted">New orders will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        <div className="fw-semibold">{order.customerName || 'N/A'}</div>
                        <small className="text-muted">{order.customerEmail}</small>
                      </td>
                      <td>{order.paymentMethod}</td>
                      <td>
                        <span className={`badge ${order.paymentStatus === 'COMPLETED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {order.paymentStatus || 'PENDING'}
                        </span>
                      </td>
                      <td>Rs. {Number(order.totalAmount || 0).toFixed(2)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <Modal title={`Order #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)}>
          <div className="mb-3">
            <h6 className="fw-bold">Customer</h6>
            <p className="mb-1">{selectedOrder.customerName}</p>
            <p className="text-muted">{selectedOrder.customerEmail}</p>
          </div>
          <div className="mb-3">
            <h6 className="fw-bold">Delivery Details</h6>
            {selectedOrder.deliveryInfo ? (
              <ul className="list-unstyled text-muted mb-0">
                <li>{selectedOrder.deliveryInfo.address}</li>
                <li>{selectedOrder.deliveryInfo.city}, {selectedOrder.deliveryInfo.state}</li>
                <li>{selectedOrder.deliveryInfo.country}</li>
                <li>{selectedOrder.deliveryInfo.phone}</li>
                {selectedOrder.deliveryInfo.landmark && <li>Landmark: {selectedOrder.deliveryInfo.landmark}</li>}
              </ul>
            ) : (
              <p className="text-muted mb-0">No delivery info</p>
            )}
          </div>
          <div className="mb-3">
            <h6 className="fw-bold">Items</h6>
            <ul className="list-group mb-3">
              {parseItems(selectedOrder).map((item, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{item.name}</div>
                    <small className="text-muted">Qty: {item.quantity}</small>
                  </div>
                  <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-3">
            <h6 className="fw-bold">Payment</h6>
            <p className="mb-1">Method: {selectedOrder.paymentMethod}</p>
            <p className="mb-1">Status: {selectedOrder.paymentStatus}</p>
            <p className="fw-bold">Total: Rs. {Number(selectedOrder.totalAmount || 0).toFixed(2)}</p>
          </div>
          <div className="text-end">
            <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;

const Modal = ({ title, onClose, children }) => (
  <div className="modal-backdrop-wrapper" style={{ position: 'fixed', inset: 0 }}>
    <div className="modal-backdrop show" style={{ zIndex: 1040 }}></div>
    <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
);