/**
 * Test database utilities for setting up and tearing down test data
 */
import { sql } from '@vercel/postgres'

export async function setupTestDatabase() {
  // Create test tables if they don't exist
  await sql`
    CREATE TABLE IF NOT EXISTS donations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'BRL', 'EUR')),
      payment_method VARCHAR(50) NOT NULL,
      processor_id VARCHAR(255),
      donor_name VARCHAR(255),
      donor_email VARCHAR(255),
      donor_message TEXT,
      is_anonymous BOOLEAN DEFAULT true,
      is_message_public BOOLEAN DEFAULT false,
      ip_country VARCHAR(2),
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS updates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title_pt TEXT NOT NULL,
      title_en TEXT NOT NULL,
      content_pt TEXT NOT NULL,
      content_en TEXT NOT NULL,
      media_urls TEXT[],
      author VARCHAR(255) NOT NULL,
      is_pinned BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type VARCHAR(100) NOT NULL,
      event_data JSONB NOT NULL,
      hash VARCHAR(64),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC)`
}

export async function cleanupTestDatabase() {
  // Clean up test data
  await sql`DELETE FROM donations WHERE processor_id LIKE 'test_%'`
  await sql`DELETE FROM updates WHERE author = 'test-author'`
  await sql`DELETE FROM audit_logs WHERE event_type LIKE 'test_%'`
}

export async function seedTestDonations() {
  const testDonations = [
    {
      amount: 100,
      currency: 'USD',
      payment_method: 'stripe',
      processor_id: 'test_donation_1',
      donor_name: 'John Doe',
      donor_email: 'john@example.com',
      donor_message: 'Hope this helps!',
      is_anonymous: false,
      is_message_public: true,
      status: 'completed'
    },
    {
      amount: 50,
      currency: 'USD',
      payment_method: 'stripe',
      processor_id: 'test_donation_2',
      donor_name: null,
      donor_email: null,
      donor_message: null,
      is_anonymous: true,
      is_message_public: false,
      status: 'completed'
    },
    {
      amount: 25,
      currency: 'USD',
      payment_method: 'stripe',
      processor_id: 'test_donation_3',
      status: 'pending'
    }
  ]

  for (const donation of testDonations) {
    await sql`
      INSERT INTO donations (
        amount, currency, payment_method, processor_id,
        donor_name, donor_email, donor_message,
        is_anonymous, is_message_public, status
      ) VALUES (
        ${donation.amount}, ${donation.currency}, ${donation.payment_method},
        ${donation.processor_id}, ${donation.donor_name || null},
        ${donation.donor_email || null}, ${donation.donor_message || null},
        ${donation.is_anonymous ?? true}, ${donation.is_message_public ?? false},
        ${donation.status || 'pending'}
      )
    `
  }
}

// Mock database for unit tests that don't need real DB
export const mockDatabase = {
  donations: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      amount: 100,
      currency: 'USD',
      payment_method: 'stripe',
      processor_id: 'pi_test_123',
      donor_name: 'John Doe',
      donor_email: 'john@example.com',
      donor_message: 'Great cause!',
      is_anonymous: false,
      is_message_public: true,
      ip_country: 'US',
      status: 'completed' as const,
      created_at: new Date('2024-01-01T00:00:00Z'),
      updated_at: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      amount: 50,
      currency: 'USD',
      payment_method: 'stripe',
      processor_id: 'pi_test_456',
      donor_name: null,
      donor_email: null,
      donor_message: null,
      is_anonymous: true,
      is_message_public: false,
      ip_country: 'CA',
      status: 'completed' as const,
      created_at: new Date('2024-01-02T00:00:00Z'),
      updated_at: new Date('2024-01-02T00:00:00Z')
    }
  ],
  stats: {
    total_raised: 150,
    donor_count: 2,
    goal_amount: 25000,
    recent_donations: []
  }
}