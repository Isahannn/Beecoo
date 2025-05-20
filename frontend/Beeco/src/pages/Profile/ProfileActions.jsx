import React from 'react';

const ProfileActions = ({ currentUserId, profileUserId, onEdit }) => {
  if (currentUserId !== profileUserId) {
    return null;
  }

  return (
    <div className="profile-actions">
      <button className="edit-profile-button" onClick={onEdit}>
        Редактировать профиль
      </button>
    </div>
  );
};

export default ProfileActions;
