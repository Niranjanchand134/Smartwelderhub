// src/components/AdminPanel/QuickActions.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ setActiveMenu }) => {
  const quickActions = [
    { 
      icon: 'fas fa-plus-circle', 
      title: 'Add New Product', 
      desc: 'Create a new product listing',
      action: () => setActiveMenu('add-product')
    },
    { 
      icon: 'fas fa-user-plus', 
      title: 'Create Welder', 
      desc: 'Add a new welder to the system',
      action: () => setActiveMenu('create-welder')
    },
    { 
      icon: 'fas fa-tools', 
      title: 'Manage Custom Orders', 
      desc: 'View and manage custom orders',
      action: () => setActiveMenu('custom-orders')
    }
  ];

  return (
    <div className="row mb-4">
      <div className="col-12">
        <h3 className="h4 mb-3 fw-bold">Quick Actions</h3>
        <div className="row">
          {quickActions.map((action, index) => (
            <div className="col-lg-4 col-md-6 mb-3" key={index}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center p-4">
                  <i className={`${action.icon} text-success fs-1 mb-3`}></i>
                  <h5 className="card-title fw-bold mb-2">{action.title}</h5>
                  <p className="card-text text-muted">{action.desc}</p>
                  <button 
                    className="btn btn-success mt-2"
                    onClick={action.action}
                  >
                    Take Action
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;