import { sql } from '@vercel/postgres'

export { sql }

// Helper function for safe database queries
export async function query<T = any>(
  queryText: string,
  values?: any[]
): Promise<T[]> {
  try {
    const result = await sql.query(queryText, values)
    return result.rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}