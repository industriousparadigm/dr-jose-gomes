import { sql } from '@vercel/postgres'

export interface Donation {
  id: string
  amount: number
  currency: string
  donor_name?: string
  donor_email?: string
  message?: string
  is_anonymous: boolean
  is_public: boolean
  status: string
  created_at: string
  processor_id?: string
}

export async function getDonations(limit?: number): Promise<Donation[]> {
  try {
    const query = limit 
      ? sql`SELECT * FROM donations ORDER BY created_at DESC LIMIT ${limit}`
      : sql`SELECT * FROM donations ORDER BY created_at DESC`
    
    const result = await query
    return result.rows as Donation[]
  } catch (error) {
    console.error('Error fetching donations:', error)
    return []
  }
}

export async function getPublicDonations(limit: number = 10): Promise<Donation[]> {
  try {
    const result = await sql`
      SELECT 
        id,
        amount,
        currency,
        CASE 
          WHEN is_anonymous THEN NULL 
          ELSE donor_name 
        END as donor_name,
        CASE 
          WHEN is_public THEN message 
          ELSE NULL 
        END as message,
        created_at
      FROM donations 
      WHERE status = 'completed'
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `
    return result.rows as Donation[]
  } catch (error) {
    console.error('Error fetching public donations:', error)
    return []
  }
}