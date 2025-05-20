import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../Context/AutoContext.jsx';
import axios from 'axios';
import UserCard from '../UserCard/UserCard.jsx';
import './UsersPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

const UsersPage = () => {
  const { isAuthenticated, getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const fetchUsers = async (pageNum, query = '') => {
    if (!isAuthenticated) {
      setError('Пожалуйста, войдите в аккаунт');
      return;
    }
    try {
      const token = getToken();
      const url = `${API_URL}/users/?page=${pageNum}${query ? `&search=${encodeURIComponent(query)}` : ''}`;
      console.log(`Fetching users with URL: ${url}`);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { results, count } = response.data;
      setUsers(results);
      setTotalPages(Math.ceil(count / 10));
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Не удалось загрузить пользователей');
    }
  };

  const handleFollow = async (userId) => {
    if (!isAuthenticated) {
      setError('Пожалуйста, войдите в аккаунт');
      return;
    }
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_URL}/users/${userId}/follow/`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Follow request successful:', response.data);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_following: true } : user
        )
      );
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Ошибка отправки запроса на подписку:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || 'Ошибка при подписке';
      setError(errorMessage);
      throw err;
    }
  };

  const handleUnfollow = async (userId) => {
    if (!isAuthenticated) {
      setError('Пожалуйста, войдите в аккаунт');
      return;
    }
    try {
      const token = getToken();
      const response = await axios.delete(`${API_URL}/users/${userId}/follow/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Unfollow request successful:', response.data);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_following: false } : user
        )
      );
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Ошибка при отписке:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || 'Ошибка при отписке';
      if (errorMessage === 'Вы не подписаны на этого пользователя') {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_following: false } : user
          )
        );
        setError(null);
      } else {
        setError(errorMessage);
      }
      throw err;
    }
  };

  const setupWebSocket = () => {
    if (!isAuthenticated) return;
    const token = getToken();
    if (!token) return;

    console.log(`Attempting WebSocket connection, attempt ${reconnectAttempts.current + 1}`);
    wsRef.current = new WebSocket(`${WS_URL}/ws/notifications/?token=${token}`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
    };

    wsRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    wsRef.current.onclose = (event) => {
      console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = 10000;
        console.log(`Reconnecting in ${delay}ms`);
        setTimeout(setupWebSocket, delay);
        reconnectAttempts.current += 1;
      } else {
        console.error('Max WebSocket reconnect attempts reached');
        setError('Не удалось подключиться к уведомлениям');
      }
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        console.log('Received notification:', data.notification);
      }
    };
  };

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
    setupWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentPage, searchQuery, isAuthenticated, getToken]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="users-page-container">
      <div className="users-page">
        <h1>Пользователи</h1>
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Поиск по имени, фамилии или email..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {users.length === 0 && !error && <div className="no-users">Пользователи не найдены</div>}
        <div className="users-list">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Назад
            </button>
            <span className="pagination-info">
              Страница {currentPage} из {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Вперед
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;