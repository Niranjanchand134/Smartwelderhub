/**
 * UserRoute Component
 * 
 * Protected route that allows authenticated regular users but blocks ADMIN and WELDER users.
 * Redirects to login if not authenticated.
 * Redirects to admin panel if authenticated but is an ADMIN.
 * Redirects to welder dashboard if authenticated but is a WELDER.
 * 
 * This ensures admins and welders cannot access user-specific routes (like cart, checkout).
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { WarningMessageToast } from '../utils/Tostify.util';
import { useEffect, useRef } from 'react';

const UserRoute = ({ children }) => {
  const { user, authToken } = useAuth();
  const hasShownWarning = useRef(false);

  // Check if user is authenticated
  if (!authToken || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check user role
  const userRole = user?.role?.toUpperCase();
  const isAdmin = userRole === 'ADMIN';
  const isWelder = userRole === 'WELDER';

  // Show warning if user is admin or welder (only once)
  useEffect(() => {
    if ((isAdmin || isWelder) && !hasShownWarning.current) {
      if (isAdmin) {
        WarningMessageToast('Admins cannot access user routes. Redirecting to admin panel.');
      } else if (isWelder) {
        WarningMessageToast('Welders cannot access user routes. Redirecting to welder dashboard.');
      }
      hasShownWarning.current = true;
    }
  }, [isAdmin, isWelder]);

  if (isAdmin) {
    // User is authenticated but is an admin trying to access user routes
    // Redirect to admin panel
    return <Navigate to="/admin" replace />;
  }

  if (isWelder) {
    // User is authenticated but is a welder trying to access user routes
    // Redirect to welder dashboard
    return <Navigate to="/welder" replace />;
  }

  // User is authenticated and is a regular user (not admin or welder), render the user content
  return children;
};

export default UserRoute;

