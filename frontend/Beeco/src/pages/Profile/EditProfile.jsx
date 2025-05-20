import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { NotificationContext } from '../Notification/NotificationContext.jsx';
import './EditProfile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const EditProfile = ({ user, onCancel, onSave }) => {
  const { addNotification } = useContext(NotificationContext);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    avatar: null,
    date_of_birth: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        avatar: null,
        date_of_birth: user.date_of_birth || '',
      });
      setAvatarPreview(user.avatar || 'https://placehold.co/150x150');
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar') {
      const file = files[0];
      setFormData(prev => ({ ...prev, avatar: file }));
      setAvatarPreview(file ? URL.createObjectURL(file) : user.avatar);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authorization token missing');

      const payload = new FormData();
      payload.append('first_name', formData.first_name);
      payload.append('last_name', formData.last_name);
      payload.append('bio', formData.bio);
      if (formData.avatar) payload.append('avatar', formData.avatar);
      payload.append('date_of_birth', formData.date_of_birth);


      const response = await axios.patch(
        `${API_URL}/api/users/${user.id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      addNotification('Profile successfully updated', 'success');


      if (onSave) {
        onSave(response.data);
      }
    } catch (err) {
      console.error('EditProfile error:', err.response || err);
      const msg = err.response?.data?.detail || err.message || 'Update failed';
      setError(msg);
      addNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      {error && <div className="error-message">{error}</div>}
      <div className="avatar-preview">
        <img src={avatarPreview} alt="Avatar Preview" className="avatar" />
      </div>
      <label className="form-label">
        First Name:
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>
      <label className="form-label">
        Last Name:
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>
      <label className="form-label">
        Bio:
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="form-textarea"
        />
      </label>
      <label className="form-label">
        Avatar:
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleChange}
          className="form-file"
        />
      </label>
      <label className="form-label">
        Date of Birth:
        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="form-input"
        />
      </label>
      <div className="form-buttons">
        <button type="submit" disabled={loading} className="form-button form-button--submit">
          {loading ? 'Saving...' : 'Save'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="form-button form-button--cancel">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default EditProfile;
