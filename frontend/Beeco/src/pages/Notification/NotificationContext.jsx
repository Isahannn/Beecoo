import React, { createContext, useState, useCallback } from 'react';
import Notification from './Notification';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, action = 'info') => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message, action }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="notification-container">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            message={notif.message}
            action={notif.action}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};