import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import gsap from 'gsap';
import './LoginForm.css';

const LoginForm = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const formContainerRef = useRef(null);

  useEffect(() => {
    const el = formContainerRef.current;
    if (!el) return;

    gsap.set(el, { opacity: 0, y: 50, scale: 0.95 });

    gsap.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out'
    });

    const elements = el.querySelectorAll('h2, .textbox, button[type="submit"], .login-link');
    gsap.fromTo(
      elements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.3
      }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email.trim(), password.trim());
  };

  return (
    <div className="login-form-container" ref={formContainerRef}>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Вход</h2>
        {error && <div className="message error">{error}</div>}
        <div className="textbox">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=" "
            autoComplete="email"
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="textbox password-wrapper">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder=" "
            autoComplete="current-password"
          />
          <label htmlFor="password">Пароль</label>
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            tabIndex={-1}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
          {loading && <span className="spinner" />}
          {loading ? 'Входим...' : 'Вход'}
        </button>
        <div className="login-link">
          <NavLink to="/">Вернуться домой</NavLink> |{' '}
          <NavLink to="/registration">Зарегистрироваться</NavLink>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
