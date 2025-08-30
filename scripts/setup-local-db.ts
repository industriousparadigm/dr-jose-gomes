#!/usr/bin/env tsx
import { Client } from 'pg'
import 'dotenv/config'

async function setupLocalDatabase() {
  console.log('🔧 Setting up local PostgreSQL database...')
  
  // Use a simple in-memory setup for testing without actual Postgres
  const mockDatabase = {
    donations: [],
    campaign_stats: { id: 1, total_raised: 0, goal_amount: 25000, donor_count: 0 },
    updates: [],
    audit_log: []
  }
  
  try {
    // Check if we have a real database connection
    if (process.env.POSTGRES_URL && !process.env.POSTGRES_URL.includes('localhost')) {
      // Production database - use Vercel's sql
      const { sql } = await import('@vercel/postgres')
      
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
    } else {
      // Local development - create mock data file
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const mockDataPath = path.join(process.cwd(), '.mock-db.json')
      await fs.writeFile(mockDataPath, JSON.stringify(mockDatabase, null, 2))
      
      console.log('✅ Created mock database for local development')
      console.log('📝 Mock data stored in .mock-db.json')
      console.log('\n⚠️  Note: Using mock database for local development.')
      console.log('   To use a real PostgreSQL database:')
      console.log('   1. Install PostgreSQL locally')
      console.log('   2. Create a database: createdb jose_gomes_fund')
      console.log('   3. Update .env.local with your connection string')
    }

    console.log('\n🎉 Database setup complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    console.log('\n💡 For local development, the app will use mock data.')
    console.log('   Copy .env.local.example to .env.local and update with your settings.')
    process.exit(1)
  }
}

setupLocalDatabase()