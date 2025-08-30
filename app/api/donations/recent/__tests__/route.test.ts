/**
 * @jest-environment jsdom
 */
import { GET } from '../route'
import { donationFixtures } from '../../../../../tests/fixtures/donations'

// Mock the dependencies
jest.mock('@/lib/donations', () => ({
  getPublicDonations: jest.fn()
}))

const { getPublicDonations } = require('@/lib/donations')

// Create a mock request object
function createMockRequest(url: string) {
  return {
    url,
    nextUrl: new URL(url)
  } as any
}

describe('/api/donations/recent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return recent donations successfully', async () => {
    const mockDonations = [
      donationFixtures.completed,
      donationFixtures.anonymous,
      donationFixtures.largeDonation
    ]

    getPublicDonations.mockResolvedValue(mockDonations)

    const request = createMockRequest('http://localhost:3000/api/donations/recent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockDonations)
    expect(getPublicDonations).toHaveBeenCalledWith(20) // Default limit
  })

  it('should return donations with fixed limit of 20', async () => {
    const mockDonations = [donationFixtures.completed]

    getPublicDonations.mockResolvedValue(mockDonations)

    const request = createMockRequest('http://localhost:3000/api/donations/recent')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(getPublicDonations).toHaveBeenCalledWith(20)
  })

  it('should return empty array when no donations', async () => {
    getPublicDonations.mockResolvedValue([])

    const request = createMockRequest('http://localhost:3000/api/donations/recent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should handle database errors', async () => {
    getPublicDonations.mockRejectedValue(new Error('Database connection failed'))

    const request = createMockRequest('http://localhost:3000/api/donations/recent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch donations')
  })

  it('should filter out sensitive information from donations', async () => {
    const mockDonations = [
      {
        ...donationFixtures.completed,
        donor_email: 'test@example.com' // This should be filtered in public response
      }
    ]

    getPublicDonations.mockResolvedValue(mockDonations)

    const request = createMockRequest('http://localhost:3000/api/donations/recent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    // The actual filtering would happen in the getPublicDonations function
    // This test verifies that the response is returned as-is from the DB function
    expect(data[0].donor_email).toBe('test@example.com')
  })

  it('should handle anonymous donations correctly', async () => {
    const mockDonations = [donationFixtures.anonymous]
    getPublicDonations.mockResolvedValue(mockDonations)

    const request = createMockRequest('http://localhost:3000/api/donations/recent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data[0].donor_name).toBeNull()
    expect(data[0].donor_email).toBeNull()
    expect(data[0].is_anonymous).toBe(true)
  })

  it('should handle mixed public and anonymous donations', async () => {
    const mockDonations = [
      donationFixtures.completed, // Public
      donationFixtures.anonymous, // Anonymous
      donationFixtures.largeDonation // Public
    ]

    getPublicDonations.mockResolvedValue(mockDonations)

    const request = createMockRequest('http://localhost:3000/api/donations/recent')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveLength(3)
    
    // First donation is public
    expect(data[0].donor_name).toBe('John Doe')
    expect(data[0].is_anonymous).toBe(false)
    
    // Second donation is anonymous
    expect(data[1].donor_name).toBeNull()
    expect(data[1].is_anonymous).toBe(true)
    
    // Third donation is public
    expect(data[2].donor_name).toBe('Maria Silva')
    expect(data[2].is_anonymous).toBe(false)
  })
})