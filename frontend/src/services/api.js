import axios from 'axios'

const API_BASE = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Create a short URL
export const createShortUrl = async (originalUrl) => {
  const response = await api.post('/urls', { originalUrl })
  return response.data
}

// Get recent URLs with pagination
export const getRecentUrls = async (page = 0, size = 10) => {
  const response = await api.get('/urls', { params: { page, size } })
  return response.data
}

// Get analytics for a specific URL
export const getAnalytics = async (id) => {
  const response = await api.get(`/urls/${id}/analytics`)
  return response.data
}

// Get overall statistics
export const getStatistics = async () => {
  const response = await api.get('/statistics')
  return response.data
}
