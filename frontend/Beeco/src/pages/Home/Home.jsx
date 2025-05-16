import React, { useContext } from 'react';
import { AuthContext } from '../../context.jsx';
import './Home.css';

const Home = () => {
  const { user } = useContext(AuthContext);
  const name = user?.name || 'Гость';

  return (
    <div className="home-container">
      <h1>Эта страница</h1>
      <p className="username">Добро пожаловать, {name}!</p>
    </div>
  );
};

export default Home;
