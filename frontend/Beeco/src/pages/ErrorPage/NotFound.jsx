import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Извините, страница, которую вы ищете, не существует или была удалена.</p>
      <Link to="/">Вернуться на главную</Link>
    </div>
  );
};

export default NotFoundPage;
