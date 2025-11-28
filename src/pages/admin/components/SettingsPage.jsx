// src/components/AdminPanel/SettingsPage.js
import React from 'react';

const SettingsPage = () => {
  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <div>
          <h1 className="h2 fw-bold">Settings</h1>
          <p className="text-muted">Configure your account and application settings.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-5">
          <i className="fas fa-cog fs-1 text-muted mb-3"></i>
          <h4>Settings Panel</h4>
          <p className="text-muted">Settings panel coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;