import React, { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import UrlTable from './components/UrlTable.jsx'
import StatisticsSection from './components/StatisticsSection.jsx'
import AnalyticsModal from './components/AnalyticsModal.jsx'

import { createShortUrl, getRecentUrls, getAnalytics, getStatistics } from './services/api.js'
import styles from './App.module.css'

function App() {
  const [urls, setUrls] = useState([])
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1 })
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  const fetchUrls = useCallback(async (page = 0) => {
    setTableLoading(true)
    try {
      const data = await getRecentUrls(page, 10)
      setUrls(data.content)
      setPagination({ page: data.page, totalPages: data.totalPages })
    } catch (err) {
      toast.error('Failed to load URLs')
    } finally {
      setTableLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStatistics()
      setStats(data)
    } catch (err) {
      // silently fail stats
    }
  }, [])

  useEffect(() => {
    fetchUrls(0)
    fetchStats()
  }, [fetchUrls, fetchStats])

  const handleShorten = async (url) => {
    setLoading(true)
    try {
      const result = await createShortUrl(url)
      toast.success(
        <span>
          Short URL created!{' '}
          <a href={result.shortUrl} target="_blank" rel="noreferrer" style={{ color: '#2563a8' }}>
            {result.shortUrl}
          </a>
        </span>,
        { duration: 5000 }
      )
      await fetchUrls(0)
      await fetchStats()
    } catch (err) {
      const msg = err?.response?.data?.originalUrl || err?.response?.data?.error || 'Failed to shorten URL'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    fetchUrls(newPage)
  }

  const handleAnalytics = async (id) => {
    try {
      const data = await getAnalytics(id)
      setAnalytics(data)
    } catch (err) {
      toast.error('Failed to load analytics')
    }
  }

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      toast.success('Copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }

  return (
    <div className={styles.app}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: '13px' },
          success: { iconTheme: { primary: '#27ae60', secondary: '#fff' } },
        }}
      />

      <Header />
      <HeroSection onShorten={handleShorten} loading={loading} />

      <main className={styles.main}>
        {tableLoading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <UrlTable
            data={urls}
            pagination={pagination}
            onPageChange={handlePageChange}
            onAnalytics={handleAnalytics}
            onCopy={handleCopy}
          />
        )}

        <StatisticsSection stats={stats} />
      </main>

      {analytics && (
        <AnalyticsModal analytics={analytics} onClose={() => setAnalytics(null)} />
      )}
    </div>
  )
}

export default App
