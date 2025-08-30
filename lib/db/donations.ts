import { sql } from '@vercel/postgres'
import { Donation, Stats } from '@/types'

export async function createDonation(donation: Partial<Donation>): Promise<Donation> {
  const result = await sql<Donation>`
    INSERT INTO donations (
      amount, currency, payment_method, processor_id,
      donor_name, donor_email, donor_message,
      is_anonymous, is_message_public, status
    ) VALUES (
      ${donation.amount}, ${donation.currency}, ${donation.payment_method},
      ${donation.processor_id || null}, ${donation.donor_name || null},
      ${donation.donor_email || null}, ${donation.donor_message || null},
      ${donation.is_anonymous ?? true}, ${donation.is_message_public ?? false},
      ${donation.status || 'pending'}
    )
    RETURNING *
  `
  
  return result.rows[0]
}

export async function updateDonationStatus(
  id: string,
  status: Donation['status'],
  processorId?: string
): Promise<Donation> {
  const result = await sql<Donation>`
    UPDATE donations
    SET status = ${status},
        processor_id = COALESCE(${processorId}, processor_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  
  return result.rows[0]
}

export async function getRecentDonations(limit: number = 10): Promise<Donation[]> {
  const result = await sql<Donation>`
    SELECT * FROM donations
    WHERE status = 'completed'
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  
  return result.rows
}

export async function getStats(): Promise<Stats> {
  // Get total raised and donor count
  const statsResult = await sql`
    SELECT 
      COALESCE(SUM(
        CASE 
          WHEN currency = 'BRL' THEN amount / 5
          WHEN currency = 'EUR' THEN amount * 1.1
          ELSE amount
        END
      ), 0) as total_raised,
      COUNT(DISTINCT COALESCE(donor_email, id::text)) as donor_count
    FROM donations
    WHERE status = 'completed'
  `
  
  // Get recent donations
  const recentDonations = await getRecentDonations(5)
  
  return {
    total_raised: Number(statsResult.rows[0].total_raised),
    donor_count: Number(statsResult.rows[0].donor_count),
    goal_amount: Number(process.env.NEXT_PUBLIC_GOAL_AMOUNT || 25000),
    recent_donations: recentDonations
  }
}

export async function getDonationById(id: string): Promise<Donation | null> {
  const result = await sql<Donation>`
    SELECT * FROM donations
    WHERE id = ${id}
    LIMIT 1
  `
  
  return result.rows[0] || null
}

export async function getAllDonations(
  limit: number = 100,
  offset: number = 0
): Promise<{ donations: Donation[], total: number }> {
  const [donations, count] = await Promise.all([
    sql<Donation>`
      SELECT * FROM donations
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`SELECT COUNT(*) FROM donations`
  ])
  
  return {
    donations: donations.rows,
    total: Number(count.rows[0].count)
  }
}

export async function getDonationByProcessorId(processorId: string): Promise<Donation | null> {
  const result = await sql<Donation>`
    SELECT * FROM donations
    WHERE processor_id = ${processorId}
    LIMIT 1
  `
  
  return result.rows[0] || null
}

export async function updateDonationStatusByProcessorId(
  processorId: string, 
  status: Donation['status']
): Promise<void> {
  await sql`
    UPDATE donations
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE processor_id = ${processorId}
  `
}