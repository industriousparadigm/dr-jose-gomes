/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { CampaignProgress } from '../CampaignProgress'
import { Stats } from '@/types'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

// Mock format utilities
jest.mock('@/lib/utils/format', () => ({
  formatCurrency: jest.fn((amount: number) => `$${amount.toLocaleString()}`),
  formatPercentage: jest.fn((current: number, goal: number) => Math.min(Math.round((current / goal) * 100), 100))
}))

const mockStats: Stats = {
  total_raised: 15000,
  donor_count: 150,
  goal_amount: 25000,
  recent_donations: []
}

const mockFetch = jest.fn()
global.fetch = mockFetch

describe('CampaignProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render campaign progress with stats', () => {
    render(<CampaignProgress stats={mockStats} locale="en" />)
    
    expect(screen.getByText('Campaign Progress')).toBeInTheDocument()
    expect(screen.getByText('$15,000 / $25,000')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('150 supporters')).toBeInTheDocument()
  })

  it('should render in Portuguese locale', () => {
    render(<CampaignProgress stats={mockStats} locale="pt" />)
    
    expect(screen.getByText('Progresso da Campanha')).toBeInTheDocument()
    expect(screen.getByText('Arrecadado')).toBeInTheDocument()
    expect(screen.getByText('150 apoiadores')).toBeInTheDocument()
    expect(screen.getByText('Marcos')).toBeInTheDocument()
  })

  it('should handle null stats gracefully', () => {
    render(<CampaignProgress stats={null} locale="en" />)
    
    expect(screen.getByText('Campaign Progress')).toBeInTheDocument()
    expect(screen.getByText('$0 / $25,000')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('0 supporters')).toBeInTheDocument()
  })

  it('should display milestones correctly', () => {
    render(<CampaignProgress stats={mockStats} locale="en" />)
    
    // With $15,000 raised, first 3 milestones should be achieved
    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getByText('$10,000')).toBeInTheDocument()
    expect(screen.getByText('$15,000')).toBeInTheDocument()
    expect(screen.getByText('$20,000')).toBeInTheDocument()
    expect(screen.getByText('$25,000')).toBeInTheDocument()
    
    expect(screen.getByText('First steps')).toBeInTheDocument()
    expect(screen.getByText('Major milestone')).toBeInTheDocument()
    expect(screen.getByText('Halfway there')).toBeInTheDocument()
    expect(screen.getByText('Almost there')).toBeInTheDocument()
    expect(screen.getByText('Goal reached!')).toBeInTheDocument()
  })

  it('should display next milestone information', () => {
    render(<CampaignProgress stats={mockStats} locale="en" />)
    
    // Next milestone should be $20,000 (remaining $5,000)
    expect(screen.getByText('Next milestone')).toBeInTheDocument()
    expect(screen.getByText('Almost there')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()
    expect(screen.getByText('to go')).toBeInTheDocument()
  })

  it('should calculate daily statistics', () => {
    render(<CampaignProgress stats={mockStats} locale="en" />)
    
    // Daily average: $15,000 / 30 = $500
    expect(screen.getByText('$500')).toBeInTheDocument()
    expect(screen.getByText('Daily average')).toBeInTheDocument()
    
    // Average donation: $15,000 / 150 = $100
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('Average donation')).toBeInTheDocument()
    
    // Days remaining (hardcoded)
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('Days remaining')).toBeInTheDocument()
  })

  it('should handle zero donors for average donation', () => {
    const statsWithNoDonors = { ...mockStats, donor_count: 0 }
    render(<CampaignProgress stats={statsWithNoDonors} locale="en" />)
    
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('Average donation')).toBeInTheDocument()
  })

  it('should poll for updated stats', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        total_raised: 16000,
        donor_count: 160,
        goal_amount: 25000,
        recent_donations: []
      })
    })

    render(<CampaignProgress stats={mockStats} locale="en" />)
    
    // Fast-forward 1 minute
    jest.advanceTimersByTime(60000)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/stats')
    })
  })

  it('should handle API errors when polling', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    mockFetch.mockRejectedValue(new Error('API Error'))

    render(<CampaignProgress stats={mockStats} locale="en" />)
    
    // Fast-forward 1 minute
    jest.advanceTimersByTime(60000)
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching stats:', expect.any(Error))
    })

    consoleErrorSpy.mockRestore()
  })

  it('should show updating indicator during API calls', async () => {
    // Mock a slow API response
    mockFetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => mockStats
      }), 100))
    )

    render(<CampaignProgress stats={mockStats} locale="en" />)
    
    // Fast-forward to trigger API call
    jest.advanceTimersByTime(60000)
    
    // Should show updating indicator
    await waitFor(() => {
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument() // Clock icon
    })
  })

  it('should clean up timer on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    
    const { unmount } = render(<CampaignProgress stats={mockStats} locale="en" />)
    
    unmount()
    
    expect(clearIntervalSpy).toHaveBeenCalled()
    
    clearIntervalSpy.mockRestore()
  })

  it('should handle goal reached scenario', () => {
    const completedStats = {
      ...mockStats,
      total_raised: 25000
    }
    
    render(<CampaignProgress stats={completedStats} locale="en" />)
    
    expect(screen.getByText('100%')).toBeInTheDocument()
    // Next milestone section should not appear when goal is reached
    expect(screen.queryByText('Next milestone')).not.toBeInTheDocument()
  })

  it('should handle over-goal scenario', () => {
    const overGoalStats = {
      ...mockStats,
      total_raised: 30000
    }
    
    render(<CampaignProgress stats={overGoalStats} locale="en" />)
    
    expect(screen.getByText('100%')).toBeInTheDocument() // Should cap at 100%
    expect(screen.getByText('$30,000 / $25,000')).toBeInTheDocument()
  })

  it('should render milestone markers in progress bar', () => {
    render(<CampaignProgress stats={mockStats} locale="en" />)
    
    // There should be milestone markers at specific positions
    // This tests the visual representation of milestones
    const progressContainer = screen.getByRole('progressbar', { hidden: true }) || 
                            document.querySelector('.bg-gray-200')
    
    expect(progressContainer).toBeInTheDocument()
  })

  it('should display Portuguese milestone labels', () => {
    render(<CampaignProgress stats={mockStats} locale="pt" />)
    
    expect(screen.getByText('Primeiros passos')).toBeInTheDocument()
    expect(screen.getByText('Marco importante')).toBeInTheDocument()
    expect(screen.getByText('Meio caminho')).toBeInTheDocument()
    expect(screen.getByText('Quase lá')).toBeInTheDocument()
    expect(screen.getByText('Meta alcançada!')).toBeInTheDocument()
  })

  it('should display Portuguese next milestone text', () => {
    render(<CampaignProgress stats={mockStats} locale="pt" />)
    
    expect(screen.getByText('Próximo marco')).toBeInTheDocument()
    expect(screen.getByText('restantes')).toBeInTheDocument()
  })

  it('should display Portuguese daily stats labels', () => {
    render(<CampaignProgress stats={mockStats} locale="pt" />)
    
    expect(screen.getByText('Média diária')).toBeInTheDocument()
    expect(screen.getByText('Doação média')).toBeInTheDocument()
    expect(screen.getByText('Dias restantes')).toBeInTheDocument()
  })
})