import { getStats, getAllDonations } from '@/lib/db/donations'
import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminDashboardPage() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    redirect('/admin/login')
  }

  const [stats, donationsResult] = await Promise.all([
    getStats(),
    getAllDonations()
  ])
  
  const donations = donationsResult.donations

  return <AdminDashboard stats={stats} donations={donations} />
}