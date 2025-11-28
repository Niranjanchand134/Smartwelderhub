// components/CustomOrderReview.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomOrderById, addReviewAndRating } from '../../../services/customOrderService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';
import Header from './Header';
import Footer from './Footer';

const CustomOrderReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await getCustomOrderById(id);
      setOrder(data);
      if (data.rating) {
        setRating(data.rating);
      }
      if (data.reviewComment) {
        setReviewComment(data.reviewComment);
      }
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      ErrorMessageToast('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await addReviewAndRating(id, rating, reviewComment);
      SuccesfulMessageToast('Thank you for your review!');
      navigate('/custom-product-order');
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-fluid py-5">
        <div className="alert alert-danger">Order not found</div>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <div className="container-fluid py-6 mt-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="fas fa-star me-2"></i>
                  Rate Your Experience
                </h4>
              </div>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h5>Order #{order.orderNumber || order.id}</h5>
                  <p className="text-muted">{order.productType} - {order.materialType}</p>
                </div>

                {/* Rating Stars */}
                <div className="mb-4">
                  <label className="form-label fw-bold d-block text-center mb-3">
                    How would you rate this service? *
                  </label>
                  <div className="d-flex justify-content-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn btn-link p-0 me-2"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{ fontSize: '3rem', border: 'none', background: 'none' }}
                      >
                        <i
                          className={`fas fa-star ${
                            star <= (hoverRating || rating)
                              ? 'text-warning'
                              : 'text-muted'
                          }`}
                        ></i>
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center mt-2">
                      <strong>
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                      </strong>
                    </p>
                  )}
                </div>

                {/* Review Comment */}
                <div className="mb-4">
                  <label className="form-label fw-bold">
                    <i className="fas fa-comment me-2"></i>
                    Your Review (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    rows="6"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this custom order. What did you like? Any suggestions for improvement?"
                  />
                  <small className="text-muted">Your feedback helps us improve our services</small>
                </div>

                {/* Order Summary */}
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <h6 className="card-title">Order Summary</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Product:</strong> {order.productType}</p>
                        <p className="mb-1"><strong>Material:</strong> {order.materialType}</p>
                        <p className="mb-0"><strong>Total Cost:</strong> Rs. {(order.totalAmount || order.estimatedCost || 0).toLocaleString()}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1"><strong>Status:</strong> 
                          <span className="badge bg-success ms-2">Completed</span>
                        </p>
                        <p className="mb-0"><strong>Completed:</strong> {order.completionDate ? new Date(order.completionDate).toLocaleDateString() : '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmitReview}
                    disabled={submitting || rating === 0}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit Review
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/Services')}
                    disabled={submitting}
                  >
                    Skip for Now
                  </button>
                </div>
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

export default CustomOrderReview;

