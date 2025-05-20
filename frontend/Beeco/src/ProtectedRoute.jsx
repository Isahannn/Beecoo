import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './Context/AutoContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  if (!loading && !isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
