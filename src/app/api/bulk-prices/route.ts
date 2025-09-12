import { NextRequest, NextResponse } from 'next/server'
import { appStoreService } from '@/services/appstore'
import { databaseService } from '@/services/database'

export async function POST(request: NextRequest) {
  try {
    const { bundleIds } = await request.json()

    if (!bundleIds || !Array.isArray(bundleIds)) {
      return NextResponse.json({ error: 'Bundle IDs array is required' }, { status: 400 })
    }

    if (bundleIds.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 bundle IDs allowed per request' }, { status: 400 })
    }

    // Fetch prices from App Store
    const appPricesMap = await appStoreService.getMultipleAppsPricing(bundleIds)
    
    // Save to database
    const saveResults = await databaseService.saveBulkAppPrices(appPricesMap)

    // Get the saved data from database
    const apps = await Promise.all(
      bundleIds.map(bundleId => databaseService.getAppWithPrices(bundleId))
    )

    return NextResponse.json({ 
      apps: apps.filter(app => app !== null),
      saveResults 
    })
  } catch (error) {
    console.error('Bulk prices API error:', error)
    return NextResponse.json({ error: 'Failed to get bulk app prices' }, { status: 500 })
  }
}