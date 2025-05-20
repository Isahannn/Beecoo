import React, { useState, useEffect, useRef, memo, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../Context/AutoContext.jsx';
import { NotificationContext } from '../Notification/NotificationContext.jsx';
import ProfileHeader from './ProfileHeader';
import ProfileActions from './ProfileActions';
import PostList from '../Home/PostList.jsx';
import PostModal from '../Home/PostModal.jsx';
import EditProfile from './EditProfile.jsx';
import './ProfilePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

const ProfilePage = () => {
  const { getToken, user: authUser } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsError, setWsError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const wsRef = useRef(null);
  const wsErrorCountRef = useRef(0);
  const maxWsErrors = 5;
  const isMountedRef = useRef(true);

  console.log('ProfilePage рендерится, id:', id, 'authUser:', authUser);

  useEffect(() => {
    console.log('Запуск useEffect для WebSocket, id:', id);
    isMountedRef.current = true;
    const token = getToken();
    if (!token) {
      console.warn('No auth token for WebSocket in ProfilePage');
      setWsError('Токен для WebSocket отсутствует.');
      addNotification('Токен для WebSocket отсутствует.', 'error');
      return;
    }

    const connectWebSocket = () => {
      if (!isMountedRef.current) {
        console.log('Компонент размонтирован, подключение WebSocket отменено');
        return;
      }
      if (wsErrorCountRef.current >= maxWsErrors) {
        console.warn('WebSocket disabled after repeated failures.');
        setWsError('Уведомления отключены.');
        addNotification('Уведомления отключены.', 'error');
        return;
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket уже подключен');
        return;
      }

      console.log(`Попытка подключения WebSocket, попытка ${wsErrorCountRef.current + 1}`);
      try {
        wsRef.current = new WebSocket(`${WS_URL}/ws/notifications/?token=${token}`);
      } catch (err) {
        console.error('WebSocket initialization error:', err);
        wsErrorCountRef.current += 1;
        setWsError('Не удалось инициализировать WebSocket.');
        addNotification('Не удалось инициализировать WebSocket.', 'error');
        return;
      }

      wsRef.current.onopen = () => {
        if (!isMountedRef.current) return;
        console.log('WebSocket connected');
        wsErrorCountRef.current = 0;
        setWsError(null);
        addNotification('WebSocket подключен.', 'websocket');
      };

      wsRef.current.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          console.log('Notification received:', data);
          if (data.type === 'follow' || data.type === 'unfollow') {
            fetchProfileData();
            addNotification(
              data.type === 'follow' ? 'Новый подписчик!' : 'Подписчик отписался',
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

      wsRef.current.onerror = (error) => {
        if (!isMountedRef.current) return;
        console.error('WebSocket error:', error);
        wsErrorCountRef.current += 1;
        setWsError(
          wsErrorCountRef.current < maxWsErrors
            ? 'Ошибка WebSocket. Пытаемся переподключиться...'
            : 'Уведомления отключены.'
        );
        addNotification(
          wsErrorCountRef.current < maxWsErrors
            ? 'Ошибка WebSocket. Пытаемся переподключиться...'
            : 'Уведомления отключены.',
          'error'
        );
      };

      wsRef.current.onclose = (event) => {
        if (!isMountedRef.current) return;
        console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
        wsRef.current = null;
        if (wsErrorCountRef.current < maxWsErrors && event.code !== 1000) {
          const delay = Math.min(2000 * 2 ** wsErrorCountRef.current, 30000);
          console.log(`Повторная попытка через ${delay} мс`);
          setTimeout(connectWebSocket, delay);
        }
      };
    };

    connectWebSocket();

    return () => {
      console.log('Очистка WebSocket');
      isMountedRef.current = false;
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close(1000, 'Компонент размонтирован');
      }
      wsRef.current = null;
    };
  }, [getToken, addNotification]);


  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error('Токен авторизации отсутствует');

      const profileUrl = id
        ? `${API_URL}/api/users/${id}/`
        : `${API_URL}/api/users/me/`;

      const response = await fetch(profileUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Ошибка: ${response.status}`);
      }
      const profileData = await response.json();
      console.log('Profile data:', profileData, 'authUser:', authUser);
      setUser({
        id: profileData.id,
        full_name: profileData.full_name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        avatar: profileData.avatar,
        bio: profileData.bio,
        date_of_birth: profileData.date_of_birth,
        friends_count: profileData.friends_count || 0,
        following_count: profileData.following_count || 0,
        followers_count: profileData.followers_count || 0,
        posts_count: profileData.posts_count || 0,
      });
      setCurrentUserId(authUser?.id || profileData.id);

      await fetchPosts(`${API_URL}/api/posts/?user=${profileData.id}&page=1`, profileData.id);
    } catch (err) {
      console.error('Fetch profile error:', err.message);
      setError(err.message || 'Не удалось загрузить профиль');
      addNotification(err.message || 'Не удалось загрузить профиль', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, getToken, authUser, addNotification]);

  useEffect(() => {
    console.log('Запуск useEffect для профиля и постов, id:', id);
    setPosts([]);
    setNextPage(null);
    setCurrentPage(1);
    fetchProfileData();
  }, [id, fetchProfileData]);

  const fetchPosts = async (url, userId) => {
    try {
      setIsFetchingMore(true);
      const token = getToken();
      if (!token) throw new Error('Токен авторизации отсутствует');

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
      const postsData = await response.json();

      const uniquePosts = Array.from(
        new Map(
          (postsData.results || [])
            .filter((post) => post.user.id === userId)
            .map((post) => [post.id, post])
        ).values()
      );

      setPosts((prev) => {
        const allPosts = [...prev, ...uniquePosts];
        return Array.from(new Map(allPosts.map((post) => [post.id, post])).values());
      });

      setTotalPages(Math.ceil(postsData.count / 10));
      setCurrentPage((prev) => prev + 1);

      const nextUrl = postsData.next
        ? new URL(postsData.next, window.location.origin)
        : null;

      if (nextUrl && !nextUrl.searchParams.has('user')) {
        nextUrl.searchParams.append('user', userId);
      }
      setNextPage(nextUrl?.toString() || null);
    } catch (err) {
      console.error('Fetch posts error:', err.message);
      setError(err.message || 'Не удалось загрузить посты');
      addNotification(err.message || 'Не удалось загрузить посты', 'error');
    } finally {
      setIsFetchingMore(false);
    }
  };

  const addPost = (newPost) => {
    if (newPost.user.id !== authUser?.id) {
      console.error('Попытка создать пост от имени другого пользователя:', newPost.user.id, authUser?.id);
      setError('Вы не можете создавать посты от имени другого пользователя.');
      addNotification('Вы не можете создавать посты от имени другого пользователя.', 'error');
      return;
    }
    setPosts((prevPosts) => {
      const updatedPosts = [newPost, ...prevPosts];
      return Array.from(new Map(updatedPosts.map((post) => [post.id, post])).values());
    });
    setUser((prevUser) => ({
      ...prevUser,
      posts_count: (prevUser.posts_count || 0) + 1,
    }));
    addNotification('Пост создан!', 'post-create');
  };

  const deletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setUser((prevUser) => ({
      ...prevUser,
      posts_count: (prevUser.posts_count || 0) - 1,
    }));
    addNotification('Пост удален!', 'post-delete');
  };

  const loadMorePosts = () => {
    if (nextPage && !isFetchingMore && user?.id) {
      fetchPosts(nextPage, user.id);
    }
  };

  const isOwnProfile = authUser?.id === user?.id;
  console.log('isOwnProfile:', isOwnProfile, 'authUser.id:', authUser?.id, 'user.id:', user?.id);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">Ошибка: {error}</div>;

  return (
    <div className="profile-page-container">
      <div className="profile-page">
        {wsError && (
          <div className="ws-error-message" style={{ color: 'orange', marginBottom: '10px' }}>
            {wsError}
          </div>
        )}
        {isOwnProfile && isEditingProfile ? (
          <EditProfile
            user={user}
            onCancel={() => setIsEditingProfile(false)}
            onSave={(updatedUser) => {
              console.log('Updated user from EditProfile:', updatedUser);
              setUser(updatedUser);
              setIsEditingProfile(false);
              addNotification('Профиль обновлен!', 'profile-update');
            }}
          />
        ) : (
          <>
            <ProfileHeader user={user} postsCount={user?.posts_count || posts.length} />
            <ProfileActions
              currentUserId={authUser?.id}
              profileUserId={user?.id}
                onEdit={() => setIsEditingProfile(true)}

            />
            {isOwnProfile && authUser?.id ? (
              <button onClick={() => setIsModalOpen(true)}>Создать пост</button>
            ) : null}
            {isModalOpen && isOwnProfile ? (
              <PostModal onClose={() => setIsModalOpen(false)} onPostCreated={addPost} />
            ) : null}
            <PostList
              posts={posts}
              currentUser={{ id: authUser?.id }}
              loadMorePosts={loadMorePosts}
              isFetchingMore={isFetchingMore}
              hasMore={!!nextPage}
              onDeletePost={deletePost}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ProfilePage);