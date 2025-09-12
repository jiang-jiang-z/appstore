import { NextRequest, NextResponse } from 'next/server'
import { databaseService } from '@/services/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let apps
    if (search) {
      apps = await databaseService.searchAppsInDatabase(search)
    } else {
      apps = await databaseService.getAllAppsWithPrices()
    }

    return NextResponse.json({ apps })
  } catch (error) {
    console.error('Apps API error:', error)
    return NextResponse.json({ error: 'Failed to get apps' }, { status: 500 })
  }
}