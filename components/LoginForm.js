import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/LoginForm.module.scss';
import { useLinks } from '../context/LinkContext';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setIsLoggedIn, showNotification } = useLinks();

  // Load saved credentials when component mounts
  useEffect(() => {
    // Try to get saved credentials from localStorage
    try {
      const savedCredentials = localStorage.getItem('devlink_credentials');
      if (savedCredentials) {
        const parsed = JSON.parse(savedCredentials);
        setUsername(parsed.username || '');
        setPassword(parsed.password || '');
      }
    } catch (e) {
      console.error('Error loading saved credentials:', e);
    }
  }, []);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isLogin ? 'Login failed' : 'Registration failed'));
      }

      // Save credentials to localStorage for next login
      localStorage.setItem('devlink_credentials', JSON.stringify({ username, password }));

      // Save username to localStorage for user identification
      localStorage.setItem('devlink_user', JSON.stringify({ 
        username: username, 
        id: data.user?.id 
      }));

      setIsLoggedIn(true);
      showNotification(
        isLogin 
          ? 'Login successful! Local links can now be synced to the cloud.'
          : 'Registration successful! Your local links are now available in the cloud.',
        'success'
      );
      router.push('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      <div className={styles.toggleMode}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={toggleMode}>
          {isLogin ? 'Register' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;