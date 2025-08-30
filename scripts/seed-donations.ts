import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'

const mockDonors = [
  { name: 'Maria Silva', email: 'maria@example.com', message: 'Wishing Dr. José a speedy recovery. He treated my father with such care.' },
  { name: 'João Santos', email: 'joao@example.com', message: 'Dr. José is an incredible doctor. Praying for his recovery.' },
  { name: 'Ana Costa', email: 'ana@example.com', message: 'Forever grateful for Dr. José\'s care. Sending strength to the family.' },
  { name: 'Pedro Oliveira', email: 'pedro@example.com', message: 'Dr. José saved my life. Now it\'s our turn to help him.' },
  { name: 'Carla Rodrigues', email: 'carla@example.com', message: 'A wonderful doctor and person. Get well soon!' },
  { name: 'Anonymous', email: 'anon1@example.com', message: 'God bless Dr. José and his family during this difficult time.' },
  { name: 'Paulo Ferreira', email: 'paulo@example.com', message: 'Dr. José treated me for years. Happy to give back.' },
  { name: 'Lucia Almeida', email: 'lucia@example.com', message: 'Sending prayers and support to the Gomes family.' },
  { name: 'Anonymous', email: 'anon2@example.com', message: 'A small contribution for a great man.' },
  { name: 'Roberto Lima', email: 'roberto@example.com', message: 'Dr. José is a hero. Wishing him all the best.' },
  { name: 'Patricia Sousa', email: 'patricia@example.com', message: 'Thank you for everything, Dr. José. Stay strong!' },
  { name: 'Fernando Martins', email: 'fernando@example.com', message: 'Dr. José helped my family so much. We\'re here for him now.' },
  { name: 'Anonymous', email: 'anon3@example.com', message: 'Praying for a full recovery.' },
  { name: 'Isabel Pereira', email: 'isabel@example.com', message: 'Dr. José is an inspiration. Sending love and support.' },
  { name: 'Carlos Mendes', email: 'carlos@example.com', message: 'Get well soon, Dr. José! We need more doctors like you.' },
  { name: 'Teresa Barbosa', email: 'teresa@example.com', message: 'Dr. José treated my mother with such kindness. Forever grateful.' },
  { name: 'André Nunes', email: 'andre@example.com', message: 'Wishing strength and healing to Dr. José.' },
  { name: 'Anonymous', email: 'anon4@example.com', message: 'May God grant Dr. José a complete recovery.' },
  { name: 'Marta Pinto', email: 'marta@example.com', message: 'Dr. José is a blessing to our community. Stay strong!' },
  { name: 'Ricardo Dias', email: 'ricardo@example.com', message: 'Happy to support Dr. José in his time of need.' }
]

const amounts = [25, 50, 100, 150, 200, 250, 300, 500, 750, 1000]

async function seedDonations() {
  console.log('Starting to seed donations...')
  
  try {
    // First, ensure the table exists
    await sql`
      CREATE TABLE IF NOT EXISTS donations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        donor_name VARCHAR(255),
        donor_email VARCHAR(255),
        message TEXT,
        is_anonymous BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        status VARCHAR(50) DEFAULT 'pending',
        processor_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add mock donations
    let totalAdded = 0
    const now = new Date()
    
    for (let i = 0; i < mockDonors.length; i++) {
      const donor = mockDonors[i]
      const amount = amounts[Math.floor(Math.random() * amounts.length)]
      const isAnonymous = donor.name === 'Anonymous'
      const daysAgo = Math.floor(Math.random() * 30) // Random date within last 30 days
      const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      
      await sql`
        INSERT INTO donations (
          id,
          amount,
          currency,
          donor_name,
          donor_email,
          message,
          is_anonymous,
          is_public,
          status,
          processor_id,
          created_at,
          updated_at
        ) VALUES (
          ${uuidv4()},
          ${amount},
          'USD',
          ${isAnonymous ? null : donor.name},
          ${donor.email},
          ${donor.message},
          ${isAnonymous},
          ${true},
          'completed',
          ${`pi_mock_${uuidv4().substring(0, 8)}`},
          ${createdAt.toISOString()},
          ${createdAt.toISOString()}
        )
      `
      
      totalAdded++
      console.log(`Added donation ${totalAdded}: ${isAnonymous ? 'Anonymous' : donor.name} - $${amount}`)
    }
    
    // Update the stats
    const statsResult = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) as total_raised,
        COUNT(DISTINCT CASE WHEN donor_email IS NOT NULL THEN donor_email ELSE id::text END) as donor_count
      FROM donations
      WHERE status = 'completed'
    `
    
    const { total_raised, donor_count } = statsResult.rows[0]
    
    // Check if stats table exists and update or insert
    await sql`
      CREATE TABLE IF NOT EXISTS campaign_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        total_raised DECIMAL(10, 2) DEFAULT 0,
        goal_amount DECIMAL(10, 2) DEFAULT 25000,
        donor_count INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await sql`
      INSERT INTO campaign_stats (id, total_raised, donor_count, updated_at)
      VALUES (1, ${total_raised}, ${donor_count}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        total_raised = ${total_raised},
        donor_count = ${donor_count},
        updated_at = CURRENT_TIMESTAMP
    `
    
    console.log(`\n✅ Successfully added ${totalAdded} mock donations`)
    console.log(`📊 Campaign stats: $${total_raised} raised from ${donor_count} donors`)
    
  } catch (error) {
    console.error('Error seeding donations:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDonations().then(() => {
  console.log('Seeding completed!')
  process.exit(0)
})