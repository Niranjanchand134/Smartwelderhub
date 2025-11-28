// src/components/AdminPanel/StatsCards.js
import React from 'react';

const StatsCards = () => {
  const statsData = [
    { title: 'Total Listings', value: '42', change: '12%', trend: 'up', status: 'success' },
    { title: 'Active Listings', value: '28', change: '5%', trend: 'up', status: 'warning' },
    { title: 'Total Inquiries', value: '156', change: '23%', trend: 'up', status: 'info' },
    { title: 'Get Verified', value: 'Pending', change: 'Complete your profile', trend: 'down', status: 'secondary' }
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'fas fa-arrow-up text-success' : 'fas fa-clock text-warning';
  };

  return (
    <div className="row mb-4">
      {statsData.map((stat, index) => (
        <div className="col-xl-3 col-md-6 mb-3" key={index}>
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-subtitle text-muted mb-2">{stat.title}</h6>
                  <h3 className="card-title fw-bold text-dark">{stat.value}</h3>
                  <div className="d-flex align-items-center mt-2">
                    <i className={getTrendIcon(stat.trend)}></i>
                    <small className={`ms-2 ${stat.trend === 'up' ? 'text-success' : 'text-warning'}`}>
                      {stat.change}
                    </small>
                  </div>
                </div>
                <div className={`bg-${stat.status} bg-opacity-10 text-${stat.status} rounded p-2`}>
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;