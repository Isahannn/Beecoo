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
  const isMountedRef = useRef(true);

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

      console.log('Fetching mutual friends with URL:', url.toString());
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
      console.log('Mutual friends API response:', data);
      setFriends(data.results || []);
      setTotalPages(Math.ceil(data.count / 10) || 1);
      setError(null);
    } catch (err) {
      console.error('Fetch mutual friends error:', err.message);
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
      const data = await response.json();
      addNotification('Подписка оформлена!', 'follow');
      // Check if the followed user follows you back
      const isMutual = await checkMutualFollow(userId);
      if (isMutual) {
        fetchFriends(); // Refresh to include new mutual friend
        addNotification('Новый взаимный друг!', 'mutual-follow');
      }
    } catch (err) {
      console.error('Follow error:', err.message);
      setError(err.message || 'Ошибка при подписке');
      addNotification(err.message || 'Ошибка при подписке', 'error');
    }
  };

  const checkMutualFollow = async (userId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/users/${userId}/followers/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Ошибка проверки подписчиков');
      const followers = await response.json();
      const currentUserId = JSON.parse(localStorage.getItem('user'))?.id;
      return followers.results.some((follower) => follower.id === currentUserId);
    } catch (err) {
      console.error('Check mutual follow error:', err.message);
      return false;
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
    if (!isAuthenticated || !isMountedRef.current) return;
    const token = getToken();
    if (!token) {
      addNotification('Токен для WebSocket отсутствует.', 'error');
      return;
    }

    console.log(`Attempting WebSocket connection, attempt ${reconnectAttempts.current + 1}`);
    try {
      wsRef.current = new WebSocket(`${WS_URL}/ws/notifications/?token=${token}`);
    } catch (err) {
      console.error('WebSocket initialization error:', err);
      addNotification('Не удалось инициализировать WebSocket.', 'error');
      return;
    }

    wsRef.current.onopen = () => {
      if (!isMountedRef.current) return;
      console.log('WebSocket connected');
      reconnectAttempts.current = 0;
      addNotification('WebSocket подключен.', 'websocket');
    };

    wsRef.current.onerror = (event) => {
      if (!isMountedRef.current) return;
      console.error('WebSocket error:', event);
      addNotification('Ошибка WebSocket. Пытаемся переподключиться...', 'error');
    };

    wsRef.current.onclose = (event) => {
      if (!isMountedRef.current) return;
      console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
      wsRef.current = null;
      if (reconnectAttempts.current < maxReconnectAttempts && event.code !== 1000) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        console.log(`Reconnecting in ${delay}ms`);
        setTimeout(setupWebSocket, delay);
        reconnectAttempts.current += 1;
      } else {
        console.error('Max WebSocket reconnect attempts reached');
        addNotification('Не удалось подключиться к уведомлениям', 'error');
      }
    };

    wsRef.current.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        if (data.type === 'follow' || data.type === 'unfollow') {
          fetchFriends();
          addNotification(
            data.type === 'follow' ? 'Новый взаимный друг!' : 'Пользователь отписался',
            data.type
          );
        } else if (data.type === 'notification') {
          addNotification(data.notification.message, 'websocket');
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
        addNotification('Ошибка обработки уведомления.', 'error');
      }
    };
  }, [isAuthenticated, getToken, fetchFriends, addNotification]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchFriends();
    setupWebSocket();
    return () => {
      isMountedRef.current = false;
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      wsRef.current = null;
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
              {friends.map((friend) => (
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
            {searchQuery
              ? 'Друзья не найдены'
              : 'У вас нет взаимных друзей. Подпишитесь на кого-нибудь, кто подписан на вас!'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;