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
      console.log('AuthProvider: Начало проверки аутентификации');
      try {
        const authToken = localStorage.getItem('auth_token');
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

        if (authToken && storedUser) {
          console.log('AuthProvider: Проверка токена:', authToken);
          const response = await axios.get('http://localhost:8000/profile/', {
            headers: { Authorization: `Token ${authToken}` },
            timeout: 3000,
          });
          setIsAuthenticated(true);
          setUser(response.data);
          console.log('AuthProvider: Пользователь аутентифицирован:', response.data);
        } else {
          console.log('AuthProvider: Токен или пользователь не найдены');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (e) {
        console.error('AuthProvider: Ошибка проверки токена:', {
          message: e.message,
          status: e.response?.status,
          data: e.response?.data,
        });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('AuthProvider: Проверка завершена, loading=false');
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      console.log('AuthProvider: Попытка входа с данными:', { identifier, password });
      const response = await axios.post('http://localhost:8000/login/', {
        identifier,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setUser(user);
      console.log('AuthProvider: Успешный вход:', user);
      return true;
    } catch (e) {
      console.error('AuthProvider: Ошибка входа:', {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data,
      });
      return false;
    }
  };

  const registration = async (email, password) => {
    try {
      console.log('AuthProvider: Попытка регистрации с данными:', { email, password });
      const response = await axios.post('http://localhost:8000/register/', {
        email,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setUser(user);
      console.log('AuthProvider: Успешная регистрация:', user);
      return true;
    } catch (e) {
      console.error('AuthProvider: Ошибка регистрации:', {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data,
      });
      return false;
    }
  };

  const logout = () => {
    console.log('AuthProvider: Выход из системы');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout, registration }}
    >
      {children}
    </AuthContext.Provider>
  );
}