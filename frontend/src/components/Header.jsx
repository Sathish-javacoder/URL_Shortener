import React from 'react'
import styles from './Header.module.css'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.logo}>🔗</span>
        <h1 className={styles.title}>Easy URL Shortener</h1>
      </div>
    </header>
  )
}

export default Header
