'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  LogOut,
  Download,
  Filter,
  Search,
  RefreshCw,
  Mail,
  Globe,
  CreditCard,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/format'
import { Stats } from '@/types'

interface Donation {
  id: string
  amount: number
  currency: string
  donor_name?: string
  donor_email?: string
  message?: string
  is_anonymous: boolean
  is_public: boolean
  status: string
  created_at: string
  processor_id?: string
}

interface AdminDashboardProps {
  stats: Stats | null
  donations: Donation[]
}

export function AdminDashboard({ stats, donations }: AdminDashboardProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showEmails, setShowEmails] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/admin/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      toast.success('Export completed')
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    router.refresh()
    toast.success('Data refreshed')
  }

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = searchTerm === '' || 
      donation.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.message?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const recentDonations = filteredDonations.slice(0, 10)
  const percentage = stats ? Math.round((stats.total_raised / stats.goal_amount) * 100) : 0

  // Calculate daily average
  const campaignDays = 30 // Assuming 30 day campaign
  const dailyAverage = stats ? stats.total_raised / campaignDays : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Campaign Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{percentage}%</span>
            </div>
            <h3 className="text-gray-600 text-sm">Total Raised</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.total_raised || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              of {formatCurrency(stats?.goal_amount || 25000)} goal
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm">Total Donors</h3>
            <p className="text-2xl font-bold text-gray-900">{stats?.donor_count || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              Avg: {formatCurrency(stats && stats.donor_count > 0 ? stats.total_raised / stats.donor_count : 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm">Daily Average</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(dailyAverage)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Over {campaignDays} days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm">Days Remaining</h3>
            <p className="text-2xl font-bold text-gray-900">15</p>
            <p className="text-sm text-gray-500 mt-1">Until goal deadline</p>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Donations</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search donations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                {/* Toggle Emails */}
                <button
                  onClick={() => setShowEmails(!showEmails)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {showEmails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showEmails ? 'Hide' : 'Show'} Emails
                </button>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {donation.is_anonymous ? 'Anonymous' : donation.donor_name || 'N/A'}
                        </div>
                        {showEmails && donation.donor_email && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {donation.donor_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(donation.amount)}
                      </div>
                      <div className="text-xs text-gray-500">{donation.currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        donation.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : donation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {donation.message || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.processor_id ? (
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          <span className="font-mono text-xs">{donation.processor_id.slice(0, 8)}...</span>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredDonations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No donations found matching your criteria
              </div>
            )}
          </div>

          {filteredDonations.length > 10 && (
            <div className="p-4 border-t text-center text-sm text-gray-600">
              Showing 10 of {filteredDonations.length} donations
            </div>
          )}
        </div>
      </div>
    </div>
  )
}