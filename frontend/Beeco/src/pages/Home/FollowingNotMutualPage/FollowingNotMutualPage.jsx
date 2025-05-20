import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../Context/AutoContext.jsx';
import UserCard from '../../ListUser/UserCard/UserCard';
import SmartSearch from '../../ListUser/SmartSearch/SmartSearch.jsx';
import './FollowingNotMutualPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const FollowingNotMutualPage = () => {
  const { getToken, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(localStorage.getItem('followingSearchQuery') || '');

  const fetchFollowingNotMutual = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Пожалуйста, войдите в аккаунт');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      if (!token) throw new Error('Токен авторизации отсутствует');

      const url = new URL(`${API_URL}/api/users/following_not_mutual/`);
      url.searchParams.append('page', page);
      if (searchQuery) url.searchParams.append('search', searchQuery);

      console.log('Fetching non-mutual following with URL:', url.toString());
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Ошибка: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Non-mutual following API response:', data);
      setFollowing(data.results || []);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error('Fetch non-mutual following error:', err.message);
      setError(err.message || 'Не удалось подключиться к серверу.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, isAuthenticated, getToken]);

  useEffect(() => {
    fetchFollowingNotMutual();
  }, [fetchFollowingNotMutual]);

  const handleUnfollow = useCallback(
    async (userId) => {
      try {
        const token = getToken();
        const response = await fetch(`${API_URL}/users/${userId}/follow/`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { detail: `Ошибка: ${response.status} ${response.statusText}` };
          }
          throw new Error(errorData.detail || 'Ошибка при отписке');
        }

        setFollowing((prev) => prev.filter((user) => user.id !== userId));
        console.log(`Unfollowed user ${userId}`);
      } catch (err) {
        console.error('Unfollow error:', err.message);
        setError(err.message || 'Не удалось отписаться');
      }
    },
    [getToken]
  );

  const handleAddFriend = useCallback(
    (userId) => {
      setFollowing((prev) => prev.filter((user) => user.id !== userId));
      console.log(`Added friend ${userId}`);
    },
    []
  );

  const handleSearchChange = useCallback((newQuery) => {
    setSearchQuery(newQuery);
    localStorage.setItem('followingSearchQuery', newQuery);
    setPage(1);
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">Ошибка: {error}</div>;

  return (
    <div className="following-not-mutual-page-container">
      <div className="following-not-mutual-page">
        <h1>Мои подписки</h1>
        <SmartSearch onSearchChange={handleSearchChange} disabled={loading} />
        {following.length > 0 ? (
          <>
            <div className="following-list">
              {following.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onUnfollow={handleUnfollow}
                  onAddFriend={handleAddFriend}
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
          <p className="no-following">
            {searchQuery ? 'Пользователи не найдены' : 'Вы ни на кого не подписаны'}
          </p>
        )}
      </div>
    </div>
  );
};

export default FollowingNotMutualPage;