/**
 * WelderRoute Component
 *
 * Protects welder-only routes.
 * - Redirects to login if not authenticated.
 * - Redirects admins to /admin.
 * - Redirects other roles to home.
 */

import { Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../Context/AuthContext';
import { WarningMessageToast } from '../utils/Tostify.util';

const WelderRoute = ({ children }) => {
  const { user, authToken } = useAuth();
  const hasShownWarning = useRef(false);

  if (!authToken || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role?.toUpperCase();
  const isWelder = userRole === 'WELDER';

  useEffect(() => {
    if (!isWelder && !hasShownWarning.current) {
      WarningMessageToast('Access denied. Welder account required.');
      hasShownWarning.current = true;
    }
  }, [isWelder]);

  if (!isWelder) {
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default WelderRoute;

