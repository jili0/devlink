import { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Link from 'next/link';
import CategoryColumn from '../components/CategoryColumn';
import Notification from '../components/Notification';
import styles from '../styles/Home.module.scss';
import { useLinks } from '../context/LinkContext';

export default function Home() {
  const { 
    links, 
    isLoggedIn, 
    updateLink, 
    deleteLink, 
    notification, 
    isLoading, 
    showNotification 
  } = useLinks();

  // Filter out invalid links and deduplicate categories
  const validLinks = links.filter(link => 
    link && 
    typeof link === 'object' && 
    link._id && 
    link.title && 
    link.url && 
    link.category
  );
  
  // Get unique categories from valid links
  const categories = [...new Set(validLinks.map(link => link.category))].sort();

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // Find the moved link
    const linkToMove = links.find(link => link._id === draggableId);
    
    if (!linkToMove) return;
    
    // Check if user can edit this link
    if (linkToMove.isCloudSaved && !isLoggedIn) {
      showNotification('Please log in to reorder cloud links', 'error');
      return;
    }
    
    // Check if category changed
    if (source.droppableId !== destination.droppableId) {
      // Update the link with new category
      try {
        await updateLink(draggableId, {
          ...linkToMove,
          category: destination.droppableId
        });
        
        showNotification(
          linkToMove.isCloudSaved 
            ? `Link moved to ${destination.droppableId}` 
            : `Local link moved to ${destination.droppableId}`, 
          'success'
        );
      } catch (error) {
        console.error('Error moving link:', error);
        showNotification('Failed to move link', 'error');
      }
    }
  };

  return (
    <main className={styles.container}>
      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : validLinks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <h2>Welcome to DevLink!</h2>
            <p>Your collection is empty. Start by adding some links using the form above.</p>
            <div className={styles.emptyStateGraphic}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13.5L14 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M14.5 7.5L16.5 9.5L14.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.5 11.5L7.5 9.5L9.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p>Tips:</p>
            <ul>
              <li>Add your frequently used development resources</li>
              <li>Create custom categories to organize them</li>
              <li>Drag and drop links between categories</li>
            </ul>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={styles.columnsContainer}>
            {categories.map(category => (
              <CategoryColumn
                key={category}
                category={category}
                links={validLinks.filter(link => link.category === category)}
              />
            ))}
          </div>
        </DragDropContext>
      )}
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => showNotification(null)}
        />
      )}
      
      {!isLoggedIn && validLinks.some(link => link.isCloudSaved) && (
        <div className={styles.infoBox}>
          <p>
            You are viewing some links stored in the cloud. 
            <Link href="/login">Sign in</Link> to edit or delete them.
          </p>
        </div>
      )}
    </main>
  );
}