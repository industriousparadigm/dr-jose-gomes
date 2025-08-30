/**
 * Test fixtures for donations
 */
import { Donation } from '@/types'

export const donationFixtures = {
  completed: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    amount: 100,
    currency: 'USD' as const,
    payment_method: 'stripe',
    processor_id: 'pi_test_123',
    donor_name: 'John Doe',
    donor_email: 'john@example.com',
    donor_message: 'Hope this helps with the treatment!',
    is_anonymous: false,
    is_message_public: true,
    ip_country: 'US',
    status: 'completed' as const,
    created_at: new Date('2024-01-01T10:00:00Z'),
    updated_at: new Date('2024-01-01T10:00:00Z')
  },

  anonymous: {
    id: '550e8400-e29b-41d4-a716-446655440002',
    amount: 50,
    currency: 'USD' as const,
    payment_method: 'stripe',
    processor_id: 'pi_test_456',
    donor_name: null,
    donor_email: null,
    donor_message: null,
    is_anonymous: true,
    is_message_public: false,
    ip_country: 'CA',
    status: 'completed' as const,
    created_at: new Date('2024-01-02T14:30:00Z'),
    updated_at: new Date('2024-01-02T14:30:00Z')
  },

  pending: {
    id: '550e8400-e29b-41d4-a716-446655440003',
    amount: 25,
    currency: 'USD' as const,
    payment_method: 'stripe',
    processor_id: 'pi_test_789',
    donor_name: 'Jane Smith',
    donor_email: 'jane@example.com',
    donor_message: 'Praying for recovery',
    is_anonymous: false,
    is_message_public: true,
    ip_country: 'GB',
    status: 'pending' as const,
    created_at: new Date('2024-01-03T09:15:00Z'),
    updated_at: new Date('2024-01-03T09:15:00Z')
  },

  failed: {
    id: '550e8400-e29b-41d4-a716-446655440004',
    amount: 75,
    currency: 'USD' as const,
    payment_method: 'stripe',
    processor_id: 'pi_test_failed',
    donor_name: 'Bob Wilson',
    donor_email: 'bob@example.com',
    donor_message: 'Get well soon!',
    is_anonymous: false,
    is_message_public: true,
    ip_country: 'AU',
    status: 'failed' as const,
    created_at: new Date('2024-01-04T16:45:00Z'),
    updated_at: new Date('2024-01-04T16:45:00Z')
  },

  largeDonation: {
    id: '550e8400-e29b-41d4-a716-446655440005',
    amount: 1000,
    currency: 'USD' as const,
    payment_method: 'stripe',
    processor_id: 'pi_test_large',
    donor_name: 'Maria Silva',
    donor_email: 'maria@example.com',
    donor_message: 'Wishing you strength and healing. Stay strong, Dr. Gomes!',
    is_anonymous: false,
    is_message_public: true,
    ip_country: 'BR',
    status: 'completed' as const,
    created_at: new Date('2024-01-05T11:20:00Z'),
    updated_at: new Date('2024-01-05T11:20:00Z')
  },

  internationalDonation: {
    id: '550e8400-e29b-41d4-a716-446655440006',
    amount: 85,
    currency: 'EUR' as const,
    payment_method: 'stripe',
    processor_id: 'pi_test_eur',
    donor_name: 'Jean Dupont',
    donor_email: 'jean@example.fr',
    donor_message: 'Bon courage!',
    is_anonymous: false,
    is_message_public: true,
    ip_country: 'FR',
    status: 'completed' as const,
    created_at: new Date('2024-01-06T13:30:00Z'),
    updated_at: new Date('2024-01-06T13:30:00Z')
  }
} as const

export const createDonationFixture = (overrides: Partial<Donation> = {}): Donation => ({
  ...donationFixtures.completed,
  ...overrides
})

export const createMultipleDonations = (count: number): Donation[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...donationFixtures.completed,
    id: `550e8400-e29b-41d4-a716-44665544${String(index).padStart(4, '0')}`,
    amount: Math.floor(Math.random() * 500) + 10,
    donor_name: `Donor ${index + 1}`,
    donor_email: `donor${index + 1}@example.com`,
    processor_id: `pi_test_${index + 1}`,
    created_at: new Date(Date.now() - index * 60000) // Each donation 1 minute apart
  }))
}