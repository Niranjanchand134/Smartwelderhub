// src/components/AdminPanel/Sidebar.js
import React from 'react';

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { id: 'add-product', icon: 'fas fa-plus-circle', label: 'Add Product' }, 
    { id: 'listings', icon: 'fas fa-list', label: 'Listings' },
    { id: 'orders', icon: 'fas fa-shopping-cart', label: 'Orders' },
    { id: 'custom-orders', icon: 'fas fa-tools', label: 'Custom Orders' },
    { id: 'payments', icon: 'fas fa-rupee-sign', label: 'Payment' },
    { id: 'customers', icon: 'fas fa-users', label: 'Customers' },
    { id: 'create-welder', icon: 'fas fa-user-plus', label: 'Create New Welder' },
    { id: 'analytics', icon: 'fas fa-chart-bar', label: 'Analytics' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <div className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
      <div className="position-sticky pt-3" style={{ height: '100vh' }}>
        <div className="d-flex align-items-center my-3 mb-5">
          <i className="fas fa-leaf text-success fs-3 me-2"></i>
          <span className="fs-4 fw-bold text-success">FarmConnect</span>
        </div>
        
        <ul className="nav nav-pills flex-column">
          {menuItems.map(item => (
            <li className="nav-item mb-2" key={item.id}>
              <button 
                className={`nav-link w-100 text-start py-2 px-3 ${activeMenu === item.id ? 'active bg-success' : 'text-dark'}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <i className={`${item.icon} me-3`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;