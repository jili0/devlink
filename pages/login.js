import { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../components/LoginForm';
import styles from '../styles/Login.module.scss';
import { useLinks } from '../context/LinkContext';

export default function Login() {
  const router = useRouter();
  const { isLoggedIn } = useLinks();
  
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  return (
    <div className={styles.container}>
      <LoginForm />
    </div>
  );
}