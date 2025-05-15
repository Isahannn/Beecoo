import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from './RegistrationForm/RegistrationForm.jsx';
import axios from 'axios'
import API_URL from '../../../config.jsx';

const Registration = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegistration = async (values) => {
    setLoading(true);
    setError('');

    try {
      const jsonPayload = {
        ...values,
      };
      const response = await axios.post(`${API_URL}/users`, jsonPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationForm
      onSubmit={handleRegistration}
      loading={loading}
      error={error}
    />
  );
};

export default Registration;
