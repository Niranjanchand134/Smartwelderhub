// src/components/User/ProductDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './header';
import Footer from './Footer';
import { getProductById } from '../../../services/productService';
import { ErrorMessageToast, SuccesfulMessageToast, WarningMessageToast } from '../../../utils/Tostify.util';
import { useCart } from './CartContext';
import { useAuth } from "../../../Context/AuthContext";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext, cartItems } = useCart();
  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const placeholderImage = 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=600&h=400&fit=crop';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);
        setError(null);
        setSelectedImageIndex(0);
        setQuantity(1);
      } catch (err) {
        setError(err.message || 'Failed to load product.');
        ErrorMessageToast(err.message || 'Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!user) {
      WarningMessageToast("Please login to add products to cart.");
      navigate("/login");
      return;
    }
    if (!product) {
      WarningMessageToast("Product not available.");
      return;
    }
    
    // Check stock availability
    const currentStock = product.stock ?? 0;
    if (currentStock <= 0) {
      WarningMessageToast(`${product.name} is out of stock.`);
      return;
    }
    
    // Check if adding this quantity would exceed available stock
    const existingCartItem = cartItems.find(item => item.id === product.id);
    const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
    
    if (currentCartQuantity + quantity > currentStock) {
      WarningMessageToast(`Only ${currentStock} units available for ${product.name}. You already have ${currentCartQuantity} in cart.`);
      return;
    }
    
    addToCartContext(product, quantity);
    SuccesfulMessageToast(`${product.name} added to cart`);
  };

  const buyNow = () => {
    if (!user) {
      WarningMessageToast("Please login to buy this product.");
      navigate("/login");
      return;
    }
    if (!product) {
      WarningMessageToast("Product not available.");
      return;
    }
    
    // Check stock availability
    const currentStock = product.stock ?? 0;
    if (currentStock <= 0) {
      WarningMessageToast(`${product.name} is out of stock.`);
      return;
    }
    
    if (quantity > currentStock) {
      WarningMessageToast(`Only ${currentStock} units available for ${product.name}.`);
      return;
    }
    
    addToCartContext(product, quantity);
    navigate('/checkout');
  };

  const sendMessage = () => {
    alert('Opening message dialog...');
  };

  const goldColor = '#CE9233';
  const ratingValue = product?.rating ?? 4.5;
  const reviewsCount = product?.reviews ?? 0;
  const productImages = product?.imageUrl ? [product.imageUrl] : [placeholderImage];
  const activeImage = productImages[selectedImageIndex] || placeholderImage;
  const inStock = (product?.stock ?? 0) > 0;
  const statusLabel = inStock ? 'In Stock' : 'Out of Stock';
  const displayName = product?.name || 'Product';
  const displayCategory = product?.category || 'General';
  const priceLabel = product?.price ? Number(product.price).toFixed(2) : '0.00';
  const stockCount = product?.stock ?? 0;
  const description = product?.description || 'No description available yet.';
  const derivedFeatures = description
    .split('.')
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 4);
  const featureList = derivedFeatures.length ? derivedFeatures : [
    'High-quality produce sourced from trusted farmers',
    'Carefully handled and packaged',
    'Perfect for households and businesses',
    'Sustainable and eco-friendly practices'
  ];
  const specificationEntries = [
    { label: 'Category', value: displayCategory },
    { label: 'Price', value: `Rs. ${priceLabel}` },
    { label: 'Stock', value: `${stockCount} units` },
    { label: 'Added On', value: product?.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A' }
  ];

  if (!loading && !product) {
    return (
      <>
        <Header />
        <div className="container py-5 text-center">
          <h3>Product not found</h3>
          <button onClick={() => navigate('/products')} className="btn btn-primary mt-3">
            Back to Products
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
    <Header/>
    <div className="min-vh-100 bg-light">
      <style>
        {`
          .btn-gold {
            background-color: ${goldColor};
            border-color: ${goldColor};
            color: white;
          }
          .btn-gold:hover {
            background-color: #b87d2a;
            border-color: #b87d2a;
            color: white;
          }
          .btn-outline-gold {
            border-color: ${goldColor};
            color: ${goldColor};
          }
          .btn-outline-gold:hover {
            background-color: ${goldColor};
            color: white;
          }
          .text-gold {
            color: ${goldColor} !important;
          }
        `}
      </style>

      {/* Header Section */}
        <div className="container-fluid page-header pt-5 mb-6 wow fadeIn" data-wow-delay="0.1s">
            <div className="container text-center pt-5">
            <div className="row justify-content-center">
                <div className="col-lg-7">
                <div className="bg-white p-5">
                    <h1 className="display-6 text-uppercase mb-3 animated slideInDown">Products Details</h1>
                    <nav aria-label="breadcrumb animated slideInDown">
                    <ol className="breadcrumb justify-content-center mb-0">
                        <li className="breadcrumb-item"><a href="#">Home</a></li>
                        <li className="breadcrumb-item"><a href="#">Pages</a></li>
                        <li className="breadcrumb-item"><a href="#">Products</a></li>
                        <li className="breadcrumb-item" aria-current="page">ProductsDetails</li>
                    </ol>
                    </nav>
                </div>
                </div>
            </div>
            </div>
        </div>

      {/* Navigation
      <nav className="bg-light py-2">
        <div className="container">
          <button onClick={() => navigate('/')} className="btn btn-outline-black btn-sm">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Shop
          </button>
        </div>
      </nav> */}

      <div className="container py-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-gold" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading product details...</p>
          </div>
        ) : (
        <>
        <div className="row">
          {/* Product Images */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm mb-4">
              <img
                src={activeImage}
                className="card-img-top"
                alt={displayName}
                style={{ height: '400px', objectFit: 'cover' }}
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="row g-2">
              {productImages.map((image, index) => (
                <div key={index} className="col-3">
                  <img
                    src={image}
                    className={`img-thumbnail cursor-pointer ${selectedImageIndex === index ? 'border-gold' : ''}`}
                    alt={`${displayName} view ${index + 1}`}
                    style={{ 
                      height: '80px', 
                      objectFit: 'cover',
                      borderColor: selectedImageIndex === index ? goldColor : '#dee2e6',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="col-lg-6">
            <div className="ps-lg-4">
              {/* Category & Status */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="badge bg-gold">{displayCategory}</span>
                <span className={`badge ${inStock ? 'bg-success' : 'bg-danger'}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="h2 fw-bold text-dark mb-3">{displayName}</h1>

              {/* Rating */}
              <div className="d-flex align-items-center mb-3">
                <div className="text-warning me-2">
                  {'★'.repeat(Math.floor(ratingValue))}
                  {'☆'.repeat(5 - Math.floor(ratingValue))}
                </div>
                <span className="text-muted">({reviewsCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <h2 className="text-gold fw-bold">Rs. {priceLabel}</h2>
                <small className="text-muted">SKU: {product ? `SKU-${product.id}` : 'N/A'}</small>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-muted">{description}</p>
              </div>

              {/* Quantity Selector */}
              <div className="row align-items-center mb-4">
                <div className="col-auto">
                  <label className="form-label fw-semibold">Quantity:</label>
                </div>
                <div className="col-auto">
                  <div className="input-group" style={{ width: '120px' }}>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={stockCount || 1}
                    />
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setQuantity(stockCount > 0 ? Math.min(stockCount, quantity + 1) : quantity)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="col">
                  <small className="text-muted">{stockCount} units available</small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2 d-md-flex mb-4">
                <button 
                  className="btn btn-gold flex-fill me-md-2 py-3 fw-semibold"
                  onClick={buyNow}
                  disabled={!inStock}
                >
                  <i className="fas fa-bolt me-2"></i>
                  Buy Now
                </button>
                <button 
                  className="btn btn-outline-gold flex-fill py-3"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  <i className="fas fa-cart-plus me-2"></i>
                  Add to Cart
                </button>
              </div>

              {/* Message Button */}
              <div className="d-grid mb-4">
                <button className="btn btn-outline-dark py-2" onClick={sendMessage}>
                  <i className="fas fa-envelope me-2"></i>
                  Message Seller
                </button>
              </div>

              {/* Quick Info */}
              <div className="row text-center g-3 mb-4">
                <div className="col-4">
                  <i className="fas fa-shield-alt text-gold fs-5 mb-2"></i>
                  <div className="small">
                    <div className="fw-semibold">Warranty</div>
                    <small className="text-muted">{product?.warranty || 'Quality guaranteed'}</small>
                  </div>
                </div>
                <div className="col-4">
                  <i className="fas fa-shipping-fast text-gold fs-5 mb-2"></i>
                  <div className="small">
                    <div className="fw-semibold">Free Shipping</div>
                    <small className="text-muted">Over $200</small>
                  </div>
                </div>
                <div className="col-4">
                  <i className="fas fa-undo text-gold fs-5 mb-2"></i>
                  <div className="small">
                    <div className="fw-semibold">Returns</div>
                    <small className="text-muted">30 Days</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <ul className="nav nav-tabs nav-justified mb-4" id="productTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#features">
                      Features
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#specifications">
                      Specifications
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#reviews">
                      Reviews
                    </button>
                  </li>
                </ul>

                <div className="tab-content">
                  {/* Features Tab */}
                  <div className="tab-pane fade show active" id="features">
                    <ul className="list-unstyled">
                      {featureList.map((feature, index) => (
                        <li key={index} className="mb-2">
                          <i className="fas fa-check text-success me-2"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Specifications Tab */}
                  <div className="tab-pane fade" id="specifications">
                    <div className="row">
                      {specificationEntries.map((item) => (
                        <div key={item.label} className="col-md-6 mb-2">
                          <strong>{item.label}:</strong> {item.value}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews Tab */}
                  <div className="tab-pane fade" id="reviews">
                    <div className="text-center py-4">
                      <h5>Customer Reviews</h5>
                      <p className="text-muted">Average rating: {ratingValue}/5 ({reviewsCount} reviews)</p>
                      <button className="btn btn-outline-gold">
                        Write a Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default ProductDetail;