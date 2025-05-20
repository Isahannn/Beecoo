import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AutoContext.jsx';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm/LoginForm.jsx';

function LogIn() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

const handleSubmit = async (email, password) => {
  setError('');
  setLoading(true);

  if (!email || !password) {
    setError('Пожалуйста, введите email и пароль');
    setLoading(false);
    return;
  }

  const success = await login(email, password);
  if (success) {
    console.log('Login successful, waiting for state update');
  } else {
    setError('Неверный email или пароль');
  }

  setLoading(false);
};
  return (
    <LoginForm
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
}

export default LogIn;