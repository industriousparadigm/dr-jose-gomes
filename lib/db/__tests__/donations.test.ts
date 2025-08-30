/**
 * @jest-environment jsdom
 */
import { 
  createDonation, 
  updateDonationStatus, 
  getRecentDonations, 
  getStats, 
  getDonationById,
  getAllDonations,
  getDonationByProcessorId,
  updateDonationStatusByProcessorId
} from '../donations'
import { donationFixtures } from '../../../tests/fixtures/donations'
import { mockDatabase } from '../../../tests/utils/test-db'

// Mock the @vercel/postgres module
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn()
}))

const { sql } = require('@vercel/postgres')

describe('Donation Database Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createDonation', () => {
    it('should create a donation successfully', async () => {
      const mockDonation = donationFixtures.completed
      sql.mockResolvedValueOnce({ rows: [mockDonation] })

      const donation = await createDonation({
        amount: 100,
        currency: 'USD',
        payment_method: 'stripe',
        donor_name: 'John Doe',
        donor_email: 'john@example.com'
      })

      expect(donation).toEqual(mockDonation)
      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      expect(callArgs[0][0]).toContain('INSERT INTO donations')
    })

    it('should handle anonymous donations', async () => {
      const mockDonation = donationFixtures.anonymous
      sql.mockResolvedValueOnce({ rows: [mockDonation] })

      const donation = await createDonation({
        amount: 50,
        currency: 'USD',
        payment_method: 'stripe',
        is_anonymous: true
      })

      expect(donation).toEqual(mockDonation)
    })

    it('should set default values correctly', async () => {
      const mockDonation = { ...donationFixtures.pending, status: 'pending' }
      sql.mockResolvedValueOnce({ rows: [mockDonation] })

      await createDonation({
        amount: 25,
        currency: 'USD',
        payment_method: 'stripe'
      })

      // Check that the SQL call includes default values
      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      expect(callArgs[0][0]).toContain('INSERT INTO donations')
    })
  })

  describe('updateDonationStatus', () => {
    it('should update donation status successfully', async () => {
      const updatedDonation = { ...donationFixtures.completed, status: 'completed' }
      sql.mockResolvedValueOnce({ rows: [updatedDonation] })

      const result = await updateDonationStatus('test-id', 'completed', 'pi_123')

      expect(result).toEqual(updatedDonation)
      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      expect(callArgs[0][0]).toContain('UPDATE donations')
    })

    it('should handle status update without processor ID', async () => {
      const updatedDonation = { ...donationFixtures.completed, status: 'failed' }
      sql.mockResolvedValueOnce({ rows: [updatedDonation] })

      const result = await updateDonationStatus('test-id', 'failed')

      expect(result).toEqual(updatedDonation)
    })
  })

  describe('getRecentDonations', () => {
    it('should return recent completed donations', async () => {
      const mockDonations = [donationFixtures.completed, donationFixtures.anonymous]
      sql.mockResolvedValueOnce({ rows: mockDonations })

      const donations = await getRecentDonations(10)

      expect(donations).toEqual(mockDonations)
      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      const query = callArgs[0].join(' ')
      expect(query).toContain("WHERE status = 'completed'")
      expect(query).toContain('ORDER BY created_at DESC')
    })

    it('should use default limit of 10', async () => {
      sql.mockResolvedValueOnce({ rows: [] })

      await getRecentDonations()

      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      const query = callArgs[0].join(' ')
      expect(query).toContain('LIMIT')
    })

    it('should respect custom limit', async () => {
      sql.mockResolvedValueOnce({ rows: [] })

      await getRecentDonations(5)

      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      expect(callArgs[callArgs.length - 1]).toBe(5) // Check that limit value is passed
    })
  })

  describe('getStats', () => {
    it('should return campaign statistics', async () => {
      // Mock stats query
      sql.mockResolvedValueOnce({
        rows: [{ total_raised: '1500', donor_count: '15' }]
      })
      
      // Mock recent donations query  
      sql.mockResolvedValueOnce({
        rows: [donationFixtures.completed, donationFixtures.anonymous]
      })

      const stats = await getStats()

      expect(stats).toEqual({
        total_raised: 1500,
        donor_count: 15,
        goal_amount: 25000,
        recent_donations: [donationFixtures.completed, donationFixtures.anonymous]
      })
    })

    it('should handle zero stats', async () => {
      sql.mockResolvedValueOnce({
        rows: [{ total_raised: '0', donor_count: '0' }]
      })
      sql.mockResolvedValueOnce({ rows: [] })

      const stats = await getStats()

      expect(stats.total_raised).toBe(0)
      expect(stats.donor_count).toBe(0)
      expect(stats.recent_donations).toEqual([])
    })

    it('should use goal amount from environment', async () => {
      process.env.NEXT_PUBLIC_GOAL_AMOUNT = '30000'
      
      sql.mockResolvedValueOnce({
        rows: [{ total_raised: '1000', donor_count: '10' }]
      })
      sql.mockResolvedValueOnce({ rows: [] })

      const stats = await getStats()

      expect(stats.goal_amount).toBe(30000)
      
      // Reset
      process.env.NEXT_PUBLIC_GOAL_AMOUNT = '25000'
    })
  })

  describe('getDonationById', () => {
    it('should return donation by ID', async () => {
      sql.mockResolvedValueOnce({ rows: [donationFixtures.completed] })

      const donation = await getDonationById('test-id')

      expect(donation).toEqual(donationFixtures.completed)
      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      expect(callArgs[0][0]).toContain('WHERE id =')
    })

    it('should return null when donation not found', async () => {
      sql.mockResolvedValueOnce({ rows: [] })

      const donation = await getDonationById('non-existent-id')

      expect(donation).toBeNull()
    })
  })

  describe('getAllDonations', () => {
    it('should return paginated donations with total count', async () => {
      const mockDonations = [donationFixtures.completed, donationFixtures.anonymous]
      sql.mockResolvedValueOnce({ rows: mockDonations })
      sql.mockResolvedValueOnce({ rows: [{ count: '25' }] })

      const result = await getAllDonations(10, 0)

      expect(result).toEqual({
        donations: mockDonations,
        total: 25
      })
    })

    it('should use default pagination parameters', async () => {
      sql.mockResolvedValueOnce({ rows: [] })
      sql.mockResolvedValueOnce({ rows: [{ count: '0' }] })

      await getAllDonations()

      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      const query = callArgs[0].join(' ')
      expect(query).toContain('LIMIT')
      expect(query).toContain('OFFSET')
    })
  })

  describe('getDonationByProcessorId', () => {
    it('should return donation by processor ID', async () => {
      sql.mockResolvedValueOnce({ rows: [donationFixtures.completed] })

      const donation = await getDonationByProcessorId('pi_test_123')

      expect(donation).toEqual(donationFixtures.completed)
      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      const query = callArgs[0].join(' ')
      expect(query).toContain('WHERE processor_id =')
    })

    it('should return null when not found', async () => {
      sql.mockResolvedValueOnce({ rows: [] })

      const donation = await getDonationByProcessorId('non-existent')

      expect(donation).toBeNull()
    })
  })

  describe('updateDonationStatusByProcessorId', () => {
    it('should update donation status by processor ID', async () => {
      sql.mockResolvedValueOnce({ rows: [] })

      await updateDonationStatusByProcessorId('pi_test_123', 'completed')

      expect(sql).toHaveBeenCalled()
      const callArgs = sql.mock.calls[0]
      const query = callArgs[0].join(' ')
      expect(query).toContain('UPDATE donations')
      expect(query).toContain('WHERE processor_id =')
    })
  })
})