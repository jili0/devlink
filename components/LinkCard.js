import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/LinkCard.module.scss';
import { useLinks } from '../context/LinkContext';

const LinkCard = ({ link, provided }) => {
  if (!link || !link._id || typeof link !== 'object') {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(link?.title || '');
  const [url, setUrl] = useState(link?.url || '');
  const titleInputRef = useRef(null);
  const urlInputRef = useRef(null);
  const { isLoggedIn, updateLink, deleteLink, showNotification } = useLinks();

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (link) {
      setTitle(link.title || '');
      setUrl(link.url || '');
    }
  }, [link]);

  const handleEdit = () => {
    if (link.isCloudSaved && !isLoggedIn) {
      showNotification('Please log in to edit cloud links', 'error');
      return;
    }
    setIsEditing(true);
  };

  const handleDelete = async () => {
    try {
      if (link.isCloudSaved && !isLoggedIn) {
        showNotification('Please log in to delete cloud links', 'error');
        return;
      }
      await deleteLink(link._id);
    } catch (error) {
      showNotification('Failed to delete link', 'error');
    }
  };

  const handleSave = async (field) => {
    if (field === 'title' && title === link.title) {
      if (field === 'title' && urlInputRef.current) {
        urlInputRef.current.focus();
      } else {
        setIsEditing(false);
      }
      return;
    }
    
    if (field === 'url' && url === link.url) {
      setIsEditing(false);
      return;
    }

    let processedUrl = url;
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }

    try {
      await updateLink(link._id, { title, url: processedUrl });
      
      if (field === 'title' && urlInputRef.current) {
        urlInputRef.current.focus();
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      // Handle error
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave(field);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTitle(link.title || '');
      setUrl(link.url || '');
      setIsEditing(false);
    }
  };

  const handleBlur = (field) => {
    setTimeout(() => {
      handleSave(field);
    }, 100);
  };

  const titleStr = title || '';
  const displayTitle = titleStr.length > 40 ? `${titleStr.substring(0, 37)}...` : titleStr;
  
  // Decide whether to show actions buttons based on isLoggedIn and isCloudSaved
  const showActions = !link.isCloudSaved || isLoggedIn;

  return (
    <div 
      className={`${styles.linkCard} ${isEditing ? styles.editing : ''} ${!link.isCloudSaved ? styles.localLink : ''}`}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      {isEditing ? (
        <div className={styles.editForm}>
          <div className={styles.inputRow}>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'title')}
              onBlur={() => handleBlur('title')}
            />
          </div>
          <div className={styles.inputRow}>
            <input
              ref={urlInputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'url')}
              onBlur={() => handleBlur('url')}
            />
          </div>
        </div>
      ) : (
        <>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.linkTitle}
          >
            {displayTitle}
          </a>
          
          <div className={styles.linkStatus}>
            {/* Always show Local badge since all links are stored locally */}
            <span className={styles.localBadge} title="Stored locally">
              Local
            </span>
            
            {/* Only show Cloud badge if it's actually saved in the cloud */}
            {link.isCloudSaved && (
              <span className={styles.cloudBadge} title="Stored in cloud">
                Cloud
              </span>
            )}
          </div>
          
          <div className={styles.actions} style={{ opacity: showActions ? '' : '0' }}>
            <button 
              className={styles.editButton} 
              onClick={handleEdit}
              aria-label="Edit"
              title={link.isCloudSaved && !isLoggedIn ? "Log in to edit" : "Edit link"}
              disabled={link.isCloudSaved && !isLoggedIn}
            >
              ✎
            </button>
            <button 
              className={styles.deleteButton} 
              onClick={handleDelete}
              aria-label="Delete"
              title={link.isCloudSaved && !isLoggedIn ? "Log in to delete" : "Delete link"}
              disabled={link.isCloudSaved && !isLoggedIn}
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LinkCard;