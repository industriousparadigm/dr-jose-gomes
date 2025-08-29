export interface Donation {
  id: string
  amount: number
  currency: 'USD' | 'BRL' | 'EUR'
  payment_method: string
  processor_id?: string
  donor_name?: string
  donor_email?: string
  donor_message?: string
  is_anonymous: boolean
  is_message_public: boolean
  created_at: Date
  updated_at: Date
  ip_country?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
}

export interface Update {
  id: string
  title_pt: string
  title_en: string
  content_pt: string
  content_en: string
  media_urls?: string[]
  author: string
  created_at: Date
  is_pinned: boolean
}

export interface Stats {
  total_raised: number
  donor_count: number
  goal_amount: number
  recent_donations: Donation[]
}

export type Locale = 'en' | 'pt'

export type PaymentMethod = 
  | 'credit_card' 
  | 'paypal' 
  | 'pix' 
  | 'mbway' 
  | 'bank_transfer'

export interface PaymentConfig {
  method: PaymentMethod
  available: boolean
  displayName: {
    en: string
    pt: string
  }
  description?: {
    en: string
    pt: string
  }
}