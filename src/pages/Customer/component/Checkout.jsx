// src/pages/Customer/component/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../Context/AuthContext";
import { saveDeliveryInfo, createOrder, getSavedDeliveryAddresses, updateDeliveryInfo } from "../../../services/orderService";
import { initiateEsewaPayment } from "../../../services/paymentService";
import { getAllProducts, getProductById } from "../../../services/productService";
import { ErrorMessageToast, SuccesfulMessageToast, WarningMessageToast } from '../../../utils/Tostify.util';
import Header from "./Header";
import Footer from "./Footer";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { cartItems: cartItemsRaw, clearCart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const cartItems = Array.isArray(cartItemsRaw) ? cartItemsRaw : [];
  const subtotal = cartItems.length > 0 ? (getCartTotal ? getCartTotal() : 0) : 0;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [savedDeliveryId, setSavedDeliveryId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Delivery form state
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: user?.name || "",
    streetAddress: "",
    wardNumber: "",
    municipality: "",
    district: "",
    landmark: "",
    phoneNumber: user?.phoneNumber || "",
    alternatePhoneNumber: "",
    email: user?.email || "",
    deliveryInstructions: "",
    saveAddress: false
  });

  const [selectedMethod, setSelectedMethod] = useState("");
  const [errors, setErrors] = useState({});
  const shipping = subtotal > 200 ? 0 : 135;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Fetch saved addresses on component mount
  useEffect(() => {
    if (user && user.id) {
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const addresses = await getSavedDeliveryAddresses();
      setSavedAddresses(addresses || []);
      // If user has saved addresses, select the first one by default
      if (addresses && addresses.length > 0) {
        loadAddressIntoForm(addresses[0]);
        setSelectedAddressId(addresses[0].id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error("Failed to fetch saved addresses:", error);
      setShowNewAddressForm(true);
    }
  };

  const loadAddressIntoForm = (address) => {
    setDeliveryInfo({
      fullName: address.fullName || user?.name || "",
      streetAddress: address.address || "",
      wardNumber: address.wardNumber || "",
      municipality: address.city || "",
      district: address.state || "",
      landmark: address.landmark || "",
      phoneNumber: address.phone || user?.phoneNumber || "",
      alternatePhoneNumber: address.alternatePhoneNumber || "",
      email: address.email || user?.email || "",
      deliveryInstructions: address.deliveryInstructions || "",
      saveAddress: address.saveAddress || false
    });
    setSavedDeliveryId(address.id);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    loadAddressIntoForm(address);
    setIsEditing(false);
    setShowNewAddressForm(true); // Show form so user can see and edit selected address
  };

  const handleEditAddress = (address) => {
    setSelectedAddressId(address.id);
    loadAddressIntoForm(address);
    setIsEditing(true);
    setShowNewAddressForm(true);
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setIsEditing(false);
    setShowNewAddressForm(true);
    setDeliveryInfo({
      fullName: user?.name || "",
      streetAddress: "",
      wardNumber: "",
      municipality: "",
      district: "",
      landmark: "",
      phoneNumber: user?.phoneNumber || "",
      alternatePhoneNumber: "",
      email: user?.email || "",
      deliveryInstructions: "",
      saveAddress: false
    });
  };


  // Validate delivery information
  const validateForm = () => {
    const newErrors = {};
    if (!deliveryInfo.fullName.trim())
      newErrors.fullName = t('checkout.fullNameRequired');
    if (!deliveryInfo.streetAddress.trim())
      newErrors.streetAddress = t('checkout.streetAddressRequired');
    if (!deliveryInfo.municipality.trim())
      newErrors.municipality = t('checkout.municipalityRequired');
    if (!deliveryInfo.district.trim())
      newErrors.district = t('checkout.districtRequired');
    if (!deliveryInfo.phoneNumber.trim())
      newErrors.phoneNumber = t('checkout.phoneNumberRequired');
    if (
      deliveryInfo.phoneNumber.trim() &&
      !/^\+?\d{10,}$/.test(deliveryInfo.phoneNumber)
    )
      newErrors.phoneNumber = t('checkout.invalidPhoneNumber');
    if (
      deliveryInfo.alternatePhoneNumber.trim() &&
      !/^\+?\d{10,}$/.test(deliveryInfo.alternatePhoneNumber)
    )
      newErrors.alternatePhoneNumber = t('checkout.invalidAlternatePhone');
    if (deliveryInfo.email.trim() && !/\S+@\S+\.\S+/.test(deliveryInfo.email))
      newErrors.email = t('checkout.invalidEmail');
    if (!selectedMethod)
      newErrors.paymentMethod = t('checkout.selectPaymentMethod');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) {
      ErrorMessageToast(t('checkout.fillRequiredFields'));
      return;
    }

    try {
      const deliveryPayload = {
        fullName: deliveryInfo.fullName,
        email: deliveryInfo.email,
        phone: deliveryInfo.phoneNumber,
        address: deliveryInfo.streetAddress,
        city: deliveryInfo.municipality,
        state: deliveryInfo.district,
        landmark: deliveryInfo.landmark,
        country: 'Nepal',
        wardNumber: deliveryInfo.wardNumber,
        alternatePhoneNumber: deliveryInfo.alternatePhoneNumber,
        deliveryInstructions: deliveryInfo.deliveryInstructions,
        saveAddress: deliveryInfo.saveAddress
      };

      let savedDelivery;
      if (isEditing && selectedAddressId) {
        savedDelivery = await updateDeliveryInfo(selectedAddressId, deliveryPayload);
        SuccesfulMessageToast(t('checkout.addressUpdatedSuccessfully'));
      } else {
        savedDelivery = await saveDeliveryInfo(deliveryPayload);
        SuccesfulMessageToast(t('checkout.addressSavedSuccessfully'));
      }

      setSavedDeliveryId(savedDelivery.id);
      await fetchSavedAddresses();
      setIsEditing(false);
      setShowNewAddressForm(false);
    } catch (error) {
      ErrorMessageToast(error.message || t('checkout.failedToSaveAddress'));
    }
  };

  const handleConfirmOrder = async () => {
    if (!user || !user.id) {
      ErrorMessageToast(t('checkout.pleaseLoginToConfirm'));
      navigate("/login");
      return;
    }

    if (!validateForm()) {
      ErrorMessageToast(t('checkout.fillRequiredFields'));
      return;
    }

    setIsLoading(true);

    try {
      // First, save delivery information
      const deliveryPayload = {
        fullName: deliveryInfo.fullName,
        email: deliveryInfo.email,
        phone: deliveryInfo.phoneNumber,
        address: deliveryInfo.streetAddress,
        city: deliveryInfo.municipality,
        state: deliveryInfo.district,
        landmark: deliveryInfo.landmark,
        country: 'Nepal',
        wardNumber: deliveryInfo.wardNumber,
        alternatePhoneNumber: deliveryInfo.alternatePhoneNumber,
        deliveryInstructions: deliveryInfo.deliveryInstructions,
        saveAddress: deliveryInfo.saveAddress
      };

      let deliveryId = savedDeliveryId;
      if (!deliveryId || isEditing) {
        if (isEditing && selectedAddressId) {
          const updated = await updateDeliveryInfo(selectedAddressId, deliveryPayload);
          deliveryId = updated.id;
        } else {
          const savedDelivery = await saveDeliveryInfo(deliveryPayload);
          deliveryId = savedDelivery.id;
        }
        setSavedDeliveryId(deliveryId);
      }

      // Validate stock availability before creating order
      const stockValidationErrors = [];
      const updatedCartItems = [];
      
      for (const item of cartItems) {
        try {
          const currentProduct = await getProductById(item.id);
          const currentStock = currentProduct.stock ?? 0;
          const requestedQuantity = item.quantity;
          
          if (currentStock <= 0) {
            stockValidationErrors.push(`${item.name} is out of stock`);
            removeFromCart(item.id);
          } else if (currentStock < requestedQuantity) {
            stockValidationErrors.push(`${item.name}: Only ${currentStock} available (you requested ${requestedQuantity})`);
            // Update quantity to available stock
            updateQuantity(item.id, currentStock);
            updatedCartItems.push({ ...item, quantity: currentStock });
          } else {
            updatedCartItems.push(item);
          }
        } catch (error) {
          console.error(`Failed to validate stock for product ${item.id}:`, error);
          // Continue with the item if we can't validate stock
          updatedCartItems.push(item);
        }
      }
      
      // If there were stock issues, show errors and prevent order
      if (stockValidationErrors.length > 0) {
        const errorMsg = stockValidationErrors.join('. ');
        WarningMessageToast(`Stock issues detected: ${errorMsg}. Your cart has been updated. Please review and try again.`);
        setIsLoading(false);
        return;
      }
      
      // If cart was updated, refresh the page or show message
      if (updatedCartItems.length !== cartItems.length) {
        WarningMessageToast("Some items were removed from your cart due to stock issues. Please review and try again.");
        setIsLoading(false);
        return;
      }

      const orderItems = updatedCartItems.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.image || item.imageUrl || ''
      }));

      const orderData = {
        deliveryInfoId: deliveryId,
        customerName: deliveryInfo.fullName,
        customerEmail: deliveryInfo.email || user?.email,
        paymentMethod: selectedMethod.toUpperCase(),
        paymentStatus: selectedMethod === 'cod' ? 'PENDING' : 'PENDING',
        totalAmount: total,
        items: orderItems
      };

      // Create order FIRST for both payment methods (this triggers admin notification)
      const createdOrder = await createOrder(orderData);

      if (selectedMethod === "esewa") {
        // After order is created, initiate eSewa payment
        const response = await initiateEsewaPayment({
          ...orderData,
          orderId: createdOrder.id // Pass order ID for verification
        });
        const paymentRequest = response;

        // Validate payment request data
        if (!paymentRequest) {
          throw new Error("Failed to receive payment request from server");
        }

        // Required fields for eSewa
        const requiredFields = [
          'amount', 'tax_amount', 'total_amount', 'transaction_uuid', 
          'product_code', 'success_url', 'failure_url', 
          'signed_field_names', 'signature'
        ];

        const missingFields = requiredFields.filter(field => !paymentRequest[field]);
        if (missingFields.length > 0) {
          console.error("Missing payment fields:", missingFields);
          console.error("Payment request:", paymentRequest);
          throw new Error(`Missing required payment fields: ${missingFields.join(', ')}`);
        }

        // Create form and submit to eSewa
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        const fields = {
          amount: String(paymentRequest.amount || '0'),
          tax_amount: String(paymentRequest.tax_amount || '0'),
          total_amount: String(paymentRequest.total_amount || '0'),
          transaction_uuid: String(paymentRequest.transaction_uuid || ''),
          product_code: String(paymentRequest.product_code || ''),
          product_service_charge: String(paymentRequest.product_service_charge || '0'),
          product_delivery_charge: String(paymentRequest.product_delivery_charge || '0'),
          success_url: String(paymentRequest.success_url || ''),
          failure_url: String(paymentRequest.failure_url || ''),
          signed_field_names: String(paymentRequest.signed_field_names || ''),
          signature: String(paymentRequest.signature || ''),
        };

        // Validate all fields have values
        for (const [key, value] of Object.entries(fields)) {
          if (!value || value === 'undefined' || value === 'null') {
            console.error(`Invalid field value for ${key}:`, value);
            throw new Error(`Invalid payment field: ${key}`);
          }
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }

        // Log payment request for debugging (remove in production)
        console.log("Submitting eSewa payment with fields:", fields);

        // Store order ID and type in sessionStorage for verification
        sessionStorage.setItem('pendingEsewaOrderId', createdOrder.id.toString());
        sessionStorage.setItem('pendingEsewaOrderType', 'regular');

        document.body.appendChild(form);
        form.submit();
      } else {
        // Cash on Delivery - order already created above
        SuccesfulMessageToast(t('checkout.orderConfirmed') || "Order confirmed with Cash on Delivery!");
        clearCart();
        navigate("/");
      }
    } catch (error) {
      console.error("Order confirmation error:", error);
      
      // Parse error message for better user experience
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
          // Check if it's a stock error
          if (errorData.includes("Insufficient stock")) {
            const productIdMatch = errorData.match(/product ID: (\d+)/);
            if (productIdMatch) {
              const productId = productIdMatch[1];
              // Try to find the product name in cart
              const product = cartItems.find(item => item.id === parseInt(productId));
              const productName = product ? product.name : `Product ID ${productId}`;
              errorMessage = `Insufficient stock for ${productName}. Please update your cart and try again.`;
            } else {
              errorMessage = "One or more products are out of stock. Please update your cart and try again.";
            }
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      ErrorMessageToast(`Order confirmation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const goldColor = '#CE9233';

  const loginGate = !user ? (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h3 className="mb-3">{t('checkout.pleaseLoginToConfirm')}</h3>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          {t('common.login')}
        </button>
      </div>
    </div>
  ) : null;

  const emptyCartGate = (!Array.isArray(cartItems) || cartItems.length === 0) ? (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center py-5">
            <i className="fas fa-shopping-cart fs-1 text-muted mb-4"></i>
            <h3 className="text-muted mb-3">{t('cart.yourCartIsEmpty')}</h3>
            <button 
              className="btn btn-primary px-4"
              style={{ backgroundColor: goldColor, borderColor: goldColor }}
              onClick={() => navigate('/products')}
            >
              {t('cart.continueShopping')}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  if (loginGate) return loginGate;
  if (emptyCartGate) return emptyCartGate;

  return (
    <>
      <Header />
      <div className="min-vh-100 bg-light py-5">
        <div className="container">
          <div className="row">
            {/* Left Column - Delivery and Payment Form */}
            <div className="col-lg-8">
              {/* Saved Addresses Section */}
              {savedAddresses.length > 0 && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">{t('checkout.savedAddresses')}</h5>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleNewAddress}
                    >
                      <i className="fas fa-plus me-1"></i>{t('checkout.newAddress')}
                    </button>
                  </div>
                  <div className="card-body">
                    {savedAddresses.map((address) => (
                      <div 
                        key={address.id} 
                        className={`border rounded p-3 mb-3 ${selectedAddressId === address.id ? 'border-primary bg-light' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelectAddress(address)}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-2">{address.fullName}</h6>
                            <p className="mb-1 small">{address.address}</p>
                            <p className="mb-1 small">
                              {address.city}, {address.state} {address.landmark ? `- ${address.landmark}` : ''}
                            </p>
                            <p className="mb-0 small text-muted">Phone: {address.phone}</p>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            title={t('checkout.editAddress') || 'Edit Address'}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Information Form - Always show when form is active or no saved addresses */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h2 className="h5 mb-0 fw-bold">
                      {isEditing ? t('checkout.editAddress') : savedAddresses.length > 0 ? t('checkout.newAddress') : t('checkout.deliveryInformation')}
                    </h2>
                    <div className="text-muted small">* {t('common.required') || 'Required fields'}</div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.fullName')} *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.fullName ? "border-danger" : ""}`}
                          value={deliveryInfo.fullName}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              fullName: e.target.value,
                            })
                          }
                        />
                        {errors.fullName && (
                          <p className="text-danger small mt-1">{errors.fullName}</p>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.phoneNumber')} *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.phoneNumber ? "border-danger" : ""}`}
                          value={deliveryInfo.phoneNumber}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              phoneNumber: e.target.value,
                            })
                          }
                        />
                        {errors.phoneNumber && (
                          <p className="text-danger small mt-1">{errors.phoneNumber}</p>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.alternatePhoneNumber')}</label>
                        <input
                          type="text"
                          className={`form-control ${errors.alternatePhoneNumber ? "border-danger" : ""}`}
                          value={deliveryInfo.alternatePhoneNumber}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              alternatePhoneNumber: e.target.value,
                            })
                          }
                        />
                        {errors.alternatePhoneNumber && (
                          <p className="text-danger small mt-1">{errors.alternatePhoneNumber}</p>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.email')}</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? "border-danger" : ""}`}
                          value={deliveryInfo.email}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              email: e.target.value,
                            })
                          }
                        />
                        {errors.email && (
                          <p className="text-danger small mt-1">{errors.email}</p>
                        )}
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.streetAddress')} *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.streetAddress ? "border-danger" : ""}`}
                          value={deliveryInfo.streetAddress}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              streetAddress: e.target.value,
                            })
                          }
                        />
                        {errors.streetAddress && (
                          <p className="text-danger small mt-1">{errors.streetAddress}</p>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.wardNumber')}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={deliveryInfo.wardNumber}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              wardNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.municipality')} *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.municipality ? "border-danger" : ""}`}
                          value={deliveryInfo.municipality}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              municipality: e.target.value,
                            })
                          }
                        />
                        {errors.municipality && (
                          <p className="text-danger small mt-1">{errors.municipality}</p>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.district')} *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.district ? "border-danger" : ""}`}
                          value={deliveryInfo.district}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              district: e.target.value,
                            })
                          }
                        />
                        {errors.district && (
                          <p className="text-danger small mt-1">{errors.district}</p>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.landmark')}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={deliveryInfo.landmark}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              landmark: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label fw-semibold">{t('checkout.deliveryInstructions')}</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={deliveryInfo.deliveryInstructions}
                          onChange={(e) =>
                            setDeliveryInfo({
                              ...deliveryInfo,
                              deliveryInstructions: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-12 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={deliveryInfo.saveAddress}
                            onChange={(e) =>
                              setDeliveryInfo({
                                ...deliveryInfo,
                                saveAddress: e.target.checked,
                              })
                            }
                          />
                          <label className="form-check-label">
                            {t('checkout.saveAddress')}
                          </label>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="col-md-12">
                          <button
                            className="btn btn-primary me-2"
                            onClick={handleSaveAddress}
                          >
                            <i className="fas fa-save me-1"></i>{t('checkout.saveAddress')}
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setIsEditing(false);
                              setShowNewAddressForm(false);
                              if (savedAddresses.length > 0) {
                                handleSelectAddress(savedAddresses[0]);
                              }
                            }}
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Selection - Only COD and eSewa */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h4 className="h5 fw-bold mb-0">{t('checkout.selectPaymentMethod')}</h4>
                </div>
                <div className="card-body">
                  <div className="d-flex gap-4 mb-3">
                    <div className="text-center">
                      <div 
                        className="border p-3 mb-2" 
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer',
                          borderColor: selectedMethod === "esewa" ? '#28a745' : '#dee2e6',
                          borderWidth: selectedMethod === "esewa" ? '3px' : '1px'
                        }}
                        onClick={() => setSelectedMethod("esewa")}
                      >
                        <i className="fas fa-mobile-alt fa-3x text-success"></i>
                      </div>
                      <div
                        className={`rounded p-2 ${
                          selectedMethod === "esewa"
                            ? "bg-success text-white"
                            : "bg-light text-dark border"
                        }`}
                        style={{ cursor: 'pointer', width: '120px' }}
                        onClick={() => setSelectedMethod("esewa")}
                      >
                        {t('checkout.esewa')}
                      </div>
                    </div>
                    <div className="text-center">
                      <div 
                        className="border p-3 mb-2" 
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          cursor: 'pointer',
                          borderColor: selectedMethod === "cod" ? '#ffc107' : '#dee2e6',
                          borderWidth: selectedMethod === "cod" ? '3px' : '1px'
                        }}
                        onClick={() => setSelectedMethod("cod")}
                      >
                        <i className="fas fa-money-bill-wave fa-3x text-warning"></i>
                      </div>
                      <div
                        className={`rounded p-2 ${
                          selectedMethod === "cod"
                            ? "bg-success text-white"
                            : "bg-light text-dark border"
                        }`}
                        style={{ cursor: 'pointer', width: '120px' }}
                        onClick={() => setSelectedMethod("cod")}
                      >
                        {t('checkout.cashOnDelivery')}
                      </div>
                    </div>
                  </div>
                  {errors.paymentMethod && (
                    <p className="text-danger small">{errors.paymentMethod}</p>
                  )}

                  {/* Payment Method Confirmation */}
                  {selectedMethod === "esewa" && (
                    <div className="alert alert-success mt-3">
                      <h5 className="fw-bold">eSewa Selected</h5>
                      <p className="mb-0">eSewa account {deliveryInfo.fullName} will be charged</p>
                    </div>
                  )}
                  {selectedMethod === "cod" && (
                    <div className="alert alert-warning mt-3">
                      <h5 className="fw-bold">Cash on Delivery Selected</h5>
                      <p className="mb-0 small">
                        You may pay in cash to our courier upon receiving your parcel at the doorstep. 
                        Before agreeing to receive the parcel, check if your delivery status has been updated 
                        to 'Out for Delivery'.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                <div className="card-header bg-white">
                  <h5 className="mb-0 fw-bold">{t('checkout.orderSummary')}</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        {t('cart.items')} ({cartItems.length} {cartItems.length === 1 ? t('cart.item') : t('cart.items')})
                      </span>
                      <span className="fw-semibold">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">{t('cart.subtotal')}</span>
                      <span className="fw-semibold">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">{t('cart.shipping')}</span>
                      <span className="fw-semibold">Rs. {shipping.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">{t('cart.tax')}</span>
                      <span className="fw-semibold">Rs. {tax.toFixed(2)}</span>
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <p className="fw-bold mb-0">{t('cart.total')}</p>
                      <p className="text-muted small mb-0">{t('common.allTaxesIncluded') || 'All taxes included'}</p>
                    </div>
                    <p className="h5 fw-bold text-success mb-0">Rs. {total.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    className={`w-100 btn py-3 fw-semibold ${
                      isLoading || !selectedMethod
                        ? "btn-secondary"
                        : "btn-success"
                    }`}
                    disabled={isLoading || !selectedMethod}
                    style={!isLoading && selectedMethod ? { backgroundColor: goldColor, borderColor: goldColor } : {}}
                  >
                    {isLoading
                      ? t('checkout.processingOrder')
                      : `${t('checkout.placeOrder')} (${cartItems.length} ${t('cart.items')})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPage;
