// src/components/AdminPanel/AnalyticsPage.js
import React from 'react';

const AnalyticsPage = () => {
  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <div>
          <h1 className="h2 fw-bold">Analytics</h1>
          <p className="text-muted">View insights and analytics about your farm business.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-5">
          <i className="fas fa-chart-bar fs-1 text-muted mb-3"></i>
          <h4>Analytics Dashboard</h4>
          <p className="text-muted">Analytics features coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;