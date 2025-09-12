import { NextRequest, NextResponse } from 'next/server'
import { updateService } from '@/services/update'

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()

    switch (type) {
      case 'exchange-rates':
        const ratesResult = await updateService.updateExchangeRates()
        return NextResponse.json(ratesResult)

      case 'popular-apps':
        const appsResult = await updateService.updatePopularApps()
        return NextResponse.json(appsResult)

      case 'price-conversions':
        const pricesResult = await updateService.updatePricesWithCurrentRates()
        return NextResponse.json(pricesResult)

      case 'full':
        const fullResults = await updateService.runFullUpdate()
        return NextResponse.json(fullResults)

      default:
        return NextResponse.json(
          { error: 'Invalid update type. Use: exchange-rates, popular-apps, price-conversions, or full' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Update API error:', error)
    return NextResponse.json(
      { error: 'Failed to process update request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'full'

    // For GET requests, just return update status or trigger lightweight updates
    switch (type) {
      case 'status':
        return NextResponse.json({
          message: 'Update service is running',
          timestamp: new Date(),
          availableTypes: ['exchange-rates', 'popular-apps', 'price-conversions', 'full']
        })

      case 'quick':
        // Just update exchange rates for quick refresh
        const quickResult = await updateService.updateExchangeRates()
        return NextResponse.json(quickResult)

      default:
        return NextResponse.json(
          { error: 'Use POST for full updates, or GET with type=status or type=quick' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Update API error:', error)
    return NextResponse.json(
      { error: 'Failed to process update request' },
      { status: 500 }
    )
  }
}