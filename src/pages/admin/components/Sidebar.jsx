// src/components/AdminPanel/Sidebar.js
import React, { forwardRef } from 'react';

const Sidebar = forwardRef(({ activeMenu, setActiveMenu }, ref) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { id: 'add-product', icon: 'fas fa-plus-circle', label: 'Add Product' }, 
    { id: 'listings', icon: 'fas fa-list', label: 'Listings' },
    { id: 'orders', icon: 'fas fa-shopping-cart', label: 'Orders' },
    { id: 'custom-orders', icon: 'fas fa-tools', label: 'Custom Orders' },
    { id: 'material-requests', icon: 'fas fa-boxes', label: 'Material Requests' },
    { id: 'payments', icon: 'fas fa-rupee-sign', label: 'Payment' },
    { id: 'customers', icon: 'fas fa-users', label: 'Customers' },
    { id: 'create-welder', icon: 'fas fa-user-plus', label: 'Create New Welder' },
  ];

  return (
    <>
      <style>
        {`
          .sidebar::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div 
        ref={ref}
        className="d-none d-md-block bg-light sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '250px',
          zIndex: 1000,
          overflowY: 'auto',
          borderRight: '1px solid #dee2e6',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
      <div className="pt-3" style={{ height: '100%' }}>
        <div className="d-flex align-items-center my-3 mb-5 px-3">
          <i className="fas fa-tools text-success me-2"></i>
          <span className="fs-4 fw-bold text-success">Admin Panel</span>
        </div>
        
        <ul className="nav nav-pills flex-column px-3">
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
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;