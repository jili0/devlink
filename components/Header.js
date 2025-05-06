import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Header.module.scss';
import { useLinks } from '../context/LinkContext';

const Header = () => {
  const router = useRouter();
  const { 
    isLoggedIn, 
    logout, 
    addLink, 
    showNotification, 
    syncLocalLinks,
    username 
  } = useLinks();
  
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState('');
  const [customCategory, setCustomCategory] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim() || !newLinkCategory.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    // Make sure URL has a protocol
    let url = newLinkUrl;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    addLink({
      title: newLinkTitle,
      url,
      category: newLinkCategory
    });

    setNewLinkTitle('');
    setNewLinkUrl('');
    // Don't reset category to allow faster entry of multiple links in same category
  };

  const handleSync = () => {
    syncLocalLinks();
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setCustomCategory(true);
      setNewLinkCategory('');
    } else {
      setCustomCategory(false);
      setNewLinkCategory(value);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <Link href="/">
            <h1>DevLink</h1>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          
          {isLoggedIn ? (
            <>
              {username && (
                <span className={styles.username}>
                  Hi, {username}
                </span>
              )}
              
              <button onClick={handleSync} className={styles.syncButton}>
                Sync Local Links
              </button>
              
              <button onClick={handleLogout} className={styles.authButton}>
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.authButton}>
              Sign In
            </Link>
          )}
        </nav>
      </div>

      <div className={styles.addLinkForm}>
        <form onSubmit={handleAddLink}>
          <input
            type="text"
            placeholder="Name"
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Link"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            required
          />
          
          {customCategory ? (
            <input
              type="text"
              placeholder="Category"
              value={newLinkCategory}
              onChange={(e) => setNewLinkCategory(e.target.value)}
              className={styles.customCategoryInput}
              required
            />
          ) : (
            <select
              value={newLinkCategory}
              onChange={handleCategoryChange}
              required
            >
              <option value="" disabled>Select Category</option>
              <option value="Work">Work</option>
              <option value="Utils">Utils</option>
              <option value="Design">Design</option>
              <option value="Others">Others</option>
              <option value="Projects">Projects</option>
              <option value="custom">Add Custom Category...</option>
            </select>
          )}
          
          {customCategory && (
            <button 
              type="button" 
              className={styles.backButton}
              onClick={() => {
                setCustomCategory(false);
                setNewLinkCategory('Work');
              }}
            >
              ← Back
            </button>
          )}
          
          <button type="submit" className={styles.addButton}>Add Link</button>
        </form>
      </div>
    </header>
  );
};

export default Header;