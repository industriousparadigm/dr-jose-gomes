import { HeroSection } from '@/components/sections/HeroSection'
import { StorySection } from '@/components/sections/StorySection'
import { DonationSection } from '@/components/sections/DonationSection'
import { UpdatesSection } from '@/components/sections/UpdatesSection'
import { Footer } from '@/components/layout/Footer'
// import { getStats } from '@/lib/db/donations'
// import { getUpdates } from '@/lib/db/updates'

import { Update } from '@/types'

export default async function HomePage() {
  // Fetch data server-side
  let stats = null
  let updates: Update[] = []
  
  try {
    // For now, we'll use mock data since DB might not be initialized
    stats = {
      total_raised: 0,
      donor_count: 0,
      goal_amount: Number(process.env.NEXT_PUBLIC_GOAL_AMOUNT || 25000),
      recent_donations: []
    }
    updates = []
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <HeroSection stats={stats} />
      <StorySection />
      <DonationSection />
      <UpdatesSection updates={updates} />
      <Footer />
    </div>
  )
}