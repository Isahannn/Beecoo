import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './LoginForm.css';

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
        <h2>Вход</h2>

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
          <label htmlFor="identifier">Имя или email</label>
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
          <label htmlFor="password">Пароль</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={loading ? 'загрузка' : ''}
        >
          {loading && <span className="spinner" />}
          {loading ? 'Входим...' : 'Вход'}
        </button>

        <div className="login-link">
          <NavLink to="/">Вернуться домой</NavLink> |{' '}
          <NavLink to="/registration">Зарегестрироваться</NavLink>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
