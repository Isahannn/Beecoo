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

        if (token && storedUser) {
          const response = await axios.get('http://localhost:8000/user/me/', {
            headers: { Authorization: `Token ${token}` },
            timeout: 3000,
          });
          console.log('Проверка аутентификации: Успех', response.data);
          setIsAuthenticated(true);
          setUser(response.data);
        } else {
          throw new Error('Токен или пользователь отсутствуют');
        }
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error.message, error.response?.data);
        localStorage.removeItem('auth_token');
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
      const response = await axios.post('http://localhost:8000/login/', {
        email,
        password,
      });
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Недействительный ответ: отсутствует токен или пользователь');
      }
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Вход: Сохранён токен:', token, 'пользователь:', user);
      setIsAuthenticated(true);
      setUser(user);
      return true;
    } catch (e) {
      console.error('Ошибка входа:', e.message, e.response?.data);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return false;
    }
  };

  const registration = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/registration/', {
        email,
        password,
      });
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Недействительный ответ: отсутствует токен или пользователь');
      }
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Регистрация: Сохранён токен:', token, 'пользователь:', user);
      setIsAuthenticated(true);
      setUser(user);
      return true;
    } catch (e) {
      console.error('Ошибка регистрации:', e.message, e.response?.data);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, registration }}>
      {children}
    </AuthContext.Provider>
  );
}