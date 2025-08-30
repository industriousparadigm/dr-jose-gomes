/**
 * Email service mocks for testing
 */

// Mock Resend
export const mockResend = {
  emails: {
    send: jest.fn().mockResolvedValue({
      id: 'email_test_123',
      from: 'noreply@example.com',
      to: 'test@example.com',
      subject: 'Test Email',
      created_at: new Date().toISOString()
    })
  }
}

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => mockResend)
}))

// Mock Nodemailer
export const mockNodemailer = {
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test_message_123',
      accepted: ['test@example.com'],
      rejected: [],
      pending: [],
      response: '250 Message queued'
    })
  })
}

jest.mock('nodemailer', () => mockNodemailer)

// Mock email lib
jest.mock('@/lib/email', () => ({
  sendDonationConfirmation: jest.fn().mockResolvedValue(true),
  sendAdminNotification: jest.fn().mockResolvedValue(true)
}))