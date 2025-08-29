import { sql } from '@vercel/postgres'
import fs from 'fs'
import path from 'path'

export async function initializeDatabase() {
  try {
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    
    // Execute schema
    await sql.query(schema)
    
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Database initialization error:', error)
    return false
  }
}

// Function to check if tables exist
export async function checkDatabaseConnection() {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('donations', 'updates', 'audit_logs', 'analytics_events')
    `
    
    return result.rows.length === 4
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}