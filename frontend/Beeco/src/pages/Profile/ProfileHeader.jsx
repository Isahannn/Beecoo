import React from 'react';
import './ProfileHeader.css';

const ProfileHeader = ({ user, postsCount }) => {
  if (!user) return null;

  return (
    <div className="profile-header">
      <img
        src={user.avatar || 'https://placehold.co/150x150'}
        alt="User Avatar"
        className="avatar"
      />
      <h2>{user.full_name || 'Пользователь'}</h2>
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{postsCount || 0}</span>
          <span className="stat-label">постов</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{user.friends_count || 0}</span>
          <span className="stat-label">друзей</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{user.following_count || 0}</span>
          <span className="stat-label">подписок</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{user.followers_count || 0}</span>
          <span className="stat-label">подписчиков</span>
        </div>
      </div>
      <p className="bio">{user.bio || 'О себе не указано'}</p>
    </div>
  );
};

export default ProfileHeader;