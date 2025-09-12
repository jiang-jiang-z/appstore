import { NextRequest, NextResponse } from 'next/server'
import { appStoreService } from '@/services/appstore'
import { databaseService } from '@/services/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bundleId = searchParams.get('bundleId')
    const refresh = searchParams.get('refresh') === 'true'

    if (!bundleId) {
      return NextResponse.json({ error: 'Bundle ID is required' }, { status: 400 })
    }

    // If refresh is requested or no data exists, fetch from App Store
    if (refresh) {
      const appPrices = await appStoreService.getAppPricesFromAllCountries(bundleId)
      if (appPrices.length > 0) {
        await databaseService.saveBulkAppPrices({ [bundleId]: appPrices })
      }
    }

    // Get data from database
    const app = await databaseService.getAppWithPrices(bundleId)
    
    if (!app) {
      // Try to fetch from App Store if not found in database
      const appPrices = await appStoreService.getAppPricesFromAllCountries(bundleId)
      if (appPrices.length > 0) {
        await databaseService.saveBulkAppPrices({ [bundleId]: appPrices })
        const savedApp = await databaseService.getAppWithPrices(bundleId)
        return NextResponse.json({ app: savedApp })
      }
      
      return NextResponse.json({ error: 'App not found' }, { status: 404 })
    }

    return NextResponse.json({ app })
  } catch (error) {
    console.error('Prices API error:', error)
    return NextResponse.json({ error: 'Failed to get app prices' }, { status: 500 })
  }
}