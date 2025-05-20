import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './Context/AutoContext.jsx';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default PublicRoute;
