import { useState, useEffect, memo } from 'react';
import { useAuth } from '../../../Context';
import { useNavigate } from 'react-router-dom';

function LogIn() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  console.log('LogIn component rendered');

  useEffect(() => {
    console.log('LogIn: Mounted');
    return () => console.log('LogIn: Unmounted');
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('LogIn: User is authenticated, redirecting to /');
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Пожалуйста, введите email и пароль');
      return;
    }
    console.log('LogIn: Sending login request with', { email: identifier, password });

    try {
      const success = await login(identifier, password);
      console.log('LogIn: Login request completed, success=', success);
      if (success) {
        navigate('/');
      } else {
        setError('Неверный email или пароль');
      }
    } catch (e) {
      console.error('LogIn: Login error:', {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data,
      });
      setError(`Ошибка входа: ${e.response?.data?.error || 'Проверьте данные'}`);
    }
  };

  return (
    <div className="registration-form-container">
      <form className="registration-form" onSubmit={handleSubmit}>
        <h2>Вход</h2>
        {error && <div className="message error">{error}</div>}
        <div className="textbox">
          <input
            type="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value.trim())}
            placeholder=" "
            required
          />
          <label>Email</label>
        </div>
        <div className="textbox">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
            required
          />
          <label>Пароль</label>
        </div>
        <button type="submit">Войти</button>
        <div className="login-link">
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </div>
      </form>
    </div>
  );
}

export default memo(LogIn);