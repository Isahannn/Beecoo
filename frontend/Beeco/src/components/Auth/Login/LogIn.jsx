import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../Context';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm/LoginForm';
import API_URL from '../../../config.jsx';

const LogIn = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (identifier, password) => {
    setLoading(true);
    setError('');

    try {
      const queryParam = identifier.includes('@') ? `email=${identifier}` : `username=${identifier}`;
      const response = await axios.get(`${API_URL}/users?${queryParam}`);

      const users = response.data;

      const user = users.find((u) => {
        return bcrypt.compareSync(password, u.password);
      });

      if (user) {
        console.log('User logged in:', user);
        login(user);
        navigate('/home');
      } else {
        setError('Неправильное имя или email');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} loading={loading} error={error} />;
};

export default LogIn;
