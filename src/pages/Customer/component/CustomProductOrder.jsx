// components/CustomProductOrder.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
import { createCustomOrder, getAllCustomOrders, updateCustomOrder, deleteCustomOrder, cancelCustomOrder } from '../../../services/customOrderService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';

const CustomProductOrder = () => {
  const navigate = useNavigate();
  const { user, authToken } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    address: '',
    description: '',
    productType: '',
    measurements: { height: '', width: '', thickness: '' },
    materialType: '',
    designType: 'template',
    designTemplate: '',
    referenceImage: null,
    referenceImageUrl: null,
    aiDesign: null,
    estimatedCost: 0
  });

  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Check authentication when step changes (prevent direct access to steps 2-7 without login)
  useEffect(() => {
    if (step > 1 && (!authToken || !user)) {
      ErrorMessageToast('Please login to continue with your custom order');
      setStep(1); // Reset to step 1
      navigate('/login', { state: { returnTo: '/custom-product-order' } });
    }
  }, [step, authToken, user, navigate]);

  // Check authentication before proceeding
  const checkAuthAndProceed = (nextStep) => {
    if (!authToken || !user) {
      ErrorMessageToast('Please login to continue with your custom order');
      navigate('/login', { state: { returnTo: '/custom-product-order' } });
      return false;
    }
    setStep(nextStep);
    return true;
  };

  const fetchOrders = async () => {
    try {
      const data = await getAllCustomOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleEdit = (order) => {
    const measurements = order.measurementsJson ? JSON.parse(order.measurementsJson) : {};
    const aiDesign = order.aiDesignJson ? JSON.parse(order.aiDesignJson) : null;
    
    setFormData({
      customerName: order.customerName || '',
      mobileNumber: order.mobileNumber || '',
      address: order.address || '',
      description: order.description || '',
      productType: order.productType || '',
      measurements: measurements,
      materialType: order.materialType || '',
      designType: order.designType || 'template',
      designTemplate: order.designTemplate || '',
      referenceImage: null,
      aiDesign: aiDesign,
      estimatedCost: order.estimatedCost || 0
    });
    setEditingOrder(order);
    setStep(1); // Start from customer info step
  };

  const handleUpdateOrder = async () => {
    if (!formData.customerName || !formData.mobileNumber || !formData.address) {
      ErrorMessageToast('Please fill in all customer information fields');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        description: formData.description,
        productType: formData.productType,
        measurements: formData.measurements,
        materialType: formData.materialType,
        designType: formData.designType,
        designTemplate: formData.designTemplate,
        referenceImageUrl: formData.referenceImage ? URL.createObjectURL(formData.referenceImage) : editingOrder?.referenceImageUrl,
        aiDesign: formData.aiDesign,
        estimatedCost: formData.estimatedCost
      };

      const updatedOrder = await updateCustomOrder(editingOrder.id, orderPayload);
      SuccesfulMessageToast('Order updated successfully!');
      setEditingOrder(null);
      startNewOrder();
      await fetchOrders();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomOrder(id);
      SuccesfulMessageToast('Order deleted successfully!');
      setShowDeleteConfirm(null);
      await fetchOrders();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to delete order');
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelCustomOrder(id);
      SuccesfulMessageToast('Order cancelled successfully!');
      setShowCancelConfirm(null);
      await fetchOrders();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to cancel order');
    }
  };

  const handleReOrder = (order) => {
    try {
      // Parse measurements from JSON
      let measurements = { height: '', width: '', thickness: '' };
      if (order.measurementsJson) {
        try {
          measurements = JSON.parse(order.measurementsJson);
        } catch (e) {
          console.error('Failed to parse measurements:', e);
        }
      }

      // Parse AI design from JSON
      let aiDesign = null;
      if (order.aiDesignJson) {
        try {
          aiDesign = JSON.parse(order.aiDesignJson);
        } catch (e) {
          console.error('Failed to parse AI design:', e);
        }
      }

      // Populate form with cancelled order data
      setFormData({
        customerName: order.customerName || '',
        mobileNumber: order.mobileNumber || '',
        address: order.address || '',
        description: order.description || '',
        productType: order.productType || '',
        measurements: measurements,
        materialType: order.materialType || '',
        designType: order.designType || 'template',
        designTemplate: order.designTemplate || '',
        referenceImage: null, // Can't restore file, but URL is stored
        referenceImageUrl: order.referenceImageUrl || null,
        aiDesign: aiDesign,
        estimatedCost: order.estimatedCost || 0
      });

      // If AI design exists, go to review step, otherwise go to product selection
      if (aiDesign && order.productType) {
        setStep(6); // Go to AI design review step
      } else if (order.productType) {
        setStep(2); // Go to product selection step
      } else {
        setStep(1); // Start from beginning
      }

      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      SuccesfulMessageToast('Order details loaded. You can review and submit a new order.');
    } catch (error) {
      ErrorMessageToast('Failed to load order details for re-order');
      console.error('Re-order error:', error);
    }
  };

  const cancelEdit = () => {
    setEditingOrder(null);
    startNewOrder();
  };

  // Options for selection
  const productTypes = ['Gate', 'Grill', 'Window', 'Table', 'Chair', 'Custom Furniture', 'Staircase', 'Railing'];
  const materialTypes = ['MS (Mild Steel)', 'SS (Stainless Steel)', 'Iron', 'Aluminum'];
  const designTemplates = ['Modern', 'Traditional', 'Minimalist', 'Ornate', 'Industrial', 'Classic'];

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMeasurementChange = (dimension, value) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [dimension]: value
      }
    }));
  };

  // AI Design Generation Simulation
  const generateAIDesign = () => {
    // Material cost per sq.ft
    const materialCosts = {
      'MS (Mild Steel)': 120,
      'SS (Stainless Steel)': 280,
      'Iron': 180,
      'Aluminum': 220
    };
    
    // Calculate area and costs
    const height = parseFloat(formData.measurements.height) || 0;
    const width = parseFloat(formData.measurements.width) || 0;
    const thickness = parseFloat(formData.measurements.thickness) || 1;
    
    const area = height * width;
    const materialCost = area * materialCosts[formData.materialType] * thickness;
    const laborCost = area * 80; // Labor cost per sq.ft
    const totalCost = materialCost + laborCost;

    // Generate AI design preview
    const aiDesign = {
      preview: `AI-generated ${formData.productType} design in ${formData.materialType}`,
      materialBreakdown: `${area.toFixed(2)} sq.ft of ${formData.materialType} (${thickness}mm thickness)`,
      estimatedTime: area > 20 ? '5-7 days' : '3-5 days',
      complexity: area > 30 ? 'High' : area > 15 ? 'Medium' : 'Low',
      costBreakdown: {
        material: Math.round(materialCost),
        labor: Math.round(laborCost),
        total: Math.round(totalCost)
      }
    };

    setFormData(prev => ({
      ...prev,
      aiDesign: aiDesign,
      estimatedCost: totalCost
    }));
    setStep(6); // Move to cost review step
  };

  // Submit custom order
  const submitCustomOrder = async () => {
    if (!authToken || !user) {
      ErrorMessageToast('Please login to submit your custom order');
      navigate('/login', { state: { returnTo: '/custom-product-order' } });
      return;
    }

    if (!formData.customerName || !formData.mobileNumber || !formData.address) {
      ErrorMessageToast('Please fill in all customer information fields');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        description: formData.description,
        productType: formData.productType,
        measurements: formData.measurements,
        materialType: formData.materialType,
        designType: formData.designType,
        designTemplate: formData.designTemplate,
        referenceImageUrl: formData.referenceImage ? URL.createObjectURL(formData.referenceImage) : null,
        aiDesign: formData.aiDesign,
        estimatedCost: formData.estimatedCost
      };

      const savedOrder = await createCustomOrder(orderPayload);
      setCurrentOrder(savedOrder);
      setStep(7); // Move to success step
      SuccesfulMessageToast('Order submitted successfully!');
      await fetchOrders(); // Refresh orders list
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to submit order');
    } finally {
      setLoading(false);
    }
  };

  // Reset form and start over
  const startNewOrder = () => {
    setFormData({
      customerName: '',
      mobileNumber: '',
      address: '',
      description: '',
      productType: '',
      measurements: { height: '', width: '', thickness: '' },
      materialType: '',
      designType: 'template',
      designTemplate: '',
      referenceImage: null,
      referenceImageUrl: null,
      aiDesign: null,
      estimatedCost: 0
    });
    setCurrentOrder(null);
    setStep(1);
  };

  return (
    <>
    <div className="container-fluid py-6">
      <div className="container">
        <div className="text-center mx-auto wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: "800px" }}>
          <h1 className="display-6 text-uppercase mb-3">
            {editingOrder ? 'Edit Custom Product Order' : 'Custom Product Order'}
          </h1>
          <p className="mb-5">
            {editingOrder 
              ? 'Update your order details below' 
              : 'Design your perfect metal product with our AI-assisted customization system'}
          </p>
          {editingOrder && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              Editing Order #{editingOrder.orderNumber || editingOrder.id}. Only pending orders can be edited.
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-10">
            <div className="progress mb-3" style={{ height: '8px' }}>
              <div 
                className="progress-bar bg-primary" 
                style={{ width: `${(step / 7) * 100}%` }}
              ></div>
            </div>
            <div className="d-flex justify-content-between">
              {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => (
                <div key={stepNum} className="text-center">
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                    step >= stepNum ? 'bg-primary text-white' : 'bg-light text-muted'
                  }`} style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                    {stepNum}
                  </div>
                  <div className="small mt-1 text-muted">
                    {['Info', 'Product', 'Size', 'Material', 'Design', 'Review', 'Submit'][stepNum - 1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Authentication Check Banner */}
        {(!authToken || !user) && step === 1 && (
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8">
              <div className="alert alert-info d-flex align-items-center" role="alert">
                <i className="fas fa-info-circle fa-2x me-3"></i>
                <div>
                  <h5 className="alert-heading mb-1">Login Required</h5>
                  <p className="mb-0">You need to be logged in to place a custom order. Please login to continue.</p>
                </div>
                <button
                  onClick={() => navigate('/login', { state: { returnTo: '/custom-product-order' } })}
                  className="btn btn-primary ms-auto"
                >
                  <i className="fas fa-sign-in-alt me-2"></i>Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Customer Information */}
        {step === 1 && (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h3 className="card-title mb-0">Step 1: Customer Information</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-bold">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Mobile Number <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        placeholder="e.g., +977 9841001234"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Address <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control form-control-lg"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your complete address"
                        rows="3"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Description</label>
                      <textarea
                        className="form-control form-control-lg"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Any additional details or special requirements..."
                        rows="4"
                      />
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    {!authToken || !user ? (
                      <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Login Required:</strong> Please login to continue with your custom order.
                        <div className="mt-3">
                          <button
                            onClick={() => navigate('/login', { state: { returnTo: '/custom-product-order' } })}
                            className="btn btn-primary"
                          >
                            <i className="fas fa-sign-in-alt me-2"></i>Login Now
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => checkAuthAndProceed(2)}
                        disabled={!formData.customerName || !formData.mobileNumber || !formData.address}
                        className="btn btn-primary btn-lg px-5"
                      >
                        Continue to Product Selection <i className="fas fa-arrow-right ms-2"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Product Type Selection */}
        {step === 2 && (!authToken || !user) ? (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-8">
              <div className="card shadow-sm border-warning">
                <div className="card-body text-center p-5">
                  <div className="text-warning mb-4">
                    <i className="fas fa-lock fa-5x"></i>
                  </div>
                  <h2 className="text-warning mb-3">Authentication Required</h2>
                  <p className="lead mb-4">
                    You must be logged in to continue with your custom product order.
                  </p>
                  <button
                    onClick={() => navigate('/login', { state: { returnTo: '/custom-product-order' } })}
                    className="btn btn-primary btn-lg"
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login to Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : step === 2 && (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h3 className="card-title mb-0">Step 1: Select Product Type</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {productTypes.map(type => (
                      <div key={type} className="col-md-4 col-sm-6">
                        <button
                          onClick={() => handleInputChange('productType', type)}
                          className={`btn w-100 h-100 py-4 ${
                            formData.productType === type
                              ? 'btn-primary'
                              : 'btn-outline-primary'
                          }`}
                        >
                          <i className="fas fa-cube fa-2x mb-2"></i>
                          <br />
                          {type}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="row mt-4">
                    <div className="col-6">
                    <button
                        onClick={() => setStep(1)}
                        className="btn btn-secondary btn-lg w-100"
                      >
                        <i className="fas fa-arrow-left me-2"></i> Back
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={() => setStep(3)}
                      disabled={!formData.productType}
                        className="btn btn-primary btn-lg w-100"
                    >
                      Continue to Measurements <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Measurements */}
        {step === 3 && (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h3 className="card-title mb-0">Step 2: Enter Measurements</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Height (feet)</label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        value={formData.measurements.height}
                        onChange={(e) => handleMeasurementChange('height', e.target.value)}
                        placeholder="e.g., 6"
                        min="1"
                        step="0.1"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Width (feet)</label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        value={formData.measurements.width}
                        onChange={(e) => handleMeasurementChange('width', e.target.value)}
                        placeholder="e.g., 4"
                        min="1"
                        step="0.1"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-bold">Thickness (mm)</label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        value={formData.measurements.thickness}
                        onChange={(e) => handleMeasurementChange('thickness', e.target.value)}
                        placeholder="e.g., 2"
                        min="1"
                        step="0.5"
                      />
                    </div>
                  </div>
                  <div className="row mt-4">
                    <div className="col-6">
                      <button
                        onClick={() => setStep(2)}
                        className="btn btn-secondary btn-lg w-100"
                      >
                        <i className="fas fa-arrow-left me-2"></i> Back
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={() => checkAuthAndProceed(4)}
                        disabled={!formData.measurements.height || !formData.measurements.width || !formData.measurements.thickness || !authToken || !user}
                        className="btn btn-primary btn-lg w-100"
                      >
                        Continue to Material <i className="fas fa-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Material Type Selection */}
        {step === 4 && (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h3 className="card-title mb-0">Step 3: Select Material Type</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {materialTypes.map(material => (
                      <div key={material} className="col-md-6">
                        <button
                          onClick={() => handleInputChange('materialType', material)}
                          className={`btn w-100 h-100 py-4 ${
                            formData.materialType === material
                              ? 'btn-primary'
                              : 'btn-outline-primary'
                          }`}
                        >
                          <i className="fas fa-industry fa-2x mb-2"></i>
                          <br />
                          {material}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="row mt-4">
                    <div className="col-6">
                      <button
                        onClick={() => setStep(3)}
                        className="btn btn-secondary btn-lg w-100"
                      >
                        <i className="fas fa-arrow-left me-2"></i> Back
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={() => checkAuthAndProceed(5)}
                        disabled={!formData.materialType || !authToken || !user}
                        className="btn btn-primary btn-lg w-100"
                      >
                        Continue to Design <i className="fas fa-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Design Selection */}
        {step === 5 && (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-10">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h3 className="card-title mb-0">Step 4: Choose Design Option</h3>
                </div>
                <div className="card-body p-4">
                  
                  {/* Design Templates */}
                  <div className="mb-5">
                    <h5 className="mb-3">Select Design Template</h5>
                    <div className="row g-3">
                      {designTemplates.map(template => (
                        <div key={template} className="col-md-4 col-sm-6">
                          <button
                            onClick={() => {
                              handleInputChange('designType', 'template');
                              handleInputChange('designTemplate', template);
                            }}
                            className={`btn w-100 h-100 py-3 ${
                              formData.designTemplate === template && formData.designType === 'template'
                                ? 'btn-primary'
                                : 'btn-outline-primary'
                            }`}
                          >
                            <i className="fas fa-palette fa-2x mb-2"></i>
                            <br />
                            {template}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reference Image Upload */}
                  <div className="mb-4">
                    <h5 className="mb-3">Or Upload Reference Image</h5>
                    <div className="border border-dashed border-primary rounded p-5 text-center bg-light">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleInputChange('designType', 'upload');
                          handleInputChange('referenceImage', e.target.files[0]);
                        }}
                        className="d-none"
                        id="referenceImage"
                      />
                      <label htmlFor="referenceImage" className="cursor-pointer m-0">
                        <div className="text-muted">
                          <i className="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                          <h5>Click to upload reference image</h5>
                          <p className="mb-2">Upload a photo of your desired design</p>
                          {formData.referenceImage && (
                            <p className="text-success">
                              <i className="fas fa-check me-2"></i>
                              {formData.referenceImage.name}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-6">
                      <button
                        onClick={() => setStep(4)}
                        className="btn btn-secondary btn-lg w-100"
                      >
                        <i className="fas fa-arrow-left me-2"></i> Back
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={() => {
                          if (!authToken || !user) {
                            ErrorMessageToast('Please login to continue');
                            navigate('/login', { state: { returnTo: '/custom-product-order' } });
                            return;
                          }
                          generateAIDesign();
                        }}
                        disabled={(!formData.designTemplate && !formData.referenceImage) || !authToken || !user}
                        className="btn btn-success btn-lg w-100"
                      >
                        <i className="fas fa-robot me-2"></i>
                        Generate AI Design & Cost
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: AI Design Preview & Cost Review */}
        {step === 6 && formData.aiDesign && (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-10">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h3 className="card-title mb-0">Step 5: AI Design Preview & Cost Estimate</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    
                    {/* Design Preview */}
                    <div className="col-lg-6">
                      <div className="card h-100 border-primary">
                        <div className="card-header bg-primary text-white">
                          <h4 className="card-title mb-0">
                            <i className="fas fa-eye me-2"></i>
                            Design Preview
                          </h4>
                        </div>
                        <div className="card-body text-center">
                          <div className="bg-light rounded p-4 mb-3">
                            <i className="fas fa-cube fa-4x text-primary mb-3"></i>
                            <h5 className="text-primary">{formData.productType}</h5>
                            <p className="mb-1">{formData.materialType}</p>
                            <p className="mb-1">{formData.designTemplate} Design</p>
                          </div>
                          <div className="text-start">
                            <h6 className="text-uppercase">Design Specifications:</h6>
                            <ul className="list-unstyled">
                              <li><i className="fas fa-ruler me-2"></i> Size: {formData.measurements.height}ft × {formData.measurements.width}ft</li>
                              <li><i className="fas fa-layer-group me-2"></i> Thickness: {formData.measurements.thickness}mm</li>
                              <li><i className="fas fa-clock me-2"></i> Estimated Time: {formData.aiDesign.estimatedTime}</li>
                              <li><i className="fas fa-cogs me-2"></i> Complexity: {formData.aiDesign.complexity}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="col-lg-6">
                      <div className="card h-100 border-success">
                        <div className="card-header bg-success text-white">
                          <h4 className="card-title mb-0">
                            <i className="fas fa-calculator me-2"></i>
                            Cost Estimation
                          </h4>
                        </div>
                        <div className="card-body">
                          <div className="list-group list-group-flush">
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                              Material Cost:
                              <span className="fw-bold">Rs. {formData.aiDesign.costBreakdown.material.toLocaleString()}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center">
                              Labor Cost:
                              <span className="fw-bold">Rs. {formData.aiDesign.costBreakdown.labor.toLocaleString()}</span>
                            </div>
                            <div className="list-group-item d-flex justify-content-between align-items-center bg-light">
                              <strong className="fs-5">Total Estimated Cost:</strong>
                              <span className="fw-bold text-success fs-4">
                                Rs. {formData.aiDesign.costBreakdown.total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-light rounded">
                            <h6 className="text-uppercase mb-2">What's included:</h6>
                            <ul className="list-unstyled small mb-0">
                              <li><i className="fas fa-check text-success me-2"></i> Material as specified</li>
                              <li><i className="fas fa-check text-success me-2"></i> Professional fabrication</li>
                              <li><i className="fas fa-check text-success me-2"></i> Quality finishing</li>
                              <li><i className="fas fa-check text-success me-2"></i> Basic surface treatment</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-6">
                      <button
                        onClick={() => setStep(5)}
                        className="btn btn-secondary btn-lg w-100"
                      >
                        <i className="fas fa-arrow-left me-2"></i> Back to Design
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={editingOrder ? handleUpdateOrder : submitCustomOrder}
                        disabled={loading}
                        className="btn btn-primary btn-lg w-100"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            {editingOrder ? 'Updating...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            <i className={`fas ${editingOrder ? 'fa-save' : 'fa-paper-plane'} me-2`}></i>
                            {editingOrder ? 'Update Order' : 'Submit Custom Order'}
                          </>
                        )}
                      </button>
                      {editingOrder && (
                        <div className="col-12 mt-2">
                          <button
                            onClick={cancelEdit}
                            className="btn btn-secondary btn-lg w-100"
                          >
                            <i className="fas fa-times me-2"></i>
                            Cancel Edit
                      </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Order Success */}
        {step === 7 && currentOrder && (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-6">
              <div className="card shadow-sm border-success">
                <div className="card-body text-center p-5">
                  <div className="text-success mb-4">
                    <i className="fas fa-check-circle fa-5x"></i>
                  </div>
                  <h2 className="text-success mb-3">Order Placed Successfully!</h2>
                  <p className="lead mb-4">
                    Your custom <strong>{currentOrder.productType}</strong> order has been submitted to our service providers.
                  </p>
                  
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <h5 className="card-title">Order Details</h5>
                      <div className="row text-start">
                        <div className="col-6">
                          <p className="mb-1"><strong>Order No:</strong> {currentOrder.orderNumber || currentOrder.id}</p>
                          <p className="mb-1"><strong>Product:</strong> {currentOrder.productType}</p>
                          <p className="mb-1"><strong>Material:</strong> {currentOrder.materialType}</p>
                        </div>
                        <div className="col-6">
                          <p className="mb-1"><strong>Size:</strong> {currentOrder.measurementsJson ? JSON.parse(currentOrder.measurementsJson).height : ''}ft × {currentOrder.measurementsJson ? JSON.parse(currentOrder.measurementsJson).width : ''}ft</p>
                          <p className="mb-1"><strong>Cost:</strong> Rs. {currentOrder.estimatedCost ? currentOrder.estimatedCost.toLocaleString() : '0'}</p>
                          <p className="mb-0">
                            <strong>Status:</strong>{' '}
                            <span className={`badge ${
                              currentOrder.status === 'APPROVED' ? 'bg-info' : 
                              currentOrder.status === 'IN_PROGRESS' ? 'bg-primary' :
                              currentOrder.status === 'READY_FOR_DELIVERY' ? 'bg-success' :
                              currentOrder.status === 'COMPLETED' ? 'bg-success' :
                              currentOrder.status === 'REJECTED' ? 'bg-danger' : 
                              'bg-warning'
                            }`}>
                              {currentOrder.status === 'IN_PROGRESS' && currentOrder.progressPercentage 
                                ? `In Progress (${currentOrder.progressPercentage}%)` 
                                : currentOrder.status || 'PENDING'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted mb-4">
                    Our service providers will review your order and contact you shortly. 
                    You can track your order status in your account dashboard.
                  </p>

                  <div className="d-grid gap-2 d-md-flex justify-content-center">
                    <button onClick={startNewOrder} className="btn btn-primary btn-lg">
                      <i className="fas fa-plus me-2"></i>
                      Create Another Order
                    </button>
                    <button className="btn btn-outline-primary btn-lg">
                      <i className="fas fa-tasks me-2"></i>
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List Section */}
        {orders.length > 0 && (
          <div className="row justify-content-center mt-5 wow fadeInUp" data-wow-delay="0.2s">
            <div className="col-lg-12">
              <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">
                    <i className="fas fa-list me-2"></i>
                    Your Custom Orders
                  </h3>
                  <button className="btn btn-sm btn-outline-primary" onClick={fetchOrders}>
                    <i className="fas fa-sync me-1"></i>Refresh
                  </button>
      </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Order No</th>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Material</th>
                          <th>Cost</th>
                          <th>Status</th>
                          <th>Payment</th>
                          <th>Date</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const measurements = order.measurementsJson ? JSON.parse(order.measurementsJson) : {};
                          const canEdit = order.status === 'PENDING';
                          
                          // Get status display based on order status and progress
                          const getStatusDisplay = (status, progressPercentage) => {
                            if (status === 'PENDING') {
                              return { text: 'Pending Approval', class: 'bg-warning text-dark', icon: 'fas fa-clock' };
                            } else if (status === 'APPROVED') {
                              return { text: 'Approved - Ready to Start', class: 'bg-info text-white', icon: 'fas fa-check-circle' };
                            } else if (status === 'IN_PROGRESS') {
                              return { text: `In Progress (${progressPercentage || 0}%)`, class: 'bg-primary text-white', icon: 'fas fa-hammer' };
                            } else if (status === 'READY_FOR_DELIVERY') {
                              return { text: 'Ready for Delivery', class: 'bg-success text-white', icon: 'fas fa-truck' };
                            } else if (status === 'COMPLETED') {
                              return { text: 'Completed', class: 'bg-success text-white', icon: 'fas fa-check-double' };
                            } else if (status === 'REJECTED') {
                              return { text: 'Rejected', class: 'bg-danger text-white', icon: 'fas fa-times-circle' };
                            } else if (status === 'CANCELLED') {
                              return { text: 'Cancelled', class: 'bg-secondary text-white', icon: 'fas fa-ban' };
                            }
                            return { text: status || 'Pending', class: 'bg-warning text-dark', icon: 'fas fa-question' };
                          };
                          
                          const statusDisplay = getStatusDisplay(order.status, order.progressPercentage);
                          
                          // Get payment status display
                          const getPaymentStatusDisplay = (paymentStatus, paymentMethod) => {
                            if (!paymentStatus && !paymentMethod) {
                              return { text: 'Not Set', class: 'bg-light text-dark', icon: 'fas fa-question' };
                            }
                            
                            if (paymentStatus === 'PAID') {
                              return { text: 'Paid', class: 'bg-success text-white', icon: 'fas fa-check-circle' };
                            } else if (paymentStatus === 'PENDING') {
                              return { text: 'Pending', class: 'bg-warning text-dark', icon: 'fas fa-clock' };
                            } else if (paymentStatus === 'PARTIAL') {
                              return { text: 'Partial', class: 'bg-info text-white', icon: 'fas fa-hourglass-half' };
                            } else if (paymentStatus === 'REFUNDED') {
                              return { text: 'Refunded', class: 'bg-secondary text-white', icon: 'fas fa-undo' };
                            }
                            
                            // If payment method is set but status is not, show based on method
                            if (paymentMethod) {
                              if (paymentMethod === 'COD' || paymentMethod === 'cod') {
                                return { text: 'Pending', class: 'bg-warning text-dark', icon: 'fas fa-clock' };
                              } else {
                                return { text: 'Pending', class: 'bg-warning text-dark', icon: 'fas fa-clock' };
                              }
                            }
                            
                            return { text: 'Pending', class: 'bg-warning text-dark', icon: 'fas fa-clock' };
                          };
                          
                          const paymentStatusDisplay = getPaymentStatusDisplay(order.paymentStatus, order.paymentMethod);
                          
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
                                <span className="badge bg-secondary">{order.materialType}</span>
                              </td>
                              <td>
                                <strong className="text-success">
                                  Rs. {(order.totalAmount || order.estimatedCost || 0).toLocaleString()}
                                </strong>
                              </td>
                              <td>
                                <span className={`badge ${statusDisplay.class} d-flex align-items-center`} style={{ width: 'fit-content' }}>
                                  <i className={`${statusDisplay.icon} me-1`}></i>
                                  {statusDisplay.text}
                                </span>
                                {order.status === 'IN_PROGRESS' && order.progressPercentage !== undefined && (
                                  <div className="progress mt-2" style={{ height: '8px', width: '150px' }}>
                                    <div 
                                      className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                                      style={{ width: `${order.progressPercentage || 0}%` }}
                                      role="progressbar"
                                    ></div>
                                  </div>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${paymentStatusDisplay.class} d-flex align-items-center`} style={{ width: 'fit-content' }}>
                                  <i className={`${paymentStatusDisplay.icon} me-1`}></i>
                                  {paymentStatusDisplay.text}
                                </span>
                                {order.paymentMethod && (
                                  <small className="text-muted d-block mt-1">
                                    {order.paymentMethod === 'COD' || order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                                     order.paymentMethod === 'ESEWA' || order.paymentMethod === 'esewa' ? 'eSewa' : 
                                     order.paymentMethod}
                                  </small>
                                )}
                              </td>
                              <td>
                                <small className="text-muted">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                                </small>
                              </td>
                              <td className="text-end">
                                <div className="btn-group" role="group">
                                  {/* Show Confirm button for READY_FOR_DELIVERY and COMPLETED orders that haven't been confirmed */}
                                  {((order.status === 'READY_FOR_DELIVERY' && !order.customerConfirmation) || 
                                    (order.status === 'COMPLETED' && !order.customerConfirmation)) && (
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => navigate(`/custom-order-confirmation/${order.id}`)}
                                      title="Confirm Completion"
                                    >
                                      <i className="fas fa-check me-1"></i>Confirm
                                    </button>
                                  )}
                                  {/* Edit Button - Only for PENDING orders (leftmost) */}
                                  {canEdit && (
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleEdit(order)}
                                      title="Edit Order"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                  )}
                                  
                                  {/* Cancel Button - Only for PENDING orders */}
                                  {order.status === 'PENDING' && (
                                    <button
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() => setShowCancelConfirm(order.id)}
                                      title="Cancel Order"
                                    >
                                      <i className="fas fa-ban"></i>
                                    </button>
                                  )}
                                  
                                  {/* View Details Button - Always visible */}
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => navigate(`/custom-order-confirmation/${order.id}`)}
                                    title="View Details"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  
                                  {/* Delete Button - Only for PENDING orders (to the right of View) */}
                                  {canEdit && (
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => setShowDeleteConfirm(order.id)}
                                      title="Delete Order"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  )}
                                  
                                  {/* Review Button - For confirmed orders without rating */}
                                  {order.status === 'CONFIRMED_BY_CUSTOMER' && !order.rating && (
                                    <button
                                      className="btn btn-sm btn-warning"
                                      onClick={() => navigate(`/custom-order-review/${order.id}`)}
                                      title="Add Review"
                                    >
                                      <i className="fas fa-star me-1"></i>Review
                                    </button>
                                  )}
                                  
                                  {/* Re-order Button - Only for CANCELLED orders */}
                                  {order.status === 'CANCELLED' && (
                                    <button
                                      className="btn btn-sm btn-primary"
                                      onClick={() => handleReOrder(order)}
                                      title="Re-order"
                                    >
                                      <i className="fas fa-redo me-1"></i>Re-order
                                    </button>
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
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Confirm Delete
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowDeleteConfirm(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this order? This action cannot be undone.</p>
                  <p className="text-muted small">
                    <strong>Note:</strong> Only pending orders can be deleted.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(showDeleteConfirm)}
                  >
                    <i className="fas fa-trash me-1"></i>Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Confirm Cancel Order
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCancelConfirm(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to cancel this order?</p>
                  <p className="text-muted small">
                    <strong>Note:</strong> Only pending orders can be cancelled. Once cancelled, you can re-order it later.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCancelConfirm(null)}
                  >
                    No, Keep Order
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => handleCancel(showCancelConfirm)}
                  >
                    <i className="fas fa-ban me-1"></i>Yes, Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CustomProductOrder;
