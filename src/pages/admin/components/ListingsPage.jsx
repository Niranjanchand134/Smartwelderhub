// src/components/AdminPanel/ListingsPage.js
import React, { useEffect, useState } from 'react';
import { getAllProducts, deleteProduct, updateProduct } from '../../../services/productService';
import { getAllOrders } from '../../../services/orderService';
import { ErrorMessageToast, SuccesfulMessageToast } from '../../../utils/Tostify.util';

const ListingsPage = ({ setActiveMenu }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data || []);
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  // Calculate ordered quantity for a product
  const getOrderedQuantity = (productId) => {
    let totalOrdered = 0;
    orders.forEach(order => {
      try {
        const items = JSON.parse(order.itemsJson || '[]');
        items.forEach(item => {
          if (item.productId === productId) {
            totalOrdered += item.quantity || 0;
          }
        });
      } catch (e) {
        console.error('Error parsing order items:', e);
      }
    });
    return totalOrdered;
  };

  const handleAddProduct = () => {
    setActiveMenu('add-product');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      SuccesfulMessageToast('Product deleted successfully.');
      fetchProducts();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to delete product');
    }
  };

  const openViewModal = (product) => {
    setViewProduct(product);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setEditForm({
      name: product.name || '',
      category: product.category || '',
      price: product.price || '',
      stock: product.stock ?? '',
      description: product.description || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      await updateProduct(editProduct.id, editForm);
      SuccesfulMessageToast('Product updated successfully.');
      setEditProduct(null);
      fetchProducts();
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to update product');
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    );
  });

  const formatPrice = (price) => {
    if (price === null || price === undefined || Number.isNaN(price)) return 'N/A';
    return `Rs. ${Number(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadgeClass = (stock) => {
    if (stock > 10) return 'bg-success';
    if (stock > 0) return 'bg-warning text-dark';
    return 'bg-danger';
  };

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <div>
          <h1 className="h2 fw-bold">Listings Management</h1>
          <p className="text-muted">Manage your farm product listings and inventory.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-success" onClick={handleAddProduct}>
            <i className="fas fa-plus me-2"></i>Add New Listing
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-box-open fs-1 text-muted mb-3"></i>
              <h5>No products found</h5>
              <p className="text-muted">Add a new product to get started.</p>
              <button className="btn btn-success" onClick={handleAddProduct}>
                <i className="fas fa-plus me-2"></i>Add Product
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Available Stock</th>
                    <th>Ordered</th>
                    <th>Remaining</th>
                    <th>Date Added</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-success bg-opacity-10 text-success rounded p-2 me-3">
                            <i className="fas fa-seedling"></i>
                          </div>
                          <div>
                            <div className="fw-bold">{product.name}</div>
                            <small className="text-muted">
                              ID: {product.id}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{product.category || 'N/A'}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <span className="fw-bold text-primary">{product.stock ?? 0}</span>
                      </td>
                      <td>
                        <span className="fw-semibold text-info">{getOrderedQuantity(product.id)}</span>
                      </td>
                      <td>
                        <span className="fw-bold text-success">{product.stock ?? 0}</span>
                      </td>
                      <td>{formatDate(product.createdAt)}</td>
                      <td className="text-end">
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            title="View"
                            onClick={() => openViewModal(product)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit"
                            onClick={() => openEditModal(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => handleDelete(product.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-muted">
                <small>Showing {filteredProducts.length} of {products.length} products</small>
              </div>
            </div>
          )}
        </div>
    </div>

      {/* View Modal */}
      {viewProduct && (
        <Modal title="Product Details" onClose={() => setViewProduct(null)}>
          <ul className="list-group mb-3">
            <li className="list-group-item"><strong>Name:</strong> {viewProduct.name}</li>
            <li className="list-group-item"><strong>Category:</strong> {viewProduct.category}</li>
            <li className="list-group-item"><strong>Price:</strong> Rs. {Number(viewProduct.price).toFixed(2)}</li>
            <li className="list-group-item"><strong>Stock:</strong> {viewProduct.stock}</li>
            <li className="list-group-item"><strong>Description:</strong> {viewProduct.description || 'N/A'}</li>
          </ul>
          <button className="btn btn-secondary" onClick={() => setViewProduct(null)}>Close</button>
        </Modal>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <Modal title="Edit Product" onClose={() => setEditProduct(null)}>
          <form onSubmit={handleUpdateProduct}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  step="0.01"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className="form-control"
                  name="stock"
                  value={editForm.stock}
                  onChange={handleEditChange}
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                rows="3"
                value={editForm.description}
                onChange={handleEditChange}
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setEditProduct(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ListingsPage;

const Modal = ({ title, children, onClose }) => (
  <div className="modal-backdrop-wrapper" style={{ position: 'fixed', inset: 0 }}>
    <div className="modal-backdrop show" style={{ zIndex: 1040 }}></div>
    <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  </div>
);