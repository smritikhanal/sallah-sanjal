import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';

const PrivateRoute = ({ children, roles }) => {
  const { user, accessToken } = useAuthStore();

  // Redirect to login if user has no token
  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (user && roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
