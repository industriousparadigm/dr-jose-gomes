import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getDonations } from '@/lib/donations'

export async function GET() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const donations = await getDonations()
    
    // Create CSV content
    const headers = [
      'ID',
      'Date',
      'Amount',
      'Currency',
      'Donor Name',
      'Donor Email',
      'Message',
      'Status',
      'Anonymous',
      'Public',
      'Payment ID'
    ]
    
    const rows = donations.map(d => [
      d.id,
      new Date(d.created_at).toISOString(),
      d.amount,
      d.currency,
      d.donor_name || '',
      d.donor_email || '',
      d.message || '',
      d.status,
      d.is_anonymous ? 'Yes' : 'No',
      d.is_public ? 'Yes' : 'No',
      d.processor_id || ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        ).join(',')
      )
    ].join('\n')
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="donations-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}