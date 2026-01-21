// components/CustomProductOrder.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../Context/AuthContext';
import { createCustomOrder, getAllCustomOrders, updateCustomOrder, deleteCustomOrder, cancelCustomOrder } from '../../../services/customOrderService';
import { getUserDetailsById } from '../../../services/authService';
import { SuccesfulMessageToast, ErrorMessageToast } from '../../../utils/Tostify.util';

const CustomProductOrder = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchOrders();
      fetchUserProfile();
    }
  }, [user]);

  // Auto-populate customer information from user profile when profile is loaded
  useEffect(() => {
    if (userProfile && step === 1 && !editingOrder) {
      setFormData(prev => ({
        ...prev,
        customerName: userProfile.fullName || prev.customerName || '',
        mobileNumber: userProfile.phoneNumber || prev.mobileNumber || ''
      }));
    }
  }, [userProfile, step, editingOrder]);

  const fetchUserProfile = async () => {
    if (!user || !user.id) return;
    
    try {
      const data = await getUserDetailsById(user.id);
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Check authentication when step changes (prevent direct access to steps 2-7 without login)
  useEffect(() => {
    if (step > 1 && (!authToken || !user)) {
      ErrorMessageToast(t('customOrder.pleaseLoginToContinue'));
      setStep(1); // Reset to step 1
      navigate('/login', { state: { returnTo: '/custom-product-order' } });
    }
  }, [step, authToken, user, navigate, t]);

  // Check authentication before proceeding
  const checkAuthAndProceed = (nextStep) => {
    if (!authToken || !user) {
      ErrorMessageToast(t('customOrder.pleaseLoginToContinue'));
      navigate('/login', { state: { returnTo: '/custom-product-order' } });
      return false;
    }
    setStep(nextStep);
    return true;
  };

  const fetchOrders = async () => {
    if (!user || !user.id) {
      setOrders([]);
      return;
    }
    
    try {
      const data = await getAllCustomOrders();
      
      // Backend should already filter by customerId, but we add frontend filtering as safety measure
      const userOrders = (data || []).filter(order => {
        // Primary: Match by customerId (most reliable for new orders)
        if (order.customerId && user.id) {
          return order.customerId === user.id;
        }
        
        // Fallback: Match by customerName for old orders (when customerId is null)
        // Match order's customerName with user's fullName
        if (!order.customerId && order.customerName && user.name) {
          return order.customerName.trim().toLowerCase() === user.name.trim().toLowerCase();
        }
        
        // Also try matching with user.fullName if available
        if (!order.customerId && order.customerName && user.fullName) {
          return order.customerName.trim().toLowerCase() === user.fullName.trim().toLowerCase();
        }
        
        return false;
      });
      
      // Sort orders by createdAt date (newest first)
      const sortedOrders = userOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      setOrders(sortedOrders);
      // Reset to first page when orders are fetched
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      ErrorMessageToast(t('customOrder.failedToLoadOrders'));
      setOrders([]);
    }
  };

  const handleEdit = (order) => {
    const measurements = order.measurementsJson ? JSON.parse(order.measurementsJson) : {};
    const aiDesign = order.aiDesignJson ? JSON.parse(order.aiDesignJson) : null;
    
    // If design type is template, get the template image URL
    let referenceImageUrl = order.referenceImageUrl || null;
    if (order.designType === 'template' && order.designTemplate && order.productType && !referenceImageUrl) {
      referenceImageUrl = getDesignTemplateImage(order.productType, order.designTemplate);
    }
    
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
      referenceImageUrl: referenceImageUrl,
      aiDesign: aiDesign,
      estimatedCost: order.estimatedCost || 0
    });
    setEditingOrder(order);
    setStep(1); // Start from customer info step
  };

  const handleUpdateOrder = async () => {
    if (!formData.customerName || !formData.mobileNumber || !formData.address) {
      ErrorMessageToast(t('customOrder.pleaseFillAllFields'));
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
        referenceImageUrl: formData.designType === 'upload' && formData.referenceImage 
          ? await fileToBase64(formData.referenceImage)
          : (formData.designType === 'template' && formData.referenceImageUrl 
            ? formData.referenceImageUrl 
            : editingOrder?.referenceImageUrl),
        aiDesign: formData.aiDesign,
        estimatedCost: formData.estimatedCost
      };

      const updatedOrder = await updateCustomOrder(editingOrder.id, orderPayload);
      SuccesfulMessageToast(t('customOrder.orderUpdatedSuccessfully'));
      setEditingOrder(null);
      startNewOrder();
      await fetchOrders();
    } catch (error) {
      ErrorMessageToast(error.message || t('customOrder.failedToUpdateOrder'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (order) => {
    try {
      // Check if order can be deleted (PENDING, CANCELLED, or REJECTED orders can be deleted)
      if (order.status !== 'PENDING' && order.status !== 'CANCELLED' && order.status !== 'REJECTED') {
        ErrorMessageToast(t('customOrder.onlyPendingCanBeEdited'));
        setShowDeleteConfirm(null);
        return;
      }
      
      await deleteCustomOrder(order.id);
      SuccesfulMessageToast(t('customOrder.orderDeletedSuccessfully'));
      setShowDeleteConfirm(null);
      await fetchOrders();
    } catch (error) {
      ErrorMessageToast(error.message || t('customOrder.failedToDeleteOrder'));
      setShowDeleteConfirm(null);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelCustomOrder(id);
      SuccesfulMessageToast(t('customOrder.orderCancelledSuccessfully'));
      setShowCancelConfirm(null);
      await fetchOrders();
    } catch (error) {
      ErrorMessageToast(error.message || t('customOrder.failedToCancelOrder'));
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

      // If design type is template, get the template image URL
      let referenceImageUrl = order.referenceImageUrl || null;
      if (order.designType === 'template' && order.designTemplate && order.productType && !referenceImageUrl) {
        referenceImageUrl = getDesignTemplateImage(order.productType, order.designTemplate);
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
        referenceImageUrl: referenceImageUrl,
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
      SuccesfulMessageToast(t('customOrder.orderDetailsLoaded'));
    } catch (error) {
      ErrorMessageToast(t('customOrder.failedToLoadOrderDetails'));
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

  // Product type icon mapping
  const productTypeIcons = {
    'Gate': 'fas fa-door-open',
    'Grill': 'fas fa-fire',
    'Window': 'fas fa-table',
    'Table': 'fas fa-window-maximize',
    'Chair': 'fas fa-chair',
    'Custom Furniture': 'fas fa-couch',
    'Staircase': 'fas fa-stairs',
    'Railing': 'fas fa-xmarks-lines'
  };

  // Dynamic design template image mapping based on product type
  // This function returns the appropriate image URL based on product type and design template
  // Note: Replace these URLs with your local images in assets/image/design-templates/{productType}/{designTemplate}.jpg
  const getDesignTemplateImage = (productType, designTemplate) => {
    if (!productType) {
      // Default to Window if no product type selected
      productType = 'Window';
    }

    // Image mapping: productType -> designTemplate -> image URL
    // Using placeholder images - replace with actual product images
    const imageMap = {
      'Window': {
        'Modern': '../assets/DesignTemplate/window/modernwindow.png',
        'Traditional': '../assets/DesignTemplate/window/traditionalwindow.png',
        'Minimalist': '../assets/DesignTemplate/window/minimalistwindow.png',
        'Ornate': '../assets/DesignTemplate/window/ornatewindow.png',
        'Industrial': '../assets/DesignTemplate/window/industrialwindow.png',
        'Classic': '../assets/DesignTemplate/window/classicwindow.png'
      },
      'Gate': {
        'Modern': '../assets/DesignTemplate/gate/moderngate.png',
        'Traditional': '../assets/DesignTemplate/gate/traditionalgate.png',
        'Minimalist': '../assets/DesignTemplate/gate/minimalistgate.png',
        'Ornate': '../assets/DesignTemplate/gate/ornategate.png',
        'Industrial': '../assets/DesignTemplate/gate/industrialgate.png',
        'Classic': '../assets/DesignTemplate/gate/classicgate.png'
      },
      'Grill': {
        'Modern': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Traditional': 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Minimalist': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Ornate': 'https://images.unsplash.com/photo-1600607688969-a5fcd6a57f91?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Industrial': 'https://images.unsplash.com/photo-1600607688909-1c99095e0c0a?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Classic': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3'
      },
      'Table': {
        'Modern': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Traditional': 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Minimalist': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Ornate': 'https://images.unsplash.com/photo-1600607688969-a5fcd6a57f91?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Industrial': 'https://images.unsplash.com/photo-1600607688909-1c99095e0c0a?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Classic': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3'
      },
      'Chair': {
        'Modern': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Traditional': 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Minimalist': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Ornate': 'https://images.unsplash.com/photo-1600607688969-a5fcd6a57f91?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Industrial': 'https://images.unsplash.com/photo-1600607688909-1c99095e0c0a?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Classic': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3'
      },
      'Custom Furniture': {
        'Modern': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Traditional': 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Minimalist': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Ornate': 'https://images.unsplash.com/photo-1600607688969-a5fcd6a57f91?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Industrial': 'https://images.unsplash.com/photo-1600607688909-1c99095e0c0a?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Classic': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3'
      },
      'Staircase': {
        'Modern': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Traditional': 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Minimalist': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Ornate': 'https://images.unsplash.com/photo-1600607688969-a5fcd6a57f91?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Industrial': 'https://images.unsplash.com/photo-1600607688909-1c99095e0c0a?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Classic': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3'
      },
      'Railing': {
        'Modern': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Traditional': 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Minimalist': 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Ornate': 'https://images.unsplash.com/photo-1600607688969-a5fcd6a57f91?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Industrial': 'https://images.unsplash.com/photo-1600607688909-1c99095e0c0a?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3',
        'Classic': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop&q=80&ixlib=rb-4.0.3'
      }
    };

    // Return the specific image for the product type and design template
    if (imageMap[productType] && imageMap[productType][designTemplate]) {
      return imageMap[productType][designTemplate];
    }
    
    // Fallback to a placeholder with product type and design template text
    return `https://via.placeholder.com/400x300/007bff/ffffff?text=${encodeURIComponent(productType + ' - ' + designTemplate)}`;
  };

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

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Submit custom order
  const submitCustomOrder = async () => {
    if (!authToken || !user) {
      ErrorMessageToast(t('customOrder.pleaseLoginToContinue'));
      navigate('/login', { state: { returnTo: '/custom-product-order' } });
      return;
    }

    if (!formData.customerName || !formData.mobileNumber || !formData.address) {
      ErrorMessageToast(t('customOrder.pleaseFillAllFields'));
      return;
    }

    setLoading(true);
    try {
      // Prepare reference image URL - either from uploaded file or design template
      let referenceImageUrl = null;
      if (formData.designType === 'upload' && formData.referenceImage) {
        // For uploaded images, convert to base64 data URL for storage
        referenceImageUrl = await fileToBase64(formData.referenceImage);
      } else if (formData.designType === 'template' && formData.referenceImageUrl) {
        // For design templates, use the stored image URL
        referenceImageUrl = formData.referenceImageUrl;
      }

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
        referenceImageUrl: referenceImageUrl,
        aiDesign: formData.aiDesign,
        estimatedCost: formData.estimatedCost
      };

      const savedOrder = await createCustomOrder(orderPayload);
      setCurrentOrder(savedOrder);
      setStep(7); // Move to success step
      SuccesfulMessageToast(t('customOrder.orderSubmittedSuccessfully'));
      await fetchOrders(); // Refresh orders list
    } catch (error) {
      ErrorMessageToast(error.message || t('customOrder.failedToSubmitOrder'));
    } finally {
      setLoading(false);
    }
  };

  // Reset form and start over
  const startNewOrder = () => {
    // Auto-populate from user profile if available
    setFormData({
      customerName: userProfile?.fullName || '',
      mobileNumber: userProfile?.phoneNumber || '',
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
            {editingOrder ? t('customOrder.editTitle') : t('customOrder.title')}
          </h1>
          <p className="mb-5">
            {editingOrder 
              ? t('customOrder.updateDescription')
              : t('customOrder.description')}
          </p>
          {editingOrder && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              {t('customOrder.editingOrder', { orderNumber: editingOrder.orderNumber || editingOrder.id })}
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
                    {[
                      t('customOrder.stepLabels.info'),
                      t('customOrder.stepLabels.product'),
                      t('customOrder.stepLabels.size'),
                      t('customOrder.stepLabels.material'),
                      t('customOrder.stepLabels.design'),
                      t('customOrder.stepLabels.review'),
                      t('customOrder.stepLabels.submit')
                    ][stepNum - 1]}
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
                  <h5 className="alert-heading mb-1">{t('customOrder.loginRequired')}</h5>
                  <p className="mb-0">{t('customOrder.loginRequiredDesc')}</p>
                </div>
                <button
                  onClick={() => navigate('/login', { state: { returnTo: '/custom-product-order' } })}
                  className="btn btn-primary ms-auto"
                >
                  <i className="fas fa-sign-in-alt me-2"></i>{t('customOrder.login')}
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
                  <h3 className="card-title mb-0">{t('customOrder.step1')}</h3>
                  {userProfile && !editingOrder && (
                    <small className="text-muted d-block mt-2">
                      <i className="fas fa-info-circle me-1"></i>
                      {t('customOrder.profileAutoFilled')}
                    </small>
                  )}
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-bold">{t('customOrder.fullName')} <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder={t('customOrder.enterFullName')}
                        disabled={!!userProfile && !editingOrder}
                        readOnly={!!userProfile && !editingOrder}
                        style={userProfile && !editingOrder ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                        required
                      />
                      {userProfile && !editingOrder && (
                        <small className="text-success d-block mt-1">
                          <i className="fas fa-check-circle me-1"></i>
                          {t('customOrder.autoFilledFromProfile')}
                        </small>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">{t('customOrder.mobileNumber')} <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        placeholder={t('customOrder.enterMobileNumber')}
                        disabled={!!userProfile && !editingOrder}
                        readOnly={!!userProfile && !editingOrder}
                        style={userProfile && !editingOrder ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                        required
                      />
                      {userProfile && !editingOrder && (
                        <small className="text-success d-block mt-1">
                          <i className="fas fa-check-circle me-1"></i>
                          {t('customOrder.autoFilledFromProfile')}
                        </small>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">{t('customOrder.address')} <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control form-control-lg"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder={t('customOrder.enterAddress')}
                        rows="3"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">{t('customOrder.description')}</label>
                      <textarea
                        className="form-control form-control-lg"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={t('customOrder.additionalDetails')}
                        rows="4"
                      />
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    {!authToken || !user ? (
                      <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>{t('customOrder.loginRequired')}:</strong> {t('customOrder.pleaseLoginToContinue')}
                        <div className="mt-3">
                          <button
                            onClick={() => navigate('/login', { state: { returnTo: '/custom-product-order' } })}
                            className="btn btn-primary"
                          >
                            <i className="fas fa-sign-in-alt me-2"></i>{t('customOrder.loginNow')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => checkAuthAndProceed(2)}
                        disabled={!formData.customerName || !formData.mobileNumber || !formData.address}
                        className="btn btn-primary btn-lg px-5"
                      >
                        {t('customOrder.continueToProductSelection')} <i className="fas fa-arrow-right ms-2"></i>
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
                  <h2 className="text-warning mb-3">{t('customOrder.authenticationRequired')}</h2>
                  <p className="lead mb-4">
                    {t('customOrder.authenticationRequiredDesc')}
                  </p>
                  <button
                    onClick={() => navigate('/login', { state: { returnTo: '/custom-product-order' } })}
                    className="btn btn-primary btn-lg"
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    {t('customOrder.loginToContinue')}
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
                  <h3 className="card-title mb-0">{t('customOrder.step2')}</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-3">
                    {productTypes.map(type => (
                      <div key={type} className="col-md-4 col-sm-6">
                        <button
                          onClick={() => handleInputChange('productType', type)}
                          className={`btn w-100 h-100 py-4 d-flex flex-column align-items-center justify-content-center ${
                            formData.productType === type
                              ? 'btn-primary'
                              : 'btn-outline-primary'
                          }`}
                          style={{ minHeight: '120px' }}
                        >
                          <i className={`${productTypeIcons[type] || 'fas fa-cube'} fa-2x mb-3`}></i>
                          <span className="fw-bold" style={{ fontSize: '1rem' }}>{type}</span>
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
                        <i className="fas fa-arrow-left me-2"></i> {t('customOrder.back')}
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={() => setStep(3)}
                      disabled={!formData.productType}
                        className="btn btn-primary btn-lg w-100"
                    >
                      {t('customOrder.continueToMeasurements')} <i className="fas fa-arrow-right ms-2"></i>
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
                  <h3 className="card-title mb-0">{t('customOrder.step3')}</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-4">
                      <label className="form-label fw-bold">{t('customOrder.height')}</label>
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
                      <label className="form-label fw-bold">{t('customOrder.width')}</label>
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
                      <label className="form-label fw-bold">{t('customOrder.thickness')}</label>
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
                        <i className="fas fa-arrow-left me-2"></i> {t('customOrder.back')}
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={() => checkAuthAndProceed(4)}
                        disabled={!formData.measurements.height || !formData.measurements.width || !formData.measurements.thickness || !authToken || !user}
                        className="btn btn-primary btn-lg w-100"
                      >
                        {t('customOrder.continueToMaterial')} <i className="fas fa-arrow-right ms-2"></i>
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
                  <h3 className="card-title mb-0">{t('customOrder.step4')}</h3>
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
                        <i className="fas fa-arrow-left me-2"></i> {t('customOrder.back')}
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={() => checkAuthAndProceed(5)}
                        disabled={!formData.materialType || !authToken || !user}
                        className="btn btn-primary btn-lg w-100"
                      >
                        {t('customOrder.continueToDesign')} <i className="fas fa-arrow-right ms-2"></i>
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
                  <h3 className="card-title mb-0">{t('customOrder.step5')}</h3>
                </div>
                <div className="card-body p-4">
                  
                  {/* Design Templates */}
                  <div className="mb-5">
                    <h5 className="mb-3">{t('customOrder.selectDesignTemplate')}</h5>
                    <div className="row g-4">
                      {designTemplates.map(template => (
                        <div key={template} className="col-md-4 col-sm-6">
                          <div
                            onClick={() => {
                              handleInputChange('designType', 'template');
                              handleInputChange('designTemplate', template);
                              // Store the design template image URL
                              const templateImageUrl = getDesignTemplateImage(formData.productType || 'Window', template);
                              handleInputChange('referenceImageUrl', templateImageUrl);
                              handleInputChange('referenceImage', null); // Clear uploaded image if template is selected
                            }}
                            className={`card h-100 cursor-pointer border-2 transition-all ${
                              formData.designTemplate === template && formData.designType === 'template'
                                ? 'border-primary shadow-lg'
                                : 'border-light shadow-sm'
                            }`}
                            style={{ 
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              if (formData.designTemplate !== template || formData.designType !== 'template') {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              if (formData.designTemplate !== template || formData.designType !== 'template') {
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }
                            }}
                          >
                            <div 
                              className="position-relative"
                              style={{ 
                                height: '200px',
                                overflow: 'hidden',
                                backgroundColor: '#f8f9fa'
                              }}
                            >
                              <img
                                src={getDesignTemplateImage(formData.productType || 'Window', template)}
                                alt={`${formData.productType || 'Product'} - ${template} Design`}
                                className="w-100 h-100"
                                style={{ 
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease'
                                }}
                                onError={(e) => {
                                  // Fallback to a placeholder if image fails to load
                                  e.target.src = `https://via.placeholder.com/400x300/007bff/ffffff?text=${encodeURIComponent((formData.productType || 'Product') + ' - ' + template)}`;
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'scale(1)';
                                }}
                              />
                              {formData.designTemplate === template && formData.designType === 'template' && (
                                <div 
                                  className="position-absolute top-0 end-0 m-2"
                                  style={{
                                    backgroundColor: 'rgba(0, 123, 255, 0.9)',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                  }}
                                >
                                  <i className="fas fa-check"></i>
                                </div>
                              )}
                            </div>
                            <div className="card-body text-center p-3">
                              <h6 className="card-title mb-0 fw-bold">{template}</h6>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reference Image Upload */}
                  <div className="mb-4">
                    <h5 className="mb-3">{t('customOrder.uploadReferenceImage')}</h5>
                    <div className="border border-dashed border-primary rounded p-5 text-center bg-light">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          handleInputChange('designType', 'upload');
                          handleInputChange('referenceImage', e.target.files[0]);
                          // Create preview URL for uploaded image
                          if (e.target.files[0]) {
                            handleInputChange('referenceImageUrl', URL.createObjectURL(e.target.files[0]));
                          }
                          handleInputChange('designTemplate', ''); // Clear template if image is uploaded
                        }}
                        className="d-none"
                        id="referenceImage"
                      />
                      <label htmlFor="referenceImage" className="cursor-pointer m-0">
                        <div className="text-muted">
                          <i className="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                          <h5>{t('customOrder.uploadReferenceImage')}</h5>
                          <p className="mb-2">{t('customOrder.uploadReferenceImage')}</p>
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
                        <i className="fas fa-arrow-left me-2"></i> {t('customOrder.back')}
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        onClick={() => {
                          if (!authToken || !user) {
                            ErrorMessageToast(t('customOrder.pleaseLoginToContinue'));
                            navigate('/login', { state: { returnTo: '/custom-product-order' } });
                            return;
                          }
                          generateAIDesign();
                        }}
                        disabled={(!formData.designTemplate && !formData.referenceImage) || !authToken || !user}
                        className="btn btn-success btn-lg w-100"
                      >
                        <i className="fas fa-calculator me-2"></i>
                        {t('Generate Estimate') || 'Generate Estimate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Design Preview & Cost Review */}
        {step === 6 && formData.aiDesign && (
          <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="col-lg-10">
              <div className="card shadow-sm">
                <div className="card-header bg-light">
                  <h3 className="card-title mb-0">{t('customOrder.step6') || 'Step 6: Review Order & Estimate'}</h3>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    
                    {/* Design Preview */}
                    <div className="col-lg-6">
                      <div className="card h-100 border-primary">
                        <div className="card-header bg-primary text-white">
                          <h4 className="card-title mb-0">
                            <i className="fas fa-eye me-2"></i>
                            {t('customOrder.reviewCostEstimate')}
                          </h4>
                        </div>
                        <div className="card-body text-center">
                          {/* Display Design Template Image or Reference Image */}
                          {(formData.referenceImageUrl || formData.referenceImage) && (
                            <div className="mb-3">
                              <img
                                src={formData.referenceImage ? URL.createObjectURL(formData.referenceImage) : formData.referenceImageUrl}
                                alt={formData.designType === 'template' ? `${formData.productType} - ${formData.designTemplate} Design` : 'Reference Image'}
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                              />
                              {formData.designType === 'template' && formData.designTemplate && (
                                <p className="mt-2 mb-0">
                                  <strong>Design Template:</strong> {formData.designTemplate}
                                </p>
                              )}
                              {formData.designType === 'upload' && formData.referenceImage && (
                                <p className="mt-2 mb-0">
                                  <strong>Reference Image:</strong> {formData.referenceImage.name}
                                </p>
                              )}
                            </div>
                          )}
                          <div className="bg-light rounded p-4 mb-3">
                            <i className="fas fa-cube fa-4x text-primary mb-3"></i>
                            <h5 className="text-primary">{formData.productType}</h5>
                            <p className="mb-1">{formData.materialType}</p>
                            {formData.designTemplate && (
                              <p className="mb-1">{formData.designTemplate} Design</p>
                            )}
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
                            {t('customOrder.reviewCostEstimate')}
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
                        <i className="fas fa-arrow-left me-2"></i> {t('customOrder.back')}
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
                            {editingOrder ? t('customOrder.updateOrder') : t('customOrder.submitOrder')}
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
                            {t('customOrder.cancelEdit')}
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
                  <h2 className="text-success mb-3">{t('customOrder.orderSubmittedSuccessfully')}</h2>
                  <p className="lead mb-4">
                    {t('customOrder.orderSubmittedSuccessfully')} <strong>{currentOrder.productType}</strong>
                  </p>
                  
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <h5 className="card-title">{t('customOrder.orderHistory')}</h5>
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
                    {t('customOrder.orderSubmittedSuccessfully')}
                  </p>

                  <div className="d-grid gap-2 d-md-flex justify-content-center">
                    <button onClick={startNewOrder} className="btn btn-primary btn-lg">
                      <i className="fas fa-plus me-2"></i>
                      {t('customOrder.submitOrder')}
                    </button>
                    <button className="btn btn-outline-primary btn-lg">
                      <i className="fas fa-tasks me-2"></i>
                      {t('customOrder.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List Section */}
        {user && user.id && (
          <div className="row justify-content-center mt-5 wow fadeInUp" data-wow-delay="0.2s">
            <div className="col-lg-12">
              <div className="card shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h3 className="card-title mb-0">
                    <i className="fas fa-list me-2"></i>
                    {t('customOrder.orderHistory')}
                  </h3>
                  <button className="btn btn-sm btn-outline-primary" onClick={fetchOrders}>
                    <i className="fas fa-sync me-1"></i>{t('customOrder.refresh')}
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="card-body text-center py-5">
                    <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted mb-2">{t('customOrder.noOrders')}</h5>
                    <p className="text-muted mb-4">{t('customOrder.noOrders')}</p>
                  </div>
                ) : (
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>{t('customOrder.orderNo')}</th>
                          <th>{t('customOrder.customer')}</th>
                          <th>{t('customOrder.product')}</th>
                          <th>{t('customOrder.material')}</th>
                          <th>{t('customOrder.cost')}</th>
                          <th>{t('customOrder.status')}</th>
                          <th>{t('customOrder.payment')}</th>
                          <th>{t('customOrder.date')}</th>
                          <th className="text-end">{t('customOrder.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Calculate pagination
                          const indexOfLastOrder = currentPage * itemsPerPage;
                          const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
                          const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
                          
                          return currentOrders.map((order) => {
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
                                      title={t('customOrder.confirm')}
                                    >
                                      <i className="fas fa-check me-1"></i>{t('customOrder.confirm')}
                                    </button>
                                  )}
                                  {/* Edit Button - Only for PENDING orders (leftmost) */}
                                  {canEdit && (
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => handleEdit(order)}
                                      title={t('customOrder.edit')}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                  )}
                                  
                                  {/* Cancel Button - Only for PENDING orders */}
                                  {order.status === 'PENDING' && (
                                    <button
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() => setShowCancelConfirm(order.id)}
                                      title={t('customOrder.cancel')}
                                    >
                                      <i className="fas fa-ban"></i>
                                    </button>
                                  )}
                                  
                                  {/* View Details Button - Always visible */}
                                  <button
                                    className="btn btn-sm btn-outline-info"
                                    onClick={() => navigate(`/custom-order-confirmation/${order.id}`)}
                                    title={t('customOrder.viewDetails')}
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                  
                                  {/* Delete Button - Available for PENDING, CANCELLED, and REJECTED orders */}
                                  {(order.status === 'PENDING' || order.status === 'CANCELLED' || order.status === 'REJECTED') && (
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => setShowDeleteConfirm(order)}
                                      title={t('customOrder.delete')}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  )}
                                  
                                  {/* Review Button - For confirmed orders without rating */}
                                  {order.status === 'CONFIRMED_BY_CUSTOMER' && !order.rating && (
                                    <button
                                      className="btn btn-sm btn-warning"
                                      onClick={() => navigate(`/custom-order-review/${order.id}`)}
                                      title={t('customOrder.viewDetails')}
                                    >
                                      <i className="fas fa-star me-1"></i>{t('customOrder.viewDetails')}
                                    </button>
                                  )}
                                  
                                  {/* Re-order Button - Only for CANCELLED orders */}
                                  {order.status === 'CANCELLED' && (
                                    <button
                                      className="btn btn-sm btn-primary"
                                      onClick={() => handleReOrder(order)}
                                      title={t('customOrder.reOrder')}
                                    >
                                      <i className="fas fa-redo me-1"></i>{t('customOrder.reOrder')}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {(() => {
                    const totalPages = Math.ceil(orders.length / itemsPerPage);
                    if (totalPages <= 1) return null;
                    
                    const getPageNumbers = () => {
                      const pages = [];
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                      
                      if (endPage - startPage < maxVisible - 1) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }
                      return pages;
                    };
                    
                    return (
                      <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="text-muted">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, orders.length)} of {orders.length} orders
                        </div>
                        <nav>
                          <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                              >
                                <i className="fas fa-chevron-left"></i> Previous
                              </button>
                            </li>
                            {getPageNumbers().map((pageNum) => (
                              <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => setCurrentPage(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                              >
                                Next <i className="fas fa-chevron-right"></i>
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    );
                  })()}
                </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Confirm Delete Order
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowDeleteConfirm(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    <strong>Warning:</strong> This action cannot be undone!
                  </div>
                  
                  <p className="mb-3">Are you sure you want to delete the following order?</p>
                  
                  <div className="card border mb-3">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-6">
                          <strong>Order Number:</strong>
                        </div>
                        <div className="col-6">
                          #{showDeleteConfirm.orderNumber || showDeleteConfirm.id}
                        </div>
                      </div>
                      <hr className="my-2" />
                      <div className="row">
                        <div className="col-6">
                          <strong>Product Type:</strong>
                        </div>
                        <div className="col-6">
                          {showDeleteConfirm.productType || 'N/A'}
                        </div>
                      </div>
                      <hr className="my-2" />
                      <div className="row">
                        <div className="col-6">
                          <strong>Status:</strong>
                        </div>
                        <div className="col-6">
                          <span className={`badge ${
                            showDeleteConfirm.status === 'PENDING' ? 'bg-warning text-dark' :
                            showDeleteConfirm.status === 'CANCELLED' ? 'bg-secondary' :
                            showDeleteConfirm.status === 'REJECTED' ? 'bg-danger' : 'bg-light'
                          }`}>
                            {showDeleteConfirm.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <hr className="my-2" />
                      <div className="row">
                        <div className="col-6">
                          <strong>Total Amount:</strong>
                        </div>
                        <div className="col-6">
                          <strong className="text-success">
                            Rs. {(showDeleteConfirm.totalAmount || showDeleteConfirm.estimatedCost || 0).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {(showDeleteConfirm.status === 'PENDING' || showDeleteConfirm.status === 'CANCELLED' || showDeleteConfirm.status === 'REJECTED') && (
                    <p className="text-muted small mb-0">
                      <i className="fas fa-info-circle me-1"></i>
                      This will permanently remove the order from your order list.
                    </p>
                  )}
                  
                  {showDeleteConfirm.status !== 'PENDING' && showDeleteConfirm.status !== 'CANCELLED' && showDeleteConfirm.status !== 'REJECTED' && (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Note:</strong> Only pending, cancelled, or rejected orders can be deleted. This order cannot be deleted at this time.
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    <i className="fas fa-times me-1"></i>Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(showDeleteConfirm)}
                    disabled={showDeleteConfirm.status !== 'PENDING' && showDeleteConfirm.status !== 'CANCELLED' && showDeleteConfirm.status !== 'REJECTED'}
                  >
                    <i className="fas fa-trash me-1"></i>
                    {(showDeleteConfirm.status === 'PENDING' || showDeleteConfirm.status === 'CANCELLED' || showDeleteConfirm.status === 'REJECTED') ? 'Delete Order' : 'Cannot Delete'}
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
