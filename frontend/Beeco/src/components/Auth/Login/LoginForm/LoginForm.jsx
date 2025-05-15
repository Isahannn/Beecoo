import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './LoginForm.css';  // здесь твой CSS с переменными из :root и стилями

const LoginForm = ({ onSubmit, loading, error }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(identifier, password);
  };

  return (
    <div className="registration-form-container">
      <form className="registration-form" onSubmit={handleSubmit}>
        <h2>Log In</h2>

        {error && <div className="message error">{error}</div>}

        <div className="textbox">
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            placeholder=" "
          />
          <label htmlFor="identifier">Username or Email</label>
        </div>

        <div className="textbox">
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder=" "
          />
          <label htmlFor="password">Password</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading && <span className="spinner" />}
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <div className="login-link">
          <NavLink to="/">Back to Home</NavLink> |{' '}
          <NavLink to="/registration">Back to Registration</NavLink>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
