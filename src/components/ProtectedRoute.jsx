/**
 * ProtectedRoute Component
 * 
 * Base protected route that checks if user is authenticated.
 * Redirects to login if not authenticated.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, authToken } = useAuth();

  // Check if user is authenticated
  if (!authToken || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;

