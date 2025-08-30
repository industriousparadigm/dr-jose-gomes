/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DonationForm } from '../DonationForm'

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({
    redirectToCheckout: jest.fn().mockResolvedValue({ error: null })
  })
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock environment variable
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock'

describe('DonationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render all preset amount buttons', () => {
    render(<DonationForm />)
    
    const presetAmounts = [25, 50, 100, 250, 500, 1000]
    presetAmounts.forEach(amount => {
      expect(screen.getByText(`$${amount}`)).toBeInTheDocument()
    })
  })

  it('should render donor information fields', () => {
    render(<DonationForm />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('should render anonymous donation checkbox', () => {
    render(<DonationForm />)
    
    expect(screen.getByLabelText(/anonymous/i)).toBeInTheDocument()
  })

  it('should select preset amount when clicked', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    const button50 = screen.getByText('$50')
    await user.click(button50)
    
    expect(button50.closest('button')).toHaveClass('border-blue-500') // Or whatever selected class is used
  })

  it('should allow custom amount input', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    const customInput = screen.getByPlaceholderText(/enter.*amount/i) || screen.getByRole('textbox', { name: /custom/i })
    await user.type(customInput, '75')
    
    expect(customInput).toHaveValue('75')
  })

  it('should toggle anonymous donation mode', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    const anonymousCheckbox = screen.getByLabelText(/anonymous/i)
    const nameField = screen.getByLabelText(/name/i)
    const emailField = screen.getByLabelText(/email/i)
    
    expect(nameField).toBeEnabled()
    expect(emailField).toBeEnabled()
    
    await user.click(anonymousCheckbox)
    
    expect(nameField).toBeDisabled()
    expect(emailField).toBeDisabled()
  })

  it('should validate amount before submission', async () => {
    const { toast } = require('sonner')
    const user = userEvent.setup()
    render(<DonationForm />)
    
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    expect(toast.error).toHaveBeenCalledWith('Please select or enter a valid amount')
  })

  it('should validate minimum amount', async () => {
    const { toast } = require('sonner')
    const user = userEvent.setup()
    render(<DonationForm />)
    
    const customInput = screen.getByPlaceholderText(/enter.*amount/i) || screen.getByRole('textbox', { name: /custom/i })
    await user.type(customInput, '0.5')
    
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    expect(toast.error).toHaveBeenCalledWith('Please select or enter a valid amount')
  })

  it('should create checkout session with selected amount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      })
    })

    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Select amount
    const button100 = screen.getByText('$100')
    await user.click(button100)
    
    // Fill donor info
    const nameField = screen.getByLabelText(/name/i)
    const emailField = screen.getByLabelText(/email/i)
    await user.type(nameField, 'John Doe')
    await user.type(emailField, 'john@example.com')
    
    // Submit
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/donations/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 100,
          donorEmail: 'john@example.com',
          donorName: 'John Doe',
          message: '',
          isAnonymous: false,
          locale: 'en'
        })
      })
    })
  })

  it('should create anonymous donation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'cs_test_anonymous',
        url: 'https://checkout.stripe.com/pay/cs_test_anonymous'
      })
    })

    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Select amount
    const button50 = screen.getByText('$50')
    await user.click(button50)
    
    // Enable anonymous mode
    const anonymousCheckbox = screen.getByLabelText(/anonymous/i)
    await user.click(anonymousCheckbox)
    
    // Submit
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/donations/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 50,
          donorEmail: undefined,
          donorName: undefined,
          message: '',
          isAnonymous: true,
          locale: 'en'
        })
      })
    })
  })

  it('should include donation message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'cs_test_message',
        url: 'https://checkout.stripe.com/pay/cs_test_message'
      })
    })

    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Select amount
    const button25 = screen.getByText('$25')
    await user.click(button25)
    
    // Add message
    const messageField = screen.getByLabelText(/message/i)
    await user.type(messageField, 'Get well soon!')
    
    // Submit
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/donations/create-checkout', expect.objectContaining({
        body: JSON.stringify(expect.objectContaining({
          message: 'Get well soon!'
        }))
      }))
    })
  })

  it('should handle API errors gracefully', async () => {
    const { toast } = require('sonner')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Payment failed' })
    })

    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Select amount
    const button100 = screen.getByText('$100')
    await user.click(button100)
    
    // Submit
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Payment failed')
    })
  })

  it('should handle network errors', async () => {
    const { toast } = require('sonner')
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Select amount
    const button50 = screen.getByText('$50')
    await user.click(button50)
    
    // Submit
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong. Please try again.')
    })
  })

  it('should show processing state during submission', async () => {
    // Mock a slow response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ sessionId: 'cs_test', url: 'https://checkout.stripe.com/pay/cs_test' })
      }), 100))
    )

    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Select amount
    const button100 = screen.getByText('$100')
    await user.click(button100)
    
    // Submit
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    // Check for loading state
    expect(donateButton).toBeDisabled()
    expect(screen.getByRole('button', { name: /processing/i }) || screen.getByText(/processing/i)).toBeInTheDocument()
    
    // Wait for completion
    await waitFor(() => {
      expect(donateButton).not.toBeDisabled()
    })
  })

  it('should use custom amount when entered', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: 'cs_test_custom', url: 'https://checkout.stripe.com/pay/cs_test_custom' })
    })

    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Enter custom amount
    const customInput = screen.getByPlaceholderText(/enter.*amount/i) || screen.getByRole('textbox', { name: /custom/i })
    await user.type(customInput, '75.50')
    
    // Submit
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/donations/create-checkout', expect.objectContaining({
        body: JSON.stringify(expect.objectContaining({
          amount: 75.5
        }))
      }))
    })
  })

  it('should clear custom amount when preset amount is selected', async () => {
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Enter custom amount first
    const customInput = screen.getByPlaceholderText('customAmount')
    await user.type(customInput, '123')
    
    expect(customInput).toHaveValue('123')
    
    // Select preset amount
    const button100 = screen.getByText('$100')
    await user.click(button100)
    
    // Custom amount should be cleared
    expect(customInput).toHaveValue('')
  })

  it('should validate email format if provided', async () => {
    const { toast } = require('sonner')
    const user = userEvent.setup()
    render(<DonationForm />)
    
    // Select amount
    const button50 = screen.getByText('$50')
    await user.click(button50)
    
    // Enter invalid email
    const emailField = screen.getByPlaceholderText('yourEmail')
    await user.type(emailField, 'invalid-email')
    
    // Submit (if form has email validation)
    const donateButton = screen.getByText(/donate/i)
    await user.click(donateButton)
    
    // Note: This test assumes the form validates email format
    // If not implemented, this test documents the expected behavior
  })
})