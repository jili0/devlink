import React from 'react';
import Link from 'next/link';
import styles from '../styles/About.module.scss';

export default function About() {
  return (
    <div className={styles.container}>
      <div className={styles.aboutContent}>
        <h1>About DevLink</h1>
        
        <section className={styles.section}>
          <h2>What is DevLink?</h2>
          <p>
            DevLink is a simple, clean, and organized way to manage your development resources.
            It allows you to categorize and store links to all your favorite tools, documentation,
            and resources in one place for easy access.
          </p>
        </section>
        
        <section className={styles.section}>
          <h2>Features</h2>
          <ul>
            <li>Organize links in five categories: Work, Utils, Design, Others, and Projects</li>
            <li>Drag and drop functionality for easy reorganization</li>
            <li>Clean, minimalist interface designed for developers</li>
            <li>Use without an account - links are stored locally on your device</li>
            <li>Sync local links to the cloud when you create an account</li>
            <li>Visual distinction between local and cloud-saved links</li>
          </ul>
        </section>
        
        <section className={styles.section}>
          <h2>How to Use</h2>
          <p>
            Using DevLink is simple. Add new links using the form at the top of the page.
            Organize your links by dragging and dropping them between categories. 
            Click on any link to visit the website.
          </p>
          <p>
            <strong>Local Storage:</strong> DevLink works even without an account. Your links
            are stored locally on your device and will be available the next time you visit.
            Local links have a light yellow background and can be edited anytime.
          </p>
          <p>
            <strong>Cloud Storage:</strong> When you create an account and log in, you can
            sync your local links to the cloud. Cloud-stored links are accessible from any device
            when you log in, but require authentication to edit or delete.
          </p>
        </section>
        
        <div className={styles.backLink}>
          <Link href="/">
            &larr; Back to DevLink
          </Link>
        </div>
      </div>
    </div>
  );
}