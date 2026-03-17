import React, { useState } from 'react'
import styles from './UrlTable.module.css'

function UrlTable({ data, pagination, onPageChange, onAnalytics, onCopy }) 
{
  const { page, totalPages } = pagination

  const formatDate = (dateStr) => {
    if (!dateStr)
    { 
      return '—'
     }
    const d = new Date(dateStr)
    const day = d.getDate()
    const suffix = ['th','st','nd','rd'][(day % 10 < 4 && Math.floor(day / 10) !== 1) ? day % 10 : 0]
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    return `${days[d.getDay()]} ${day}${suffix} ${months[d.getMonth()]}, ${d.getFullYear()}`
  }

  const truncate = (str, max = 52) =>
    str && str.length > max ? str.slice(0, max) + '...' : str

  const pageNumbers = []
  for (let i = 0; i < Math.min(totalPages, 5); i++)
    {
       pageNumbers.push(i)
    }

  return (
    <section className={styles.section}>

      <h2 className={styles.heading}>Recent URLs</h2>
      
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short URL</th>
              <th></th>
              <th>Created on</th>
              <th>Clicks</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>No URLs yet. Shorten your first URL above!</td>
              </tr>
              ) : (
              data.map(row => (
                <tr key={row.id}>
                  <td className={styles.originalUrl}
                      title={row.originalUrl}>
                      {truncate(row.originalUrl)}
                  </td>
                  
                  <td className={styles.shortUrl}>
                    <span className={styles.linkIcon}>🔗</span>
                    <a href={row.shortUrl} target="_blank" rel="noreferrer">
                      {truncate(row.shortUrl, 40)}
                    </a>
                  </td>

                  <td className={styles.actions}>
                    <button
                      className={`${styles.iconBtn} ${styles.copyBtn}`}
                      title="Copy short URL"
                      onClick={() => onCopy(row.shortUrl)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>

                    <button
                      className={`${styles.iconBtn} ${styles.qrBtn}`}
                      title="QR Code"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                        <path d="M14 14h.01M18 14h.01M14 18h.01M18 18h.01M14 21h.01M21 14h.01M21 18h.01M21 21h.01"/>
                      </svg>
                    </button>

                  </td>
                  <td className={styles.date}>{formatDate(row.createdAt)}</td>
                  <td className={styles.clicks}>{row.clickCount}</td>
                  <td>

                    <button
                      className={styles.analyticsBtn}
                      onClick={() => onAnalytics(row.id)}
                    >
                      {/* <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                      </svg> */}
                      Analytics
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          
          <button
            className={styles.pageArrow}
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >&#8249;</button>

          {pageNumbers.map(num => (
            <button
              key={num}
              className={`${styles.pageBtn} ${num === page ? styles.active : ''}`}
              onClick={() => onPageChange(num)}
            >
              {String(num + 1).padStart(2, '0')}
            </button>
          ))}
          <button
            className={styles.pageArrow}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          >&#8250;</button>
        </div>
      )}
    </section>
  )
}

export default UrlTable
