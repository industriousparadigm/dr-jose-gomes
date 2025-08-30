-- Create donations table
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
);

-- Create campaign_stats table
CREATE TABLE IF NOT EXISTS campaign_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_raised DECIMAL(10, 2) DEFAULT 0,
  goal_amount DECIMAL(10, 2) DEFAULT 25000,
  donor_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create updates table
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255) DEFAULT 'The Gomes Family',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial stats
INSERT INTO campaign_stats (id, goal_amount) 
VALUES (1, 25000) 
ON CONFLICT (id) DO NOTHING;