import { NextResponse } from 'next/server'
import { getPublicDonations } from '@/lib/donations'

export async function GET() {
  try {
    const donations = await getPublicDonations(20)
    return NextResponse.json(donations)
  } catch (error) {
    console.error('Error fetching recent donations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}