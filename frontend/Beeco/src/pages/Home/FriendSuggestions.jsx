import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './FriendSuggestions.css';

const FriendSuggestions = ({ suggestions = [], followedUsers = [], loading, onAddFriend }) => {
  const filteredSuggestions = useMemo(() => {
    return followedUsers.length
      ? suggestions.filter(friend => !followedUsers.includes(friend.id))
      : suggestions;
  }, [suggestions, followedUsers]);

  return (
    <div className="friend-suggestions">
      <h2 className="suggestions-title">Предложения дружбы</h2>
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : filteredSuggestions.length > 0 ? (
        filteredSuggestions.map(friend => (
          <div key={friend.id} className="friend-item">
            <img
              className="friend-avatar"
              src={friend.avatar || 'https://placehold.co/36x36'}
              alt={`${friend.first_name || 'Friend'} avatar`}
            />
            <Link to={`/user/${friend.id}`} className="friend-name-link">
              {friend.first_name || 'Неизвестный'}
            </Link>
            <button
              className="friend-button"
              onClick={() => onAddFriend(friend.id)}
            >
              Подписаться
            </button>
          </div>
        ))
      ) : (
        <p className="no-suggestions">Нет предложений подписки.</p>
      )}
    </div>
  );
};

export default FriendSuggestions;