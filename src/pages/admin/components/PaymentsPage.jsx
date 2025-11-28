// src/components/AdminPanel/PaymentsPage.js
import React, { useState, useEffect } from 'react';
import { getAllCustomOrders } from '../../../services/customOrderService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';

const PaymentsPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllCustomOrders();
            // Filter orders that are confirmed or closed (ready for payment)
            const paymentOrders = data.filter(order => 
                order.status === 'CONFIRMED_BY_CUSTOMER' || 
                order.status === 'CLOSED' ||
                order.paymentStatus === 'PENDING' ||
                order.paymentStatus === 'PAID' ||
                order.paymentStatus === 'PARTIAL'
            );
            setOrders(paymentOrders || []);
        } catch (error) {
            ErrorMessageToast(error.message || 'Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const getPaymentStatusBadge = (status) => {
        const config = {
            PAID: { class: 'bg-success text-white', text: 'Paid', icon: 'fas fa-check-circle' },
            PENDING: { class: 'bg-warning text-dark', text: 'Pending', icon: 'fas fa-clock' },
            PARTIAL: { class: 'bg-info text-white', text: 'Partial', icon: 'fas fa-hourglass-half' },
            REFUNDED: { class: 'bg-secondary text-white', text: 'Refunded', icon: 'fas fa-undo' }
        };
        return config[status] || { class: 'bg-light text-dark', text: status || 'Pending', icon: 'fas fa-question' };
    };

    const getOrderStatusBadge = (status) => {
        const config = {
            CONFIRMED_BY_CUSTOMER: { class: 'bg-info text-white', text: 'Confirmed' },
            CLOSED: { class: 'bg-success text-white', text: 'Closed' },
            COMPLETED: { class: 'bg-primary text-white', text: 'Completed' }
        };
        return config[status] || { class: 'bg-light text-dark', text: status };
    };

    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(order => order.paymentStatus === filterStatus);

    const summary = {
        totalEarnings: orders
            .filter(o => o.paymentStatus === 'PAID')
            .reduce((sum, o) => sum + (o.totalAmount || o.estimatedCost || 0), 0),
        pendingPayments: orders
            .filter(o => o.paymentStatus === 'PENDING' || !o.paymentStatus)
            .reduce((sum, o) => sum + (o.totalAmount || o.estimatedCost || 0), 0),
        thisMonth: orders
            .filter(o => {
                if (!o.paymentDate) return false;
                const paymentDate = new Date(o.paymentDate);
                const now = new Date();
                return paymentDate.getMonth() === now.getMonth() && 
                       paymentDate.getFullYear() === now.getFullYear() &&
                       o.paymentStatus === 'PAID';
            })
            .reduce((sum, o) => sum + (o.totalAmount || o.estimatedCost || 0), 0),
        lastMonth: orders
            .filter(o => {
                if (!o.paymentDate) return false;
                const paymentDate = new Date(o.paymentDate);
                const now = new Date();
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
                return paymentDate.getMonth() === lastMonth.getMonth() && 
                       paymentDate.getFullYear() === lastMonth.getFullYear() &&
                       o.paymentStatus === 'PAID';
            })
            .reduce((sum, o) => sum + (o.totalAmount || o.estimatedCost || 0), 0)
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString();
    };

    return (
        <div>
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
                <div>
                    <h1 className="h2 fw-bold">Payment Management</h1>
                    <p className="text-muted">Manage and track all payment transactions</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-primary" onClick={fetchOrders}>
                        <i className="fas fa-sync-alt me-2"></i>Refresh
                    </button>
                </div>
            </div>

            {/* Payment Summary Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Total Earnings
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        Rs. {summary.totalEarnings.toLocaleString()}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-rupee-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Pending Payments
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        Rs. {summary.pendingPayments.toLocaleString()}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clock fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        This Month
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        Rs. {summary.thisMonth.toLocaleString()}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-calendar fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Last Month
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        Rs. {summary.lastMonth.toLocaleString()}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-chart-bar fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                    <div className="btn-group" role="group">
                        <button
                            className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            All Payments
                        </button>
                        <button
                            className={`btn btn-sm ${filterStatus === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => setFilterStatus('PENDING')}
                        >
                            Pending
                        </button>
                        <button
                            className={`btn btn-sm ${filterStatus === 'PAID' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setFilterStatus('PAID')}
                        >
                            Paid
                        </button>
                        <button
                            className={`btn btn-sm ${filterStatus === 'PARTIAL' ? 'btn-info' : 'btn-outline-info'}`}
                            onClick={() => setFilterStatus('PARTIAL')}
                        >
                            Partial
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Details Table */}
            {loading ? (
                <div className="card shadow-sm border-0">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading payment records...</p>
                    </div>
                </div>
            ) : (
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <h6 className="m-0 font-weight-bold text-primary">
                            <i className="fas fa-list me-2"></i>Payment Details
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order No</th>
                                        <th>Customer</th>
                                        <th>Product</th>
                                        <th>Amount</th>
                                        <th>Payment Method</th>
                                        <th>Payment Status</th>
                                        <th>Order Status</th>
                                        <th>Invoice</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4">
                                                <i className="fas fa-inbox fa-2x text-muted mb-2"></i>
                                                <p className="text-muted mb-0">No payment records found</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map(order => {
                                            const paymentStatus = getPaymentStatusBadge(order.paymentStatus);
                                            const orderStatus = getOrderStatusBadge(order.status);
                                            return (
                                                <tr key={order.id}>
                                                    <td>
                                                        <span className="badge bg-light text-dark">
                                                            {order.orderNumber || order.id}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="fw-semibold">{order.customerName}</div>
                                                        <small className="text-muted">{order.mobileNumber}</small>
                                                    </td>
                                                    <td>{order.productType}</td>
                                                    <td>
                                                        <strong className="text-success">
                                                            Rs. {(order.totalAmount || order.estimatedCost || 0).toLocaleString()}
                                                        </strong>
                                                        {order.additionalCharges > 0 && (
                                                            <div>
                                                                <small className="text-muted">
                                                                    (Base: Rs. {order.estimatedCost?.toLocaleString() || '0'} + 
                                                                    Charges: Rs. {order.additionalCharges.toLocaleString()})
                                                                </small>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">
                                                            {order.paymentMethod || 'Not Set'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${paymentStatus.class} d-flex align-items-center`} style={{ width: 'fit-content' }}>
                                                            <i className={`${paymentStatus.icon} me-1`}></i>
                                                            {paymentStatus.text}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${orderStatus.class}`}>
                                                            {orderStatus.text}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {order.invoiceNumber ? (
                                                            <span className="badge bg-info">{order.invoiceNumber}</span>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {formatDate(order.paymentDate || order.updatedAt)}
                                                        </small>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;

