import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HeroSection from '../components/HeroSection.jsx'
import UrlTable from '../components/UrlTable.jsx'
import AnalyticsModal from '../components/AnalyticsModal.jsx'
import StatisticsSection from '../components/StatisticsSection.jsx'

// ─── HeroSection Tests ────────────────────────────────────────────────────────
describe('HeroSection', () => {
  it('renders heading and input', () => {
    render(<HeroSection onShorten={vi.fn()} loading={false} />)
    expect(screen.getByText('Simplify your URL')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your original URL/i)).toBeInTheDocument()
    expect(screen.getByText('Shorten URL')).toBeInTheDocument()
  })

  it('shows validation error when submitting empty input', async () => {
    render(<HeroSection onShorten={vi.fn()} loading={false} />)
    fireEvent.click(screen.getByText('Shorten URL'))
    await waitFor(() =>
      expect(screen.getByText(/Please enter a URL/i)).toBeInTheDocument()
    )
  })

  it('shows validation error for invalid URL', async () => {
    render(<HeroSection onShorten={vi.fn()} loading={false} />)
    const input = screen.getByPlaceholderText(/Enter your original URL/i)
    await userEvent.type(input, 'not-a-url')
    fireEvent.click(screen.getByText('Shorten URL'))
    await waitFor(() =>
      expect(screen.getByText(/valid URL/i)).toBeInTheDocument()
    )
  })

  it('calls onShorten with valid URL', async () => {
    const mockShorten = vi.fn()
    render(<HeroSection onShorten={mockShorten} loading={false} />)
    const input = screen.getByPlaceholderText(/Enter your original URL/i)
    await userEvent.type(input, 'https://www.google.com')
    fireEvent.click(screen.getByText('Shorten URL'))
    await waitFor(() => expect(mockShorten).toHaveBeenCalledWith('https://www.google.com'))
  })

  it('disables button when loading', () => {
    render(<HeroSection onShorten={vi.fn()} loading={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

// ─── UrlTable Tests ───────────────────────────────────────────────────────────
describe('UrlTable', () => {
  const mockUrls = [
    {
      id: 1,
      originalUrl: 'https://www.google.com',
      shortUrl: 'http://localhost:8080/abc123',
      shortCode: 'abc123',
      createdAt: '2024-03-07T10:00:00',
      clickCount: 5,
    },
    {
      id: 2,
      originalUrl: 'https://www.github.com',
      shortUrl: 'http://localhost:8080/xyz789',
      shortCode: 'xyz789',
      createdAt: '2024-02-28T08:00:00',
      clickCount: 12,
    },
  ]

  const defaultPagination = { page: 0, totalPages: 1 }

  it('renders table headers', () => {
    render(
      <UrlTable
        data={mockUrls}
        pagination={defaultPagination}
        onPageChange={vi.fn()}
        onAnalytics={vi.fn()}
        onCopy={vi.fn()}
      />
    )
    expect(screen.getByText('Original URL')).toBeInTheDocument()
    expect(screen.getByText('Short URL')).toBeInTheDocument()
    expect(screen.getByText('Clicks')).toBeInTheDocument()
  })

  it('renders URL rows', () => {
    render(
      <UrlTable
        data={mockUrls}
        pagination={defaultPagination}
        onPageChange={vi.fn()}
        onAnalytics={vi.fn()}
        onCopy={vi.fn()}
      />
    )
    expect(screen.getByText(/google\.com/i)).toBeInTheDocument()
    expect(screen.getByText(/github\.com/i)).toBeInTheDocument()
  })

  it('shows empty state when no URLs', () => {
    render(
      <UrlTable
        data={[]}
        pagination={defaultPagination}
        onPageChange={vi.fn()}
        onAnalytics={vi.fn()}
        onCopy={vi.fn()}
      />
    )
    expect(screen.getByText(/No URLs yet/i)).toBeInTheDocument()
  })

  it('calls onAnalytics when Analytics button clicked', async () => {
    const mockAnalytics = vi.fn()
    render(
      <UrlTable
        data={mockUrls}
        pagination={defaultPagination}
        onPageChange={vi.fn()}
        onAnalytics={mockAnalytics}
        onCopy={vi.fn()}
      />
    )
    const buttons = screen.getAllByText('Analytics')
    await userEvent.click(buttons[0])
    expect(mockAnalytics).toHaveBeenCalledWith(1)
  })

  it('shows pagination when multiple pages', () => {
    render(
      <UrlTable
        data={mockUrls}
        pagination={{ page: 0, totalPages: 3 }}
        onPageChange={vi.fn()}
        onAnalytics={vi.fn()}
        onCopy={vi.fn()}
      />
    )
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })
})

// ─── AnalyticsModal Tests ─────────────────────────────────────────────────────
describe('AnalyticsModal', () => {
  const mockAnalytics = {
    id: 1,
    originalUrl: 'https://www.google.com',
    shortUrl: 'http://localhost:8080/abc123',
    shortCode: 'abc123',
    createdAt: '2024-03-07T10:00:00',
    lastAccessedAt: '2024-03-10T12:00:00',
    totalClicks: 42,
    clicksByDate: [
      { date: 'Mar 07', clicks: 10 },
      { date: 'Mar 08', clicks: 15 },
      { date: 'Mar 09', clicks: 17 },
    ],
  }

  it('renders analytics data', () => {
    render(<AnalyticsModal analytics={mockAnalytics} onClose={vi.fn()} />)
    expect(screen.getByText('URL Analytics')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('Total Clicks')).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const mockClose = vi.fn()
    render(<AnalyticsModal analytics={mockAnalytics} onClose={mockClose} />)
    await userEvent.click(screen.getByText('✕'))
    expect(mockClose).toHaveBeenCalled()
  })

  it('calls onClose when overlay clicked', async () => {
    const mockClose = vi.fn()
    render(<AnalyticsModal analytics={mockAnalytics} onClose={mockClose} />)
    const overlay = document.querySelector('[class*="overlay"]')
    await userEvent.click(overlay)
    expect(mockClose).toHaveBeenCalled()
  })

  it('renders null when analytics is null', () => {
    const { container } = render(<AnalyticsModal analytics={null} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })
})

// ─── StatisticsSection Tests ──────────────────────────────────────────────────
describe('StatisticsSection', () => {
  const mockStats = {
    totalUrls: 10,
    totalClicks: 253,
    clicksByDate: [
      { date: '2024-03-07', clicks: 12 },
      { date: '2024-03-08', clicks: 8 },
    ],
    creationsByDate: [
      { date: '2024-03-07', creations: 2 },
    ],
  }

  it('renders total stats', () => {
    render(<StatisticsSection stats={mockStats} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('253')).toBeInTheDocument()
    expect(screen.getByText('Total URLs')).toBeInTheDocument()
    expect(screen.getByText('Total Clicks')).toBeInTheDocument()
  })

  it('renders chart title', () => {
    render(<StatisticsSection stats={mockStats} />)
    expect(screen.getByText(/Recent Statistics/i)).toBeInTheDocument()
  })

  it('renders nothing when stats is null', () => {
    const { container } = render(<StatisticsSection stats={null} />)
    expect(container.firstChild).toBeNull()
  })
})
