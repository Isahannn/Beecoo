import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useAuth } from '../../../Context/AutoContext.jsx';
import { NotificationContext } from '../../../pages/Notification/NotificationContext.jsx';
import UserCard from '../UserCard/UserCard.jsx';
import SmartSearch from '../SmartSearch/SmartSearch.jsx';
import './FriendsPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

const FriendsPage = () => {
  const { getToken, isAuthenticated } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const [friends, setFriends] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(localStorage.getItem('searchQuery') || '');
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const fetchFriends = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Пожалуйста, войдите в аккаунт');
      setLoading(false);
      addNotification('Пожалуйста, войдите в аккаунт', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error('Токен авторизации отсутствует');

      const url = new URL(`${API_URL}/api/users/friends/`);
      url.searchParams.append('page', page);
      if (searchQuery) url.searchParams.append('search', searchQuery);

      console.log('Fetching friends with URL:', url.toString());
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Ошибка: ${response.status}`);
      }

      const data = await response.json();
      console.log('Friends API response:', data);
      setFriends(data.results || []);
      setTotalPages(Math.ceil(data.count / 10));
      setError(null);
    } catch (err) {
      console.error('Fetch friends error:', err.message);
      setError(err.message || 'Не удалось загрузить друзей');
      addNotification(err.message || 'Не удалось загрузить друзей', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, isAuthenticated, getToken, addNotification]);

  const handleFollow = async (userId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/users/${userId}/follow/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Ошибка при подписке');
      setFriends((prev) =>
        prev.map((friend) =>
          friend.id === userId ? { ...friend, is_following: true } : friend
        )
      );
      addNotification('Подписка оформлена!', 'follow');
    } catch (err) {
      console.error('Follow error:', err.message);
      setError(err.message || 'Ошибка при подписке');
      addNotification(err.message || 'Ошибка при подписке', 'error');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/users/${userId}/follow/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при отписке');
      }
      setFriends((prev) => prev.filter((friend) => friend.id !== userId));
      addNotification('Вы отписались!', 'unfollow');
    } catch (err) {
      console.error('Unfollow error:', err.message);
      setError(err.message || 'Ошибка при отписке');
      addNotification(err.message || 'Ошибка при отписке', 'error');
    }
  };

  const setupWebSocket = useCallback(() => {
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
        addNotification('Не удалось подключиться к уведомлениям', 'error');
      }
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'unfollow') {
        console.log('Received unfollow notification:', data);
        fetchFriends();
        addNotification('Пользователь отписался', 'unfollow');
      } else if (data.type === 'notification') {
        console.log('Received notification:', data.notification);
        addNotification(data.notification.message, 'websocket');
      }
    };
  }, [isAuthenticated, getToken, fetchFriends, addNotification]);

  useEffect(() => {
    fetchFriends();
    setupWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchFriends, setupWebSocket]);

  const handleSearchChange = useCallback((newQuery) => {
    setSearchQuery(newQuery);
    localStorage.setItem('searchQuery', newQuery);
    setPage(1);
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">Ошибка: {error}</div>;

  return (
    <div className="friends-page-container">
      <div className="friends-page">
        <SmartSearch onSearchChange={handleSearchChange} disabled={loading} />
        {friends.length > 0 ? (
          <>
            <div className="friends-list">
              {friends
                .filter((friend) => friend.is_following)
                .map((friend) => (
                  <UserCard
                    key={friend.id}
                    user={friend}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                ))}
            </div>
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="pagination-button"
              >
                Предыдущая
              </button>
              <span className="pagination-info">
                Страница {page} из {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="pagination-button"
              >
                Следующая
              </button>
            </div>
          </>
        ) : (
          <p className="no-friends">
            {searchQuery ? 'Друзья не найдены' : 'У вас нет друзей'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;