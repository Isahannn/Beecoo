import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../Context/AutoContext.jsx';
import { NotificationContext } from '../../../pages/Notification/NotificationContext.jsx';
import axios from 'axios';
import './UserCard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const UserCard = ({ user, onFollow, onUnfollow }) => {
  const { currentUser, getToken } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const [isFriend, setIsFriend] = useState(user.is_friend ?? false);
  const [isFollowing, setIsFollowing] = useState(user.is_following ?? false);
  const [isFollowedBy, setIsFollowedBy] = useState(user.is_followed_by ?? false);

  const isCurrentUser = currentUser && user.id === currentUser.id;

  useEffect(() => {
    const fetchRelationshipStatus = async () => {
      if (!currentUser || isCurrentUser) return;
      if (
        user.is_friend !== undefined &&
        user.is_following !== undefined &&
        user.is_followed_by !== undefined
      ) {
        return;
      }

      try {
        const token = getToken();
        const friendshipResponse = await axios.get(
          `${API_URL}/users/${user.id}/check_friendship/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsFriend(friendshipResponse.data.is_friend);

        const followStatusResponse = await axios.get(
          `${API_URL}/users/${user.id}/follow_status/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsFollowing(followStatusResponse.data.is_following);
        setIsFollowedBy(followStatusResponse.data.is_followed_by);
      } catch (err) {
        console.error('Error fetching relationship status:', err);
        addNotification('Не удалось проверить статус подписки', 'error');
      }
    };

    fetchRelationshipStatus();
  }, [user.id, user.is_friend, user.is_following, user.is_followed_by, currentUser, getToken, isCurrentUser, addNotification]);

  const handleFollow = async () => {
    if (!onFollow) return;
    try {
      await onFollow(user.id);
      setIsFollowing(true);
      addNotification(`Вы подписались на ${user.full_name || 'пользователя'}`, 'success');
    } catch (err) {
      console.error('Follow error:', err);
      setIsFollowing(false);
      addNotification(err.message || 'Не удалось подписаться', 'error');
    }
  };

  const handleUnfollow = async () => {
    if (!onUnfollow) return;
    try {
      await onUnfollow(user.id);
      setIsFollowing(false);
      addNotification(`Вы отписались от ${user.full_name || 'пользователя'}`, 'info');
    } catch (err) {
      console.error('Unfollow error:', err);
      setIsFollowing(true);
      addNotification(err.message || 'Не удалось отписаться', 'error');
    }
  };

  return (
    <div className="user-card">
      <Link to={`/user/${user.id}`}>
        <img
          src={user.avatar || 'https://placehold.co/80x80'}
          alt="User Avatar"
          className="user-avatar"
        />
      </Link>
      <div className="user-info">
        <Link to={`/user/${user.id}`} className="user-name">
          {user.full_name || 'Пользователь'}
        </Link>
        <p className="user-bio">{user.bio || 'О себе не указано'}</p>
      </div>
      {!isCurrentUser && (
        <div className="friend-action">
          {isFriend && isFollowing ? (
            <button className="friend-button friend-status-button" onClick={handleUnfollow}>
              Друзья
            </button>
          ) : isFollowing ? (
            <button className="friend-button unfollow-button" onClick={handleUnfollow}>
              Отписаться
            </button>
          ) : (
            <button
              className="friend-button"
              onClick={handleFollow}
              disabled={!onFollow}
            >
              {isFollowedBy ? 'Подписаться в ответ' : 'Подписаться'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserCard;