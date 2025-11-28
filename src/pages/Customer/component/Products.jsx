// src/components/User/ProductsPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import Footer from './Footer';
import { getAllProducts } from '../../../services/productService';
import { ErrorMessageToast, SuccesfulMessageToast, WarningMessageToast } from '../../../utils/Tostify.util';
import { useCart } from './CartContext';
import { useAuth } from "../../../Context/AuthContext";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // 4 products per row x 2 rows = 8 products per page

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category || 'Other'))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'All' || (product.category || 'Other') === selectedCategory;
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleAddToCart = (product) => {
    if (!user) {
      WarningMessageToast("Please login to add products to cart.");
      navigate("/login");
      return;
    }
    
    // Check stock availability
    const currentStock = product.stock ?? 0;
    if (currentStock <= 0) {
      WarningMessageToast(`${product.name} is out of stock.`);
      return;
    }
    
    // Check if adding this item would exceed available stock
    const existingCartItem = cartItems.find(item => item.id === product.id);
    const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
    
    if (currentCartQuantity + 1 > currentStock) {
      WarningMessageToast(`Only ${currentStock} units available for ${product.name}.`);
      return;
    }
    
    addToCart(product, 1);
    SuccesfulMessageToast(`${product.name} added to cart`);
  };

  const viewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Gold color from your requirement
  const goldColor = '#CE9233';
  const goldHover = '#b87d2a';
  const placeholderImage = 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=300&h=200&fit=crop';

  return (
    <>
      <Header/>
      <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Custom CSS for gold theme */}
        <style>
          {`
            .btn-gold {
              background-color: ${goldColor};
              border-color: ${goldColor};
              color: white;
            }
            .btn-gold:hover {
              background-color: ${goldHover};
              border-color: ${goldHover};
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
            .border-gold {
              border-color: ${goldColor} !important;
            }
            .bg-gold {
              background-color: ${goldColor} !important;
            }
            .product-card {
              transition: all 0.3s ease;
              border: 1px solid #e9ecef;
              height: 100%;
            }
            .product-card:hover {
              transform: translateY(-3px);
              box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            }
            .category-btn {
              transition: all 0.3s ease;
            }
            .page-item.active .page-link {
              background-color: ${goldColor};
              border-color: ${goldColor};
            }
            .page-link {
              color: ${goldColor};
            }
            .page-link:hover {
              color: ${goldHover};
            }
            .btn-details {
              border: 1px solid #dee2e6;
              color: #6c757d;
            }
            .btn-details:hover {
              background-color: #f8f9fa;
              color: #495057;
            }
          `}
        </style>

        {/* Header Section */}
        <div className="container-fluid page-header pt-5 mb-6 wow fadeIn" data-wow-delay="0.1s">
          <div className="container text-center pt-5">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="bg-white p-5">
                  <h1 className="display-6 text-uppercase mb-3 animated slideInDown">Products</h1>
                  <nav aria-label="breadcrumb animated slideInDown">
                    <ol className="breadcrumb justify-content-center mb-0">
                      <li className="breadcrumb-item"><a href="#">Home</a></li>
                      <li className="breadcrumb-item"><a href="#">Pages</a></li>
                      <li className="breadcrumb-item" aria-current="page">Products</li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <h1 className="display-5 fw-bold text-gold mb-3">WeldPro Shop</h1>
          <p className="lead text-muted">Professional Welding Equipment & Accessories</p>
        </div>
        
        {/* Main Content */}
        <div className="container py-4">
          {/* Search and Filter Section */}
          <div className="row mb-4">
            <div className="col-12">
              {/* Search Bar */}
              <div className="row mb-3">
                <div className="col-lg-6 mx-auto">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search welding products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div className="row mb-3">
                <div className="col-12">
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        className={`btn btn-sm category-btn ${
                          selectedCategory === category ? 'btn-gold' : 'btn-outline-gold'
                        } rounded-pill px-3`}
                        onClick={() => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                        }}
                      >
                        {category}
                        {category !== 'All' && (
                          <span className="badge bg-light text-dark ms-1">
                            {products.filter(p => p.category === category).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results Header */}
              <div className="row">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="text-dark mb-1">
                        {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                      </h5>
                      <p className="text-muted mb-0 small">
                        Showing {currentProducts.length} of {filteredProducts.length} products
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">Sort:</span>
                      <select 
                        className="form-select form-select-sm border-gold" 
                        style={{ width: 'auto' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="name">Name</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid - 4 per row */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-gold" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-3">Loading products...</p>
            </div>
          ) : (
            <div className="row g-3">
              {currentProducts.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <i className="fas fa-search fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted mb-2">No products found</h5>
                  <p className="text-muted mb-3 small">Try adjusting your search terms</p>
                  <button 
                    className="btn btn-gold btn-sm"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setCurrentPage(1);
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                currentProducts.map(product => {
                  const inStock = (product.stock ?? 0) > 0;
                  const statusLabel = inStock ? 'In Stock' : 'Out of Stock';
                  const productImage = product.imageUrl || placeholderImage;
                  const description = product.description || 'No description provided yet.';
                  return (
                    <div key={product.id} className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                      <div className="card product-card bg-white">
                        {/* Product Image */}
                        <div className="position-relative">
                          <img
                            src={productImage}
                            className="card-img-top"
                            alt={product.name}
                            style={{ height: '160px', objectFit: 'cover' }}
                          />
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className={`badge ${inStock ? 'bg-success' : 'bg-danger'} px-2 py-1`}>
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                        
                        {/* Product Body */}
                        <div className="card-body d-flex flex-column p-3">
                          {/* Category */}
                          <div className="mb-2">
                            <span className="badge bg-light text-dark small">{product.category || 'General'}</span>
                          </div>
                          
                          {/* Product Name */}
                          <h6 className="card-title fw-bold text-dark mb-2" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
                            {product.name}
                          </h6>
                          
                          {/* Description */}
                          <p className="card-text text-muted mb-3 flex-grow-1 small" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                            {description.length > 80 
                              ? `${description.substring(0, 80)}...` 
                              : description
                            }
                          </p>
                          
                          {/* Price and Stock */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="h6 fw-bold text-gold mb-0">
                                Rs. {product.price ? Number(product.price).toFixed(2) : '0.00'}
                              </span>
                              <small className={`text-${!inStock ? 'danger' : 'muted'} small`}>
                                {product.stock ?? 0} units
                              </small>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="d-grid gap-2">
                        <button 
                          className="btn btn-gold btn-sm"
                          disabled={!inStock}
                          onClick={() => handleAddToCart(product)}
                        >
                              {inStock ? (
                                <>
                                  <i className="fas fa-cart-plus me-1"></i>
                                  Add to Cart
                                </>
                              ) : (
                                'Out of Stock'
                              )}
                            </button>
                            <button 
                              className="btn btn-outline-gold btn-sm"
                              onClick={() => viewDetails(product.id)}
                            >
                              <i className="fas fa-eye me-1"></i>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <div className="row mt-4">
              <div className="col-12">
                <nav>
                  <ul className="pagination justify-content-center mb-0">
                    {/* Previous Button */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left me-1"></i>
                        Previous
                      </button>
                    </li>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}

                    {/* Next Button */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
                
                {/* Page Info */}
                <div className="text-center mt-2">
                  <small className="text-muted">
                    Page {currentPage} of {totalPages} • {filteredProducts.length} total products
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="bg-white rounded p-3 shadow-sm">
                <div className="row text-center g-3">
                  <div className="col-md-3 col-6">
                    <i className="fas fa-shield-alt fs-4 text-gold mb-2"></i>
                    <h6 className="fw-bold text-dark small mb-1">1-Year Warranty</h6>
                    <small className="text-muted">All products</small>
                  </div>
                  <div className="col-md-3 col-6">
                    <i className="fas fa-shipping-fast fs-4 text-gold mb-2"></i>
                    <h6 className="fw-bold text-dark small mb-1">Free Shipping</h6>
                    <small className="text-muted">Over $200</small>
                  </div>
                  <div className="col-md-3 col-6">
                    <i className="fas fa-tools fs-4 text-gold mb-2"></i>
                    <h6 className="fw-bold text-dark small mb-1">Expert Support</h6>
                    <small className="text-muted">Professionals</small>
                  </div>
                  <div className="col-md-3 col-6">
                    <i className="fas fa-undo fs-4 text-gold mb-2"></i>
                    <h6 className="fw-bold text-dark small mb-1">Easy Returns</h6>
                    <small className="text-muted">30-day policy</small>
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

export default ProductsPage;