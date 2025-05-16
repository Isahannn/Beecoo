import { Navigate } from 'react-router-dom';
import { useAuth } from './Context';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
};

export default PublicRoute;
