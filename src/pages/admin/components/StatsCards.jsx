// src/components/AdminPanel/StatsCards.js
import React, { useState, useEffect } from 'react';
import { getAdminDashboard } from '../../../services/customOrderService';
import { ErrorMessageToast } from '../../../utils/Tostify.util';

const StatsCards = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([
    { title: 'Total Products', value: '0', change: '', trend: 'up', status: 'success', icon: 'fas fa-box' },
    { title: 'Custom Orders', value: '0', change: '', trend: 'up', status: 'info', icon: 'fas fa-tools' },
    { title: 'Total Users', value: '0', change: '', trend: 'up', status: 'primary', icon: 'fas fa-users' },
    { title: 'Material Requests', value: '0', change: '', trend: 'up', status: 'warning', icon: 'fas fa-boxes' }
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      
      if (data && data.stats) {
        setStatsData([
          { 
            title: 'Total Products', 
            value: data.stats.totalProducts?.toString() || '0', 
            change: '', 
            trend: 'up', 
            status: 'success',
            icon: 'fas fa-box'
          },
          { 
            title: 'Custom Orders', 
            value: data.stats.totalCustomOrders?.toString() || '0', 
            change: `${data.stats.pendingCustomOrders || 0} pending`, 
            trend: 'up', 
            status: 'info',
            icon: 'fas fa-tools'
          },
          { 
            title: 'Total Users', 
            value: data.stats.totalUsers?.toString() || '0', 
            change: `${data.stats.totalWelders || 0} welders`, 
            trend: 'up', 
            status: 'primary',
            icon: 'fas fa-users'
          },
          { 
            title: 'Material Requests', 
            value: data.stats.totalMaterialRequests?.toString() || '0', 
            change: `${data.stats.pendingMaterialRequests || 0} pending`, 
            trend: 'up', 
            status: 'warning',
            icon: 'fas fa-boxes'
          }
        ]);
      }
    } catch (error) {
      ErrorMessageToast(error.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'fas fa-arrow-up text-success' : 'fas fa-clock text-warning';
  };

  if (loading) {
    return (
      <div className="row mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div className="col-xl-3 col-md-6 mb-3" key={i}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
                  {stat.change && (
                    <div className="d-flex align-items-center mt-2">
                      <i className={getTrendIcon(stat.trend)}></i>
                      <small className={`ms-2 ${stat.trend === 'up' ? 'text-success' : 'text-warning'}`}>
                        {stat.change}
                      </small>
                    </div>
                  )}
                </div>
                <div className={`bg-${stat.status} bg-opacity-10 text-${stat.status} rounded d-flex align-items-center justify-content-center`} style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                  <i className={`${stat.icon || 'fas fa-chart-line'} fs-4`}></i>
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