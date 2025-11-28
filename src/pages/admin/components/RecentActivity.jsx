// src/components/AdminPanel/RecentActivity.js
import React from 'react';

const RecentActivity = () => {
  const recentListings = [
    { icon: 'fas fa-carrot', title: 'Organic Carrots', meta: 'Added 2 days ago', status: 'Active' },
    { icon: 'fas fa-apple-alt', title: 'Fresh Apples', meta: 'Added 5 days ago', status: 'Active' },
    { icon: 'fas fa-egg', title: 'Farm Fresh Eggs', meta: 'Added 1 week ago', status: 'Pending' }
  ];

  const recentInquiries = [
    { icon: 'fas fa-user', title: 'Sarah Johnson', meta: 'Inquired about Organic Carrots', status: 'New' },
    { icon: 'fas fa-user', title: 'Michael Chen', meta: 'Requested bulk order for Apples', status: 'Responded' },
    { icon: 'fas fa-user', title: 'Green Grocers Ltd.', meta: 'Wholesale inquiry for eggs', status: 'New' }
  ];

  const getStatusBadge = (status) => {
    const statusClass = {
      'Active': 'bg-success',
      'Pending': 'bg-warning',
      'New': 'bg-info',
      'Responded': 'bg-secondary'
    }[status] || 'bg-primary';
    
    return `badge ${statusClass}`;
  };

  return (
    <div className="row">
      {/* Recent Listings */}
      <div className="col-xl-6 col-lg-12 mb-4">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center border-0 pb-0">
            <h5 className="mb-0 fw-bold">Recent Listings</h5>
            <button className="btn btn-sm btn-outline-success">View All</button>
          </div>
          <div className="card-body">
            {recentListings.map((item, index) => (
              <div className="d-flex align-items-center mb-3 pb-3 border-bottom" key={index}>
                <div className="bg-success bg-opacity-10 text-success rounded p-2 me-3">
                  <i className={item.icon}></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1 fw-bold">{item.title}</h6>
                  <small className="text-muted">{item.meta}</small>
                </div>
                <span className={getStatusBadge(item.status)}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="col-xl-6 col-lg-12 mb-4">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center border-0 pb-0">
            <h5 className="mb-0 fw-bold">Recent Inquiries</h5>
            <button className="btn btn-sm btn-outline-success">View All</button>
          </div>
          <div className="card-body">
            {recentInquiries.map((item, index) => (
              <div className="d-flex align-items-center mb-3 pb-3 border-bottom" key={index}>
                <div className="bg-primary bg-opacity-10 text-primary rounded p-2 me-3">
                  <i className={item.icon}></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1 fw-bold">{item.title}</h6>
                  <small className="text-muted">{item.meta}</small>
                </div>
                <span className={getStatusBadge(item.status)}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;