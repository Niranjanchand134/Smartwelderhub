/**
 * AdminRoute Component
 * 
 * Protected route that only allows ADMIN users to access.
 * Redirects to login if not authenticated.
 * Redirects to home page if authenticated but not an ADMIN.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { WarningMessageToast } from '../utils/Tostify.util';
import { useEffect, useRef } from 'react';

const AdminRoute = ({ children }) => {
  const { user, authToken } = useAuth();
  const hasShownWarning = useRef(false);

  // Check if user is authenticated
  if (!authToken || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if user has ADMIN role
  const userRole = user?.role?.toUpperCase();
  const isAdmin = userRole === 'ADMIN';

  // Show warning if user is not admin (only once)
  useEffect(() => {
    if (!isAdmin && !hasShownWarning.current) {
      WarningMessageToast('Access denied. Admin privileges required.');
      hasShownWarning.current = true;
    }
  }, [isAdmin]);

  if (!isAdmin) {
    // User is authenticated but not an admin
    // Redirect to home
    return <Navigate to="/" replace />;
  }

  // User is authenticated and is an admin, render the admin content
  return children;
};

export default AdminRoute;

