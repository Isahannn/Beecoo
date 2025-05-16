import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './Context';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('ProtectedRoute: loading=', loading, 'isAuthenticated=', isAuthenticated); // Отладка

  if (loading) {
    console.log('ProtectedRoute: Showing loading state'); // Отладка
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to /login'); // Отладка
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: Rendering children'); // Отладка
  return children;
};

export default ProtectedRoute;