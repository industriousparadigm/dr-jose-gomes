import { getStats } from '@/lib/db'
import { getDonations } from '@/lib/donations'
import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminDashboardPage() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    redirect('/admin/login')
  }

  const [stats, donations] = await Promise.all([
    getStats(),
    getDonations()
  ])

  return <AdminDashboard stats={stats} donations={donations} />
}