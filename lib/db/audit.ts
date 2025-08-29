import { sql } from '@vercel/postgres'
import crypto from 'crypto'

interface AuditLog {
  id: string
  event_type: string
  event_data: any
  hash: string
  created_at: Date
}

let lastHash = ''

export async function createAuditLog(
  eventType: string,
  eventData: any
): Promise<AuditLog> {
  // Create hash chain for tamper detection
  const dataString = JSON.stringify({ eventType, eventData, timestamp: new Date().toISOString() })
  const hash = crypto
    .createHash('sha256')
    .update(lastHash + dataString)
    .digest('hex')
  
  const result = await sql<AuditLog>`
    INSERT INTO audit_logs (event_type, event_data, hash)
    VALUES (${eventType}, ${JSON.stringify(eventData)}, ${hash})
    RETURNING *
  `
  
  lastHash = hash
  return result.rows[0]
}

export async function getAuditLogs(
  limit: number = 100,
  eventType?: string
): Promise<AuditLog[]> {
  if (eventType) {
    const result = await sql<AuditLog>`
      SELECT * FROM audit_logs
      WHERE event_type = ${eventType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result.rows
  }
  
  const result = await sql<AuditLog>`
    SELECT * FROM audit_logs
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  
  return result.rows
}

// Log critical events
export async function logDonationEvent(
  type: 'initiated' | 'completed' | 'failed' | 'refunded',
  donationData: any
) {
  return createAuditLog(`donation_${type}`, donationData)
}

export async function logAdminAction(
  action: string,
  data: any
) {
  return createAuditLog(`admin_${action}`, data)
}