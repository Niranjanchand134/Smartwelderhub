import QuickActions from "./QuickActions";
import RecentActivity from "./RecentActivity";
import StatsCards from "./StatsCards";


const MainContent = () => {
  return (
    <div>
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
        <div>
          <h1 className="h2 fw-bold">Dashboard</h1>
          <p className="text-muted">Welcome back! Manage your farm listings and connect with buyers.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards/>
      <hr className="my-4" />

      {/* Quick Actions */}
      <QuickActions/>
      
      {/* Recent Activity */}
      <RecentActivity/>
    </div>
  );
};

export default MainContent;