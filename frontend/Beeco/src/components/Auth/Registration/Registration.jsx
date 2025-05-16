import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from './RegistrationForm/RegistrationForm.jsx';
import axios from 'axios';
import API_URL from '../../../config.jsx';

const Registration = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegistration = async (values) => {
    setLoading(true);
    setError('');

    try {
      const jsonPayload = { ...values };
      await axios.post(`${API_URL}/users`, jsonPayload, {
        headers: { 'Content-Type': 'application/json' },
      });

      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/google-login/`, {
        token: response.credential,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Google login response:', res.data);

      localStorage.setItem('accessToken', res.data.tokens.access);
      localStorage.setItem('refreshToken', res.data.tokens.refresh);

      navigate('/login');
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.error || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <RegistrationForm
        onSubmit={handleRegistration}
        loading={loading}
        error={error}
      />
      <div id="googleSignInDiv" style={{ marginTop: '20px' }}></div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </>
  );
};

export default Registration;
