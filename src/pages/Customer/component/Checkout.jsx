// src/pages/Customer/component/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../../Context/AuthContext";
import { saveDeliveryInfo, createOrder, getSavedDeliveryAddresses, updateDeliveryInfo } from "../../../services/orderService";
import { initiateEsewaPayment } from "../../../services/paymentService";
import { ErrorMessageToast, SuccesfulMessageToast } from '../../../utils/Tostify.util';
import Header from "./Header";
import Footer from "./Footer";

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
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

  const subtotal = getCartTotal();
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
      newErrors.fullName = "Full name is required";
    if (!deliveryInfo.streetAddress.trim())
      newErrors.streetAddress = "Street address is required";
    if (!deliveryInfo.municipality.trim())
      newErrors.municipality = "Municipality is required";
    if (!deliveryInfo.district.trim())
      newErrors.district = "District is required";
    if (!deliveryInfo.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (
      deliveryInfo.phoneNumber.trim() &&
      !/^\+?\d{10,}$/.test(deliveryInfo.phoneNumber)
    )
      newErrors.phoneNumber = "Invalid phone number";
    if (
      deliveryInfo.alternatePhoneNumber.trim() &&
      !/^\+?\d{10,}$/.test(deliveryInfo.alternatePhoneNumber)
    )
      newErrors.alternatePhoneNumber = "Invalid alternate phone number";
    if (deliveryInfo.email.trim() && !/\S+@\S+\.\S+/.test(deliveryInfo.email))
      newErrors.email = "Invalid email address";
    if (!selectedMethod)
      newErrors.paymentMethod = "Please select a payment method";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) {
      ErrorMessageToast("Please fill in all required fields correctly.");
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
        SuccesfulMessageToast("Address updated successfully!");
      } else {
        savedDelivery = await saveDeliveryInfo(deliveryPayload);
        SuccesfulMessageToast("Address saved successfully!");
      }

      setSavedDeliveryId(savedDelivery.id);
      await fetchSavedAddresses();
      setIsEditing(false);
      setShowNewAddressForm(false);
    } catch (error) {
      ErrorMessageToast(error.message || "Failed to save address");
    }
  };

  const handleConfirmOrder = async () => {
    if (!user || !user.id) {
      ErrorMessageToast("Please log in to confirm the order!");
      navigate("/login");
      return;
    }

    if (!validateForm()) {
      ErrorMessageToast("Please fill in all required fields correctly.");
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

      const orderItems = cartItems.map(item => ({
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

        // Create form and submit to eSewa
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        const fields = {
          amount: paymentRequest.amount,
          tax_amount: paymentRequest.tax_amount,
          total_amount: paymentRequest.total_amount,
          transaction_uuid: paymentRequest.transaction_uuid,
          product_code: paymentRequest.product_code,
          product_service_charge: paymentRequest.product_service_charge,
          product_delivery_charge: paymentRequest.product_delivery_charge,
          success_url: paymentRequest.success_url,
          failure_url: paymentRequest.failure_url,
          signed_field_names: paymentRequest.signed_field_names,
          signature: paymentRequest.signature,
        };

        for (const [key, value] of Object.entries(fields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }

        // Store order ID in sessionStorage for verification
        sessionStorage.setItem('pendingEsewaOrderId', createdOrder.id);

        document.body.appendChild(form);
        form.submit();
      } else {
        // Cash on Delivery - order already created above
        SuccesfulMessageToast("Order confirmed with Cash on Delivery!");
        clearCart();
        navigate("/");
      }
    } catch (error) {
      console.error("Order confirmation error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          error.message || 
                          "Failed to place order. Please try again.";
      ErrorMessageToast(`Order confirmation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const goldColor = '#CE9233';

  const loginGate = !user ? (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h3 className="mb-3">Please login to continue checkout</h3>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    </div>
  ) : null;

  const emptyCartGate = cartItems.length === 0 ? (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">
        <div className="row">
          <div className="col-12 text-center py-5">
            <i className="fas fa-shopping-cart fs-1 text-muted mb-4"></i>
            <h3 className="text-muted mb-3">Your cart is empty</h3>
            <button 
              className="btn btn-primary px-4"
              style={{ backgroundColor: goldColor, borderColor: goldColor }}
              onClick={() => navigate('/products')}
            >
              Continue Shopping
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
                    <h5 className="mb-0 fw-bold">Saved Delivery Addresses</h5>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleNewAddress}
                    >
                      <i className="fas fa-plus me-1"></i>New Address
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
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
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
                      {isEditing ? 'Edit Delivery Address' : savedAddresses.length > 0 ? 'New Delivery Address' : 'Delivery Information'}
                    </h2>
                    <div className="text-muted small">* Required fields</div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Full Name *</label>
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
                        <label className="form-label fw-semibold">Phone Number *</label>
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
                        <label className="form-label fw-semibold">Alternate Phone Number</label>
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
                        <label className="form-label fw-semibold">Email</label>
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
                        <label className="form-label fw-semibold">Street Address/Tole *</label>
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
                        <label className="form-label fw-semibold">Ward Number</label>
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
                        <label className="form-label fw-semibold">Municipality *</label>
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
                        <label className="form-label fw-semibold">District *</label>
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
                        <label className="form-label fw-semibold">Landmark (Optional)</label>
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
                        <label className="form-label fw-semibold">Delivery Instructions (Optional)</label>
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
                            Save this address for future orders
                          </label>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="col-md-12">
                          <button
                            className="btn btn-primary me-2"
                            onClick={handleSaveAddress}
                          >
                            <i className="fas fa-save me-1"></i>Save Address
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
                            Cancel
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
                  <h4 className="h5 fw-bold mb-0">Select Payment Method</h4>
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
                        eSewa Mobile Wallet
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
                        Cash on Delivery
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
                  <h5 className="mb-0 fw-bold">Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">
                        Items ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
                      </span>
                      <span className="fw-semibold">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span className="fw-semibold">Rs. {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Delivery Fee</span>
                      <span className="fw-semibold">Rs. {shipping.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tax</span>
                      <span className="fw-semibold">Rs. {tax.toFixed(2)}</span>
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <p className="fw-bold mb-0">Total</p>
                      <p className="text-muted small mb-0">All taxes included</p>
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
                      ? "Processing..."
                      : `Confirm Order (${cartItems.length} items)`}
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
