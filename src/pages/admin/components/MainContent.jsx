import React from 'react';
import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import StatsCards from "./StatsCards";

const MainContent = ({ setActiveMenu }) => {
  return (
    <div>
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <div>
          <h1 className="h2 fw-bold">Dashboard</h1>
          <p className="text-muted">Welcome back! Manage your SmartWeld operations and monitor system activity.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards/>
      <hr className="my-4" />

      {/* Quick Actions */}
      <QuickActions setActiveMenu={setActiveMenu}/>
      
      {/* Recent Activity */}
      <RecentActivity setActiveMenu={setActiveMenu}/>
    </div>
  );
};

export default MainContent;