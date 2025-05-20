import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

        console.log('checkAuth: token=', token, 'storedUser=', storedUser);

        if (!token || !storedUser) {
          throw new Error('Token or user missing');
        }

        const response = await axios.get('http://localhost:8000/users/me/', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000,
        });
        console.log('checkAuth: /users/me/ response=', {
          status: response.status,
          data: response.data,
        });
        setIsAuthenticated(true);
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } catch (error) {
        console.error('checkAuth error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка входа');
      }
      const data = await response.json();
      console.log('Login response:', data);

      localStorage.setItem('auth_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      const userResponse = await fetch('http://localhost:8000/users/me/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.access}`,
        },
      });
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.detail || 'Не удалось получить данные пользователя');
      }
      const userData = await userResponse.json();
      console.log('User data:', userData);

      localStorage.setItem('user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setUser(userData);

      return true;
    } catch (error) {
      console.error('Login failed:', error.message);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const registration = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/registration/', {
        email,
        password,
      });
      const { access, user } = response.data;
      if (!access || !user) {
        throw new Error('Invalid registration response: missing token or user');
      }
      localStorage.setItem('auth_token', access);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Registration: Saved token:', access, 'user:', user);
      setIsAuthenticated(true);
      setUser(user);
      return true;
    } catch (error) {
      console.error('Registration error:', error.message, error.response?.data);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const getToken = () => localStorage.getItem('auth_token');

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout, registration, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}