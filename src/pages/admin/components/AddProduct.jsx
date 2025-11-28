// src/components/AdminPanel/AddProductPage.js
import React, { useState } from 'react';
import { createProduct } from '../../../services/productService';
import { ErrorMessageToast, SuccesfulMessageToast } from '../../../utils/Tostify.util';

const AddProductPage = ({ setActiveMenu }) => {
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    images: []
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [mainImageData, setMainImageData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Welding Electrodes',
    'Welding Wire',
    'Welding Rods',
    'Welding Flux',
    'Welding Gas',
    'Welding Torches',
    'Welding Nozzles',
    'Welding Tips',
    'Welding Gloves',
    'Welding Helmets',
    'Welding Aprons',
    'Welding Clamps',
    'Welding Magnets',
    'Welding Brushes',
    'Cutting Discs',
    'Grinding Discs',
    'Safety Equipment',
    'Welding Tools',
    'Other Accessories'
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Product name is required';
        } else if (value.trim().length < 3) {
          newErrors.name = 'Product name must be at least 3 characters';
        } else if (value.trim().length > 100) {
          newErrors.name = 'Product name must be less than 100 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'category':
        if (!value) {
          newErrors.category = 'Category is required';
        } else {
          delete newErrors.category;
        }
        break;
      case 'price':
        if (!value || value === '') {
          newErrors.price = 'Price is required';
        } else if (isNaN(value) || parseFloat(value) <= 0) {
          newErrors.price = 'Price must be a positive number';
        } else if (parseFloat(value) < 1) {
          newErrors.price = 'Price must be at least Rs. 1';
        } else {
          delete newErrors.price;
        }
        break;
      case 'stock':
        if (!value || value === '') {
          newErrors.stock = 'Stock quantity is required';
        } else if (isNaN(value) || parseInt(value) < 1) {
          newErrors.stock = 'Stock quantity must be at least 1';
        } else if (parseInt(value) >= 1000) {
          newErrors.stock = 'Stock quantity must be less than 1000';
        } else {
          delete newErrors.stock;
        }
        break;
      case 'description':
        if (value && value.length > 1000) {
          newErrors.description = 'Description must be less than 1000 characters';
        } else {
          delete newErrors.description;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate on change
    validateField(name, value);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      ErrorMessageToast('Some files exceed 5MB limit. Please select smaller files.');
      setErrors(prev => ({ ...prev, images: 'File size must be less than 5MB' }));
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidTypes = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidTypes.length > 0) {
      ErrorMessageToast('Invalid file type. Please upload JPG, PNG, or GIF images only.');
      setErrors(prev => ({ ...prev, images: 'Invalid file type. Use JPG, PNG, or GIF' }));
      return;
    }

    // Clear image errors if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.images;
      return newErrors;
    });

    // Create preview URLs
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviewImages(prev => [...prev, ...newPreviews]);
    setProductData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Convert first selected image to base64 for backend storage
    try {
      const base64 = await convertToBase64(files[0]);
      setMainImageData(base64);
    } catch (error) {
      console.error('Failed to process image', error);
      ErrorMessageToast('Failed to process image. Please try another file.');
      setErrors(prev => ({ ...prev, images: 'Failed to process image' }));
    }
  };

  const removeImage = (index) => {
    setPreviewImages(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    if (index === 0) {
      setMainImageData('');
    }
  };

  const validateForm = () => {
    const fieldsToValidate = ['name', 'category', 'price', 'stock'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, productData[field])) {
        isValid = false;
      }
    });
    
    // Validate description if provided
    if (productData.description) {
      if (!validateField('description', productData.description)) {
        isValid = false;
      }
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      ErrorMessageToast('Please fix the validation errors before submitting.');
      return;
    }

    if (!mainImageData) {
      ErrorMessageToast('Please upload at least one image for the product.');
      setErrors(prev => ({ ...prev, images: 'At least one image is required' }));
      return;
    }

    // Additional validation for stock
    const stockValue = parseInt(productData.stock);
    if (stockValue >= 1000) {
      ErrorMessageToast('Stock quantity must be less than 1000.');
      setErrors(prev => ({ ...prev, stock: 'Stock quantity must be less than 1000' }));
      return;
    }

    const payload = {
      name: productData.name.trim(),
      category: productData.category,
      price: Number(productData.price),
      stock: stockValue,
      description: productData.description.trim(),
      imageUrl: mainImageData
    };

    try {
      setIsSubmitting(true);
      await createProduct(payload);
      SuccesfulMessageToast('Product added successfully!');

      // Reset form after submission
      setProductData({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        images: []
      });
      setPreviewImages([]);
      setMainImageData('');
      setErrors({});

      // Navigate back to listings page
      setActiveMenu('listings');
    } catch (error) {
      ErrorMessageToast(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveMenu('listings');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 mt-4">
        <div>
          <h2 className="mb-1">Add New Product</h2>
          <p className="text-muted mb-0">Add a new welding product to your inventory</p>
        </div>
        <button 
          className="btn btn-outline-secondary"
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left me-2"></i>Back to Listings
        </button>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Product Name */}
                <div className="mb-3">
                  <label htmlFor="productName" className="form-label fw-bold">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="productName"
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    placeholder="Enter product name"
                    minLength="3"
                    maxLength="100"
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block">
                      {errors.name}
                    </div>
                  )}
                  {!errors.name && (
                    <small className="text-muted">Minimum 3 characters, maximum 100 characters</small>
                  )}
                </div>

                {/* Category and Price Row */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="productCategory" className="form-label fw-bold">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                        id="productCategory"
                        name="category"
                        value={productData.category}
                        onChange={handleInputChange}
                        onBlur={(e) => validateField(e.target.name, e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <div className="invalid-feedback d-block">
                          {errors.category}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="productPrice" className="form-label fw-bold">
                        Price <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">Rs.</span>
                        <input
                          type="number"
                          className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                          id="productPrice"
                          name="price"
                          value={productData.price}
                          onChange={handleInputChange}
                          onBlur={(e) => validateField(e.target.name, e.target.value)}
                          placeholder="0.00"
                          min="1"
                          step="0.01"
                          required
                        />
                      </div>
                      {errors.price && (
                        <div className="invalid-feedback d-block">
                          {errors.price}
                        </div>
                      )}
                      {!errors.price && (
                        <small className="text-muted">Minimum price: Rs. 1</small>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Quantity */}
                <div className="mb-3">
                  <label htmlFor="productStock" className="form-label fw-bold">
                    Stock Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                    id="productStock"
                    name="stock"
                    value={productData.stock}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    placeholder="Enter available quantity (less than 1000)"
                    min="1"
                    max="999"
                    step="1"
                    required
                  />
                  {errors.stock && (
                    <div className="invalid-feedback d-block">
                      {errors.stock}
                    </div>
                  )}
                  {!errors.stock && (
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Stock quantity must be less than 1000 units
                    </small>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label htmlFor="productDescription" className="form-label fw-bold">
                    Product Description
                  </label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    id="productDescription"
                    name="description"
                    rows="4"
                    value={productData.description}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    placeholder="Describe your product (features, benefits, specifications, etc.)"
                    maxLength="1000"
                  ></textarea>
                  {errors.description && (
                    <div className="invalid-feedback d-block">
                      {errors.description}
                    </div>
                  )}
                  {!errors.description && (
                    <small className="text-muted">
                      {productData.description.length}/1000 characters
                    </small>
                  )}
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary me-md-2"
                    onClick={handleBack}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>Add Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">Product Images</h6>
            </div>
            <div className="card-body">
              {/* Image Upload Area */}
              <div className="mb-3">
                <label htmlFor="imageUpload" className="form-label fw-bold">
                  Upload Images <span className="text-danger">*</span>
                </label>
                <div 
                  className={`border-2 border-dashed rounded p-4 text-center bg-light ${errors.images ? 'border-danger' : ''}`}
                  style={{ borderStyle: 'dashed', borderColor: errors.images ? '#dc3545' : '#dee2e6' }}
                >
                  <i className="fas fa-cloud-upload-alt fs-1 text-muted mb-3"></i>
                  <p className="text-muted mb-2">Drag & drop images here or click to browse</p>
                  <input
                    type="file"
                    id="imageUpload"
                    className="d-none"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <label 
                    htmlFor="imageUpload" 
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fas fa-folder-open me-2"></i>Choose Files
                  </label>
                  <small className="d-block text-muted mt-2">
                    Supported formats: JPG, PNG, GIF (Max 5MB each)
                  </small>
                  {errors.images && (
                    <div className="text-danger small mt-2">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {errors.images}
                    </div>
                  )}
                </div>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div>
                  <h6 className="fw-bold mb-3">Image Previews</h6>
                  <div className="row g-2">
                    {previewImages.map((image, index) => (
                      <div key={index} className="col-6">
                        <div className="position-relative">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="img-fluid rounded border"
                            style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                            onClick={() => removeImage(index)}
                            style={{ width: '24px', height: '24px', padding: 0 }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <small className="text-muted d-block mt-2">
                    {previewImages.length} image(s) selected
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips Card */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                Tips for Better Listings
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0 small">
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Use high-quality, clear images
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Show product from multiple angles
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Include images with scale for size reference
                </li>
                <li className="mb-2">
                  <i className="fas fa-check text-success me-2"></i>
                  Write detailed, honest descriptions
                </li>
                <li>
                  <i className="fas fa-check text-success me-2"></i>
                  Set competitive but fair pricing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;