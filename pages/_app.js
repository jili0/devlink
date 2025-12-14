import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Header from '../components/Header';
import Notification from '../components/Notification';
import { LinkProvider } from '../context/LinkContext';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }) {
  return (
    <LinkProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </LinkProvider>
  );
}

function AppContent({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  // This ensures that localStorage is only accessed after component is mounted
  // to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;