#!/usr/bin/env tsx
import { sql } from '@vercel/postgres'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function setupDatabase() {
  console.log('🔧 Setting up database tables...')
  
  try {
    // Create donations table
    await sql`
      CREATE TABLE IF NOT EXISTS donations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        payment_method VARCHAR(50),
        processor_id VARCHAR(255) UNIQUE,
        donor_name VARCHAR(255),
        donor_email VARCHAR(255),
        donor_message TEXT,
        is_anonymous BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Created donations table')

    // Create campaign_stats table
    await sql`
      CREATE TABLE IF NOT EXISTS campaign_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        total_raised DECIMAL(10, 2) DEFAULT 0,
        goal_amount DECIMAL(10, 2) DEFAULT 25000,
        donor_count INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Created campaign_stats table')

    // Create updates table
    await sql`
      CREATE TABLE IF NOT EXISTS updates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) DEFAULT 'The Gomes Family',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Created updates table')

    // Create audit_log table
    await sql`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Created audit_log table')

    // Insert initial stats
    await sql`
      INSERT INTO campaign_stats (id, goal_amount) 
      VALUES (1, 25000) 
      ON CONFLICT (id) DO NOTHING
    `
    console.log('✅ Initialized campaign stats')

    console.log('\n🎉 Database setup complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()