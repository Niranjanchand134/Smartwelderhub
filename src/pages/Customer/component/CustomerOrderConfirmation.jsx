// components/CustomerOrderConfirmation.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCustomOrderById, customerConfirm, customerRaiseIssue, updatePaymentInfo, updatePaymentStatus } from '../../../services/customOrderService';
import { initiateEsewaPayment } from '../../../services/paymentService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';
import Footer from './Footer';
import Header from './Header';

const CustomerOrderConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issueDescription, setIssueDescription] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [requiresInstallation, setRequiresInstallation] = useState(false);
  const [installationCharges, setInstallationCharges] = useState(500);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getCustomOrderById(id);
      setOrder(data);
      if (data.status === 'CONFIRMED_BY_CUSTOMER') {
        setOrderConfirmed(true);
        if (data.paymentMethod) {
          setPaymentMethod(data.paymentMethod.toLowerCase());
        }
        if (data.additionalCharges && data.additionalCharges > 0) {
          setRequiresInstallation(true);
          setInstallationCharges(data.additionalCharges);
        }
      }
    } catch (error) {
      ErrorMessageToast(error.message || t('orderConfirmation.failedToLoadOrder'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm(t('orderConfirmation.satisfiedConfirm'))) {
      return;
    }

    setSubmitting(true);
    try {
      await customerConfirm(id);
      setOrderConfirmed(true);
      SuccesfulMessageToast(t('orderConfirmation.orderConfirmedSuccess'));
      await fetchOrder();
    } catch (error) {
      ErrorMessageToast(error.message || t('orderConfirmation.failedToConfirm'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentProceed = async () => {
    if (!paymentMethod) {
      ErrorMessageToast(t('orderConfirmation.pleaseSelectPaymentMethod'));
      return;
    }

    setSubmitting(true);
    try {
      const baseAmount = order.totalAmount || order.estimatedCost || 0;
      const additionalCharges = requiresInstallation ? installationCharges : 0;
      const totalAmount = baseAmount + additionalCharges;

      await updatePaymentInfo(id, paymentMethod.toUpperCase(), additionalCharges);

      // Set payment status based on payment method
      if (paymentMethod === 'cod') {
        await updatePaymentStatus(id, 'PENDING');
      } else if (paymentMethod === 'esewa') {
        // Payment status will be updated to PAID after eSewa verification
        await updatePaymentStatus(id, 'PENDING');
      }

      if (paymentMethod === 'esewa') {
        // Prepare order data for eSewa payment
        const orderData = {
          orderId: id,
          totalAmount: totalAmount,
          customerName: order.customerName,
          customerEmail: order.mobileNumber || order.customerEmail
        };

        // Initiate eSewa payment
        const response = await initiateEsewaPayment(orderData);
        const paymentRequest = response;

        // Create form and submit to eSewa
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        // Map all required eSewa fields
        const fields = {
          amount: String(paymentRequest.amount || '0'),
          tax_amount: String(paymentRequest.tax_amount || '0'),
          total_amount: String(paymentRequest.total_amount || '0'),
          transaction_uuid: String(paymentRequest.transaction_uuid || ''),
          product_code: String(paymentRequest.product_code || 'EPAYTEST'),
          product_service_charge: String(paymentRequest.product_service_charge || '0'),
          product_delivery_charge: String(paymentRequest.product_delivery_charge || '0'),
          success_url: String(paymentRequest.success_url || 'http://localhost:5173/payment/success'),
          failure_url: String(paymentRequest.failure_url || 'http://localhost:5173/payment/failure'),
          signed_field_names: String(paymentRequest.signed_field_names || 'total_amount,transaction_uuid,product_code'),
          signature: String(paymentRequest.signature || ''),
        };

        // Add all fields as hidden inputs
        for (const [key, value] of Object.entries(fields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }

        // Store order ID in sessionStorage for verification after payment
        sessionStorage.setItem('pendingEsewaOrderId', id.toString());
        sessionStorage.setItem('pendingEsewaOrderType', 'custom');

        // Submit form to eSewa
        document.body.appendChild(form);
        form.submit();
      } else {
        // Refresh order to get updated payment status
        await fetchOrder();
        SuccesfulMessageToast(t('orderConfirmation.orderConfirmedCod'));
        // Stay on page to show payment status - user can navigate away manually
      }
    } catch (error) {
      ErrorMessageToast(error.message || t('orderConfirmation.failedToProcessPayment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRaiseIssue = async () => {
    if (!issueDescription.trim()) {
      ErrorMessageToast(t('orderConfirmation.pleaseDescribeIssue'));
      return;
    }

    setSubmitting(true);
    try {
      await customerRaiseIssue(id, issueDescription);
      SuccesfulMessageToast(t('orderConfirmation.issueRaisedSuccess'));
      navigate('/Services');
    } catch (error) {
      ErrorMessageToast(error.message || t('orderConfirmation.failedToRaiseIssue'));
    } finally {
      setSubmitting(false);
    }
  };

  const parseCompletionPhotos = () => {
    try {
      return JSON.parse(order.completionPhotosJson || '[]');
    } catch {
      return [];
    }
  };

  const parseMeasurements = () => {
    try {
      return JSON.parse(order.measurementsJson || '{}');
    } catch {
      return {};
    }
  };

  const parseAiDesign = () => {
    try {
      return JSON.parse(order.aiDesignJson || '{}');
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('orderConfirmation.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger">{t('orderConfirmation.orderNotFound')}</div>
      </div>
    );
  }

  const canConfirm = order.status === 'COMPLETED' || order.status === 'READY_FOR_DELIVERY';
  const isConfirmed = order.status === 'CONFIRMED_BY_CUSTOMER' || orderConfirmed;
  const completionPhotos = parseCompletionPhotos();
  const measurements = parseMeasurements();
  const aiDesign = parseAiDesign();
  
  const baseAmount = order.totalAmount || order.estimatedCost || 0;
  const installationFee = requiresInstallation ? installationCharges : 0;
  const finalTotal = baseAmount + installationFee;
  
  // Check if payment is already completed or pending
  const isPaymentCompleted = order.paymentStatus === 'PAID' || order.paymentStatus === 'COMPLETED';
  const isPaymentPending = order.paymentStatus === 'PENDING' && order.paymentMethod;
  const hasPaymentMethod = order.paymentMethod && (isPaymentCompleted || isPaymentPending);
  
  // Show payment form only if payment method is not set yet
  const showPaymentForm = !hasPaymentMethod;

  return (
    <>
    <Header/>
    <div className="container-fluid py-6 mt-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="display-6 text-uppercase mb-3">{t('orderConfirmation.title')}</h1>
          <p className="lead">{t('orderConfirmation.subtitle')}</p>
        </div>

        <div className="row">
          {/* Order Details */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-file-invoice me-2"></i>
                  {t('orderConfirmation.orderNumber')}{order.orderNumber || order.id}
                </h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="text-muted">{t('orderConfirmation.productInformation')}</h6>
                    <p><strong>{t('orderConfirmation.productType')}:</strong> {order.productType}</p>
                    <p><strong>{t('orderConfirmation.material')}:</strong> {order.materialType}</p>
                    <p><strong>{t('orderConfirmation.design')}:</strong> {order.designTemplate || 'Custom'}</p>
                    {measurements.height && (
                      <p><strong>{t('orderConfirmation.size')}:</strong> {measurements.height}ft × {measurements.width}ft × {measurements.thickness}mm</p>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">{t('orderConfirmation.costInformation')}</h6>
                    <p><strong>{t('orderConfirmation.estimatedCost')}:</strong> Rs. {order.estimatedCost ? order.estimatedCost.toLocaleString() : '0'}</p>
                    {order.additionalCharges > 0 && (
                      <p><strong>{t('orderConfirmation.additionalCharges')}:</strong> Rs. {order.additionalCharges.toLocaleString()}</p>
                    )}
                    <p><strong>{t('orderConfirmation.totalAmount')}:</strong> <span className="text-success fw-bold">Rs. {(order.totalAmount || order.estimatedCost || 0).toLocaleString()}</span></p>
                  </div>
                </div>

                {order.welderNotes && (
                  <div className="alert alert-info">
                    <h6><i className="fas fa-sticky-note me-2"></i>{t('orderConfirmation.welderNotes')}:</h6>
                    <p className="mb-0">{order.welderNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Completion Photos */}
            {completionPhotos.length > 0 && (
              <div className="card shadow-sm mt-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-images me-2"></i>
                    {t('orderConfirmation.completionPhotos')}
                  </h5>
                </div>
                <div className="card-body">
                  {/* Image Gallery */}
                  <div className="row g-4">
                    {completionPhotos.map((photo, index) => (
                      <div key={index} className="col-md-4 col-sm-6">
                        <div 
                          className="card h-100 border-0 shadow-sm"
                          style={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '';
                          }}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          {failedImages.has(index) ? (
                            <div className="d-flex align-items-center justify-content-center bg-light" style={{ height: '250px', minHeight: '250px' }}>
                              <div className="text-center text-muted">
                                <i className="fas fa-image fa-3x mb-2"></i>
                                <br />
                                <small>{t('orderConfirmation.imageNotAvailable')}</small>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="position-relative overflow-hidden"
                              style={{ 
                                height: '250px',
                                backgroundColor: '#f8f9fa'
                              }}
                            >
                              <img
                                src={photo}
                                alt={`Completion ${index + 1}`}
                                className="w-100 h-100"
                                style={{ 
                                  objectFit: 'cover'
                                }}
                                onError={() => {
                                  setFailedImages(prev => new Set([...prev, index]));
                                }}
                              />
                              <div 
                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                style={{
                                  background: 'rgba(0,0,0,0)',
                                  transition: 'background 0.3s ease',
                                  pointerEvents: 'none'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(0,0,0,0)';
                                }}
                              >
                                <div 
                                  className="text-white text-center"
                                  style={{
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease'
                                  }}
                                >
                                  <i className="fas fa-search-plus fa-2x mb-2"></i>
                                  <p className="mb-0 small">Click to view fullscreen</p>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="card-body bg-white">
                            <h6 className="card-title mb-0">
                              <i className="fas fa-camera me-2 text-primary"></i>
                              {t('orderConfirmation.photo')} {index + 1}
                            </h6>
                            <small className="text-muted">{t('orderConfirmation.clickToViewFullscreen')}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Image Counter */}
                  <div className="text-center mt-4">
                    <span className="badge bg-primary px-3 py-2">
                      <i className="fas fa-images me-2"></i>
                      {completionPhotos.length} {completionPhotos.length === 1 ? t('orderConfirmation.photoAvailable') : t('orderConfirmation.photosAvailable')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Screen Image Modal */}
            {selectedImageIndex !== null && completionPhotos.length > 0 && (
              <div 
                className="modal show d-block" 
                style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1050 }}
                onClick={() => setSelectedImageIndex(null)}
              >
                <div className="modal-dialog modal-fullscreen">
                  <div className="modal-content bg-dark border-0">
                    <div className="modal-header border-0">
                      <h5 className="modal-title text-white">
                        <i className="fas fa-images me-2"></i>
                        {t('orderConfirmation.completionPhotoViewer')}
                      </h5>
                      <button 
                        type="button" 
                        className="btn-close btn-close-white" 
                        onClick={() => setSelectedImageIndex(null)}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div 
                      className="modal-body d-flex align-items-center justify-content-center position-relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!failedImages.has(selectedImageIndex) && (
                        <>
                          <img
                            src={completionPhotos[selectedImageIndex]}
                            alt={`Completion Photo ${selectedImageIndex + 1}`}
                            className="img-fluid"
                            style={{ 
                              maxHeight: '90vh',
                              maxWidth: '90vw',
                              borderRadius: '10px',
                              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                              cursor: 'zoom-in'
                            }}
                          />
                          {/* Navigation Arrows */}
                          {completionPhotos.length > 1 && (
                            <>
                              <button
                                className="btn btn-light btn-lg position-absolute start-0 top-50 translate-middle-y ms-3 rounded-circle"
                                style={{ zIndex: 1051, width: '50px', height: '50px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prevIndex = selectedImageIndex > 0 ? selectedImageIndex - 1 : completionPhotos.length - 1;
                                  setSelectedImageIndex(prevIndex);
                                }}
                              >
                                <i className="fas fa-chevron-left"></i>
                              </button>
                              <button
                                className="btn btn-light btn-lg position-absolute end-0 top-50 translate-middle-y me-3 rounded-circle"
                                style={{ zIndex: 1051, width: '50px', height: '50px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextIndex = selectedImageIndex < completionPhotos.length - 1 ? selectedImageIndex + 1 : 0;
                                  setSelectedImageIndex(nextIndex);
                                }}
                              >
                                <i className="fas fa-chevron-right"></i>
                              </button>
                            </>
                          )}
                          {/* Image Counter */}
                          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
                            <span className="badge bg-primary px-4 py-2 fs-6">
                              <i className="fas fa-image me-2"></i>
                              {selectedImageIndex + 1} / {completionPhotos.length}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Confirmation Actions */}
          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-check-circle me-2"></i>
                  {isConfirmed ? t('orderConfirmation.paymentAndServices') : t('orderConfirmation.confirmation')}
                </h5>
              </div>
              <div className="card-body">
                {!isConfirmed && canConfirm ? (
                  <>
                    {!showIssueForm ? (
                      <>
                        <div className="alert alert-success">
                          <i className="fas fa-info-circle me-2"></i>
                          {t('orderConfirmation.reviewCompletedWork')}
                        </div>
                        <button
                          className="btn btn-success btn-lg w-100 mb-3"
                          onClick={handleConfirm}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              {t('orderConfirmation.confirming')}
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check me-2"></i>
                              {t('orderConfirmation.confirmAndAccept')}
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-danger btn-lg w-100"
                          onClick={() => setShowIssueForm(true)}
                          disabled={submitting}
                        >
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          {t('orderConfirmation.raiseIssue')}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="alert alert-warning">
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          {t('orderConfirmation.describeIssue')}
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">{t('orderConfirmation.issueDescription')} *</label>
                          <textarea
                            className="form-control"
                            rows="5"
                            value={issueDescription}
                            onChange={(e) => setIssueDescription(e.target.value)}
                            placeholder={t('orderConfirmation.describeIssuePlaceholder')}
                            required
                          />
                        </div>
                        <button
                          className="btn btn-danger btn-lg w-100 mb-2"
                          onClick={handleRaiseIssue}
                          disabled={submitting || !issueDescription.trim()}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              {t('orderConfirmation.submitting')}
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-2"></i>
                              {t('orderConfirmation.submitIssue')}
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-secondary btn-lg w-100"
                          onClick={() => {
                            setShowIssueForm(false);
                            setIssueDescription('');
                          }}
                          disabled={submitting}
                        >
                          {t('orderConfirmation.cancel')}
                        </button>
                      </>
                    )}
                  </>
                ) : isConfirmed ? (
                  <>
                    {hasPaymentMethod ? (
                      <>
                        {/* Payment Status Display */}
                        {isPaymentCompleted ? (
                          <div className="alert alert-success mb-4">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-check-circle fa-2x me-3"></i>
                              <div>
                                <h5 className="mb-1 fw-bold">{t('orderConfirmation.paymentCompleted')}</h5>
                                <p className="mb-0">
                                  {t('orderConfirmation.paymentCompletedDesc', { method: order.paymentMethod === 'ESEWA' || order.paymentMethod === 'esewa' ? 'eSewa' : order.paymentMethod })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : isPaymentPending && (order.paymentMethod === 'COD' || order.paymentMethod === 'cod') ? (
                          <div className="alert alert-warning mb-4">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-clock fa-2x me-3"></i>
                              <div>
                                <h5 className="mb-1 fw-bold">{t('orderConfirmation.codPending')}</h5>
                                <p className="mb-0">
                                  {t('orderConfirmation.codPendingDesc')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : isPaymentPending ? (
                          <div className="alert alert-info mb-4">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-hourglass-half fa-2x me-3"></i>
                              <div>
                                <h5 className="mb-1 fw-bold">{t('orderConfirmation.paymentPending')}</h5>
                                <p className="mb-0">
                                  {t('orderConfirmation.paymentPendingDesc')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        
                        {/* Order Summary for Completed/Pending Payments */}
                        <div className="card border-primary mb-4">
                          <div className="card-header bg-primary text-white">
                            <h6 className="mb-0">
                              <i className="fas fa-receipt me-2"></i>
                              {t('orderConfirmation.orderSummary')}
                            </h6>
                          </div>
                          <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                              <span>{t('orderConfirmation.baseAmount')}:</span>
                              <strong>Rs. {baseAmount.toLocaleString()}</strong>
                            </div>
                            {order.additionalCharges && order.additionalCharges > 0 && (
                              <div className="d-flex justify-content-between mb-2">
                                <span>{t('orderConfirmation.installationServiceFee')}:</span>
                                <strong>Rs. {order.additionalCharges.toLocaleString()}</strong>
                              </div>
                            )}
                            <hr />
                            <div className="d-flex justify-content-between">
                              <span className="fw-bold">{t('orderConfirmation.totalAmount')}:</span>
                              <strong className="text-success fs-5">Rs. {(order.totalAmount || baseAmount).toLocaleString()}</strong>
                            </div>
                            <div className="mt-3 pt-3 border-top">
                              <div className="d-flex justify-content-between">
                                <span>{t('orderConfirmation.paymentMethod')}:</span>
                                <strong>{order.paymentMethod === 'COD' || order.paymentMethod === 'cod' ? t('orderConfirmation.cashOnDelivery') : order.paymentMethod === 'ESEWA' || order.paymentMethod === 'esewa' ? t('orderConfirmation.esewaPayment') : order.paymentMethod}</strong>
                              </div>
                              <div className="d-flex justify-content-between mt-2">
                                <span>{t('orderConfirmation.paymentStatus')}:</span>
                                <span className={`badge ${isPaymentCompleted ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {isPaymentCompleted ? t('orderConfirmation.paid') : t('orderConfirmation.pending')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : showPaymentForm ? (
                      <>
                        <div className="alert alert-success mb-4">
                          <i className="fas fa-check-circle me-2"></i>
                          {t('orderConfirmation.orderConfirmed')}
                        </div>

                        {/* Installation/Setup Service */}
                    <div className="card border mb-4">
                      <div className="card-body">
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="installationService"
                            checked={requiresInstallation}
                            onChange={(e) => setRequiresInstallation(e.target.checked)}
                            disabled={submitting}
                          />
                          <label className="form-check-label fw-bold" htmlFor="installationService">
                            <i className="fas fa-tools me-2 text-primary"></i>
                            {t('orderConfirmation.installationService')}
                          </label>
                        </div>
                        {requiresInstallation && (
                          <div className="alert alert-info mb-0">
                            <small>
                              <i className="fas fa-info-circle me-2"></i>
                              {t('orderConfirmation.installationServiceDesc')}
                              <br />
                              <strong>{t('orderConfirmation.serviceCharge')}: Rs. {installationCharges.toLocaleString()}</strong>
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">
                        <i className="fas fa-credit-card me-2"></i>
                        {t('orderConfirmation.selectPaymentMethod')}
                      </h6>
                      <div className="d-flex gap-3 mb-3">
                        <div className="text-center flex-fill">
                          <div 
                            className="border p-3 mb-2 rounded" 
                            style={{ 
                              cursor: 'pointer',
                              borderColor: paymentMethod === 'cod' ? '#ffc107' : '#dee2e6',
                              borderWidth: paymentMethod === 'cod' ? '3px' : '1px',
                              backgroundColor: paymentMethod === 'cod' ? '#fff3cd' : '#fff'
                            }}
                            onClick={() => setPaymentMethod('cod')}
                          >
                            <i className="fas fa-money-bill-wave fa-3x text-warning"></i>
                          </div>
                          <div
                            className={`rounded p-2 ${
                              paymentMethod === 'cod'
                                ? "bg-warning text-white fw-bold"
                                : "bg-light text-dark border"
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setPaymentMethod('cod')}
                          >
                            {t('orderConfirmation.cashOnDelivery')}
                          </div>
                        </div>
                        <div className="text-center flex-fill">
                          <div 
                            className="border p-3 mb-2 rounded" 
                            style={{ 
                              cursor: 'pointer',
                              borderColor: paymentMethod === 'esewa' ? '#28a745' : '#dee2e6',
                              borderWidth: paymentMethod === 'esewa' ? '3px' : '1px',
                              backgroundColor: paymentMethod === 'esewa' ? '#d4edda' : '#fff'
                            }}
                            onClick={() => setPaymentMethod('esewa')}
                          >
                            <i className="fas fa-mobile-alt fa-3x text-success"></i>
                          </div>
                          <div
                            className={`rounded p-2 ${
                              paymentMethod === 'esewa'
                                ? "bg-success text-white fw-bold"
                                : "bg-light text-dark border"
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setPaymentMethod('esewa')}
                          >
                            {t('orderConfirmation.esewaPayment')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="card border-primary mb-4">
                      <div className="card-header bg-primary text-white">
                        <h6 className="mb-0">
                          <i className="fas fa-receipt me-2"></i>
                          {t('orderConfirmation.orderSummary')}
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span>{t('orderConfirmation.baseAmount')}:</span>
                          <strong>Rs. {baseAmount.toLocaleString()}</strong>
                        </div>
                        {requiresInstallation && (
                          <div className="d-flex justify-content-between mb-2">
                            <span>{t('orderConfirmation.installationServiceFee')}:</span>
                            <strong>Rs. {installationCharges.toLocaleString()}</strong>
                          </div>
                        )}
                        <hr />
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold">{t('orderConfirmation.totalAmount')}:</span>
                          <strong className="text-success fs-5">Rs. {finalTotal.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                      className="btn btn-primary btn-lg w-100"
                      onClick={handlePaymentProceed}
                      disabled={submitting || !paymentMethod}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          {t('orderConfirmation.processing')}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-arrow-right me-2"></i>
                          {t('orderConfirmation.proceedToPayment')}
                        </>
                      )}
                    </button>
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    {order.status === 'CONFIRMED_BY_CUSTOMER' && (
                      <p className="mb-0">{t('orderConfirmation.alreadyConfirmed')}</p>
                    )}
                    {order.status === 'ISSUE_RAISED' && (
                      <p className="mb-0">{t('orderConfirmation.issueRaised')}</p>
                    )}
                    {order.status === 'CLOSED' && (
                      <p className="mb-0">{t('orderConfirmation.orderClosed')}</p>
                    )}
                    {!['CONFIRMED_BY_CUSTOMER', 'ISSUE_RAISED', 'CLOSED'].includes(order.status) && (
                      <p className="mb-0">{t('orderConfirmation.notReadyForConfirmation')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CustomerOrderConfirmation;

