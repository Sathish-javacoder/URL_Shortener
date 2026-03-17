import React from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from 'recharts'
import styles from './StatisticsSection.module.css'

function StatisticsSection({ stats }) {
  if (!stats) return null

  // Merge clicks and creations by date
  const dateMap = {}

  stats.clicksByDate?.forEach(item => {
    const d = item.date
    if (!dateMap[d]) dateMap[d] = { date: d, clicks: 0, creations: 0 }
    dateMap[d].clicks = item.clicks
  })

  stats.creationsByDate?.forEach(item => {
    const d = item.date
    if (!dateMap[d]) dateMap[d] = { date: d, clicks: 0, creations: 0 }
    dateMap[d].creations = item.creations
  })

  const chartData = Object.values(dateMap)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      ...item,
      date: formatChartDate(item.date),
    }))

  function formatChartDate(dateStr) {
    const d = new Date(dateStr)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return `${d.getDate()}th ${days[d.getDay()]}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.totalUrls ?? 0}</span>
            <span className={styles.statLabel}>Total URLs</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.totalClicks ?? 0}</span>
            <span className={styles.statLabel}>Total Clicks</span>
          </div>
        </div>

        <h3 className={styles.chartTitle}>Recent Statistics of Click Counts</h3>

        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="square"
                iconSize={10}
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
              />
              <Bar
                dataKey="creations"
                name="URL Creations"
                fill="#3b82c4"
                opacity={0.85}
                radius={[2, 2, 0, 0]}
                barSize={18}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                name="URL Clicks"
                stroke="#1abc9c"
                strokeWidth={2}
                fill="rgba(26,188,156,0.12)"
                dot={{ r: 3, fill: '#1abc9c', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}

export default StatisticsSection
