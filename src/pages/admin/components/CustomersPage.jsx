// src/components/AdminPanel/CustomersPage.js
import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, updateUser } from '../../../services/authService';
import { ErrorMessageToast, SuccesfulMessageToast } from '../../../utils/Tostify.util';

const CustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserStatus = (user) => {
    if (user.status) {
      return user.status.toLowerCase();
    }
    
    const now = new Date();
    
    if (user.createdAt) {
      const createdDate = new Date(user.createdAt);
      const daysSinceCreation = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation <= 7) {
        return 'new';
      }
    }
    
    if (user.lastLogin) {
      return 'active';
    }
    
    return 'inactive';
  };

  // Filter users by role
  const admins = users.filter(user => user.role?.toUpperCase() === 'ADMIN');
  const welders = users.filter(user => user.role?.toUpperCase() === 'WELDER');
  const regularUsers = users.filter(user => {
    const role = user.role?.toUpperCase();
    return role !== 'ADMIN' && role !== 'WELDER';
  });

  // Filter function for each role
  const filterUsersByRole = (userList) => {
    return userList.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower)
      );

      if (statusFilter === 'all') {
        return matchesSearch;
      }

      const userStatus = getUserStatus(user);
      return matchesSearch && userStatus === statusFilter;
    });
  };

  const filteredAdmins = filterUsersByRole(admins);
  const filteredWelders = filterUsersByRole(welders);
  const filteredUsers = filterUsersByRole(regularUsers);

  const openViewModal = (user) => {
    setViewUser(user);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await updateUser(editUser.id, editForm);
      SuccesfulMessageToast("User updated successfully.");
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      ErrorMessageToast(error.message || "Failed to update user.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      SuccesfulMessageToast("User deleted.");
      fetchUsers();
    } catch (error) {
      ErrorMessageToast(error.message || "Failed to delete user.");
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-danger';
      case 'WELDER':
        return 'bg-info';
      case 'USER':
        return 'bg-primary';
      case 'BUYER':
        return 'bg-primary';
      case 'FARMER':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-info';
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <div>
          <h1 className="h2 fw-bold">Customer Management</h1>
          <p className="text-muted">Manage your customer relationships and interactions.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-success" onClick={fetchUsers}>
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
        </div>
      </div>

      {/* Search Bar and Filter */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, phone, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="input-group-text">
              <i className="fas fa-filter"></i>
            </span>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Render Tables */}
      {loading ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading users...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Admin Table - First */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">
                <i className="fas fa-user-shield me-2"></i>
                Administrators ({filteredAdmins.length})
              </h5>
            </div>
            <div className="card-body">
              {filteredAdmins.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-user-shield fs-1 text-muted mb-2"></i>
                  <p className="text-muted mb-0">No administrators found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle bg-danger text-white me-2" style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                              }}>
                                {user.fullName?.charAt(0)?.toUpperCase() || 'A'}
                              </div>
                              <span className="fw-medium">{user.fullName || 'N/A'}</span>
                            </div>
                          </td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{user.phoneNumber || 'N/A'}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(getUserStatus(user))} text-white`}>
                              {getUserStatus(user).charAt(0).toUpperCase() + getUserStatus(user).slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                                onClick={() => openViewModal(user)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                title="Edit User"
                                onClick={() => openEditModal(user)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete User"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Welder Table - Second */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-hard-hat me-2"></i>
                Welders ({filteredWelders.length})
              </h5>
            </div>
            <div className="card-body">
              {filteredWelders.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-hard-hat fs-1 text-muted mb-2"></i>
                  <p className="text-muted mb-0">No welders found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Skills</th>
                        <th>Experience</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWelders.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={user.fullName}
                                  className="rounded-circle me-2"
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="avatar-circle bg-info text-white me-2" style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold'
                                }}>
                                  {user.fullName?.charAt(0)?.toUpperCase() || 'W'}
                                </div>
                              )}
                              <span className="fw-medium">{user.fullName || 'N/A'}</span>
                            </div>
                          </td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{user.phoneNumber || 'N/A'}</td>
                          <td>
                            {user.skills ? (
                              <small className="text-muted">
                                {user.skills.split(',').slice(0, 2).join(', ')}
                                {user.skills.split(',').length > 2 && '...'}
                              </small>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            {user.experience ? (
                              <span className="badge bg-secondary">{user.experience} years</span>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(getUserStatus(user))} text-white`}>
                              {getUserStatus(user).charAt(0).toUpperCase() + getUserStatus(user).slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                                onClick={() => openViewModal(user)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                title="Edit User"
                                onClick={() => openEditModal(user)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete User"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* User Table - Last */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Users ({filteredUsers.length})
              </h5>
            </div>
            <div className="card-body">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-users fs-1 text-muted mb-2"></i>
                  <p className="text-muted mb-0">No users found</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Phone Number</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-circle bg-primary text-white me-2" style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold'
                                }}>
                                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="fw-medium">{user.fullName || 'N/A'}</span>
                              </div>
                            </td>
                            <td>{user.email || 'N/A'}</td>
                            <td>{user.phoneNumber || 'N/A'}</td>
                            <td>
                              <span className={`badge ${getRoleBadgeClass(user.role)} text-white`}>
                                {user.role || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(getUserStatus(user))} text-white`}>
                                {getUserStatus(user).charAt(0).toUpperCase() + getUserStatus(user).slice(1)}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  title="View Details"
                                  onClick={() => openViewModal(user)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  title="Edit User"
                                  onClick={() => openEditModal(user)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete User"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-muted">
                    <small>Showing {filteredUsers.length} of {regularUsers.length} users</small>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {viewUser && (
        <Modal title="Customer Details" onClose={() => setViewUser(null)}>
          <ul className="list-group mb-3">
            <li className="list-group-item"><strong>Name:</strong> {viewUser.fullName}</li>
            <li className="list-group-item"><strong>Email:</strong> {viewUser.email}</li>
            <li className="list-group-item"><strong>Phone:</strong> {viewUser.phoneNumber || 'N/A'}</li>
            <li className="list-group-item"><strong>Role:</strong> {viewUser.role}</li>
            <li className="list-group-item">
              <strong>Status:</strong>{' '}
              <span className={`badge ${getStatusBadgeClass(getUserStatus(viewUser))} text-white ms-2`}>
                {getUserStatus(viewUser).charAt(0).toUpperCase() + getUserStatus(viewUser).slice(1)}
              </span>
            </li>
          </ul>
          <button className="btn btn-secondary" onClick={() => setViewUser(null)}>Close</button>
        </Modal>
      )}

      {editUser && (
        <Modal title="Edit Customer" onClose={() => setEditUser(null)}>
          <form onSubmit={handleUpdateUser}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="fullName"
                value={editForm.fullName}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                name="phoneNumber"
                value={editForm.phoneNumber}
                onChange={handleEditChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Role</option>
                <option value="ADMIN">Admin</option>
                <option value="WELDER">Welder</option>
                <option value="USER">User</option>
                <option value="buyer">Buyer</option>
                <option value="farmer">Farmer</option>
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>
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

export default CustomersPage;

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