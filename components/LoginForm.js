import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/LoginForm.module.scss';
import { useLinks } from '../context/LinkContext';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Standard: aktiviert
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setIsLoggedIn, showNotification } = useLinks();

  // Lade nur den Benutzernamen, nicht das Passwort
  useEffect(() => {
    try {
      // Versuche, gespeicherten Benutzernamen zu laden
      const userInfo = localStorage.getItem('devlink_user');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        if (userData.username) {
          setUsername(userData.username);
        }
      }
    } catch (e) {
      console.error('Fehler beim Laden des Benutzernamens:', e);
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
        body: JSON.stringify({ 
          username, 
          password, 
          rememberMe // Sende die rememberMe-Option an den Server
        }),
        credentials: 'include', // Wichtig für Cookie-Handhabung
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || (isLogin ? 'Login fehlgeschlagen' : 'Registrierung fehlgeschlagen'));
      }

      // Erfolgreiche Antwort verarbeiten
      const data = await res.json();

      // Speichere nur Benutzername und ID, niemals das Passwort
      localStorage.setItem('devlink_user', JSON.stringify({ 
        username: username, 
        id: data.user?.id 
      }));

      setIsLoggedIn(true);
      showNotification(
        isLogin 
          ? `Login erfolgreich! ${rememberMe ? 'Du bleibst für 30 Tage angemeldet.' : 'Du bleibst für 24 Stunden angemeldet.'}`
          : 'Registrierung erfolgreich! Deine lokalen Links sind jetzt in der Cloud verfügbar.',
        'success'
      );
      
      // Kurze Verzögerung, um sicherzustellen, dass der Status aktualisiert wird
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      setError(error.message || 'Ein unbekannter Fehler ist aufgetreten');
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
        <div className={styles.rememberMeContainer}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe">
            Angemeldet bleiben (30 Tage)
          </label>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? (isLogin ? 'Anmelden...' : 'Registrieren...') : (isLogin ? 'Anmelden' : 'Registrieren')}
        </button>
      </form>
      <div className={styles.toggleMode}>
        {isLogin ? "Noch kein Konto? " : "Bereits ein Konto? "}
        <button type="button" onClick={toggleMode}>
          {isLogin ? 'Registrieren' : 'Anmelden'}
        </button>
      </div>
    </div>
  );
};

export default LoginForm;