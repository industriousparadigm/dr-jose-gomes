import { sql } from '@vercel/postgres'
import { Update } from '@/types'

export async function createUpdate(update: Omit<Update, 'id' | 'created_at'>): Promise<Update> {
  const result = await sql<Update>`
    INSERT INTO updates (
      title_pt, title_en, content_pt, content_en,
      media_urls, author, is_pinned
    ) VALUES (
      ${update.title_pt}, ${update.title_en},
      ${update.content_pt}, ${update.content_en},
      ${update.media_urls || null}, ${update.author},
      ${update.is_pinned || false}
    )
    RETURNING *
  `
  
  return result.rows[0]
}

export async function getUpdates(limit: number = 10): Promise<Update[]> {
  const result = await sql<Update>`
    SELECT * FROM updates
    ORDER BY is_pinned DESC, created_at DESC
    LIMIT ${limit}
  `
  
  return result.rows
}

export async function getUpdateById(id: string): Promise<Update | null> {
  const result = await sql<Update>`
    SELECT * FROM updates
    WHERE id = ${id}
    LIMIT 1
  `
  
  return result.rows[0] || null
}

export async function deleteUpdate(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM updates
    WHERE id = ${id}
  `
  
  return result.rowCount > 0
}