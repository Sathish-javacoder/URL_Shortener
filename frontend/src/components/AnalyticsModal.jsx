import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import styles from './AnalyticsModal.module.css'

function AnalyticsModal({analytics, onClose }) 
{
  if (!analytics)
    {
     return null
    }

  const formatDate = (dateStr) => {
    if (!dateStr)
      {
      return '—'
      }

    return new Date(dateStr).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric',})
  }

  const chartData = (analytics.clicksByDate || []).map(item => ({
    date: item.date,
    clicks: item.clicks,
  }))

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            URL Analytics
          </h2>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Original URL</span>
              <a href={analytics.originalUrl} target="_blank" rel="noreferrer" className={styles.metaValue}>
                {analytics.originalUrl}
              </a>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Short URL</span>
              <a href={analytics.shortUrl} target="_blank" rel="noreferrer" className={styles.metaValue}>
                {analytics.shortUrl}
              </a>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created On</span>
              <span className={styles.metaValue}>{formatDate(analytics.createdAt)}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Last Accessed</span>
              <span className={styles.metaValue}>{formatDate(analytics.lastAccessedAt)}</span>
            </div>
          </div>

          <div className={styles.clickBadge}>
            <span className={styles.clickCount}>{analytics.totalClicks}</span>
            <span className={styles.clickLabel}>Total Clicks</span>
          </div>

          {chartData.length > 0 && (
            <div className={styles.chartSection}>
              <h3 className={styles.chartTitle}>Clicks Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" vertical={false} />
                  <XAxis dataKey="date"
                         tick={{ fontSize: 11, fill: '#9ca3af' }} 
                         axisLine={false} 
                         tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} 
                         axisLine={false}
                         tickLine={false} 
                         allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#2563a8" 
                       radius={[3, 3, 0, 0]} 
                       barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.length === 0 && (
            <div className={styles.noClicks}>No click data recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsModal
