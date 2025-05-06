import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import LinkCard from './LinkCard';
import styles from '../styles/CategoryColumn.module.scss';

const CategoryColumn = ({ 
  category, 
  links = []
}) => {
  // Filter out any invalid links
  const validLinks = links.filter(link => 
    link && 
    typeof link === 'object' && 
    link._id && 
    typeof link._id === 'string' &&
    link.title &&
    link.url
  );
  
  // Skip rendering empty categories with no valid links
  if (validLinks.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.column}>
      <h2 className={styles.categoryTitle}>{category}</h2>
      <Droppable droppableId={category}>
        {(provided) => (
          <div
            className={styles.linksList}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {validLinks.map((link, index) => (
              <Draggable
                key={link._id}
                draggableId={link._id}
                index={index}
              >
                {(provided) => (
                  <LinkCard
                    link={link}
                    provided={provided}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default CategoryColumn;