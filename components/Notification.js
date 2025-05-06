import React, { useEffect } from 'react';
import styles from '../styles/Notification.module.scss';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <p>{message}</p>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Notification;