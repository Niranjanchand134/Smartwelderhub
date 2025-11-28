/**
 * AdminRedirectWrapper Component
 * 
 * Wraps public routes to redirect authenticated admins and welders to their respective dashboards.
 * - Admins are redirected to /admin
 * - Welders are redirected to /welder
 * - Regular users and unauthenticated users can access the route normally.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const AdminRedirectWrapper = ({ children }) => {
  const { user, authToken } = useAuth();

  // Redirect authenticated users based on their role
  if (authToken && user) {
    const userRole = user?.role?.toUpperCase();
    const isAdmin = userRole === 'ADMIN';
    const isWelder = userRole === 'WELDER';

    if (isAdmin) {
      // Admin is logged in and trying to access public user route
      // Redirect to admin panel
      return <Navigate to="/admin" replace />;
    }

    if (isWelder) {
      // Welder is logged in and trying to access public user route
      // Redirect to welder dashboard
      return <Navigate to="/welder" replace />;
    }
  }

  // User is not an admin/welder or not logged in, show the content normally
  return children;
};

export default AdminRedirectWrapper;

