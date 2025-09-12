import { NextRequest, NextResponse } from 'next/server'
import { exchangeRateService } from '@/services/exchange-rate'
import { exchangeRateDatabaseService } from '@/services/exchange-rate-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const fromCurrency = searchParams.get('from')
    const toCurrency = searchParams.get('to') || 'USD'

    if (action === 'update') {
      // Update all exchange rates
      const rates = await exchangeRateDatabaseService.updateAllExchangeRates()
      return NextResponse.json({ success: true, rates })
    }

    if (action === 'update-prices') {
      // Update prices with current exchange rates
      const result = await exchangeRateDatabaseService.updatePricesWithExchangeRates()
      return NextResponse.json({ success: true, result })
    }

    if (action === 'convert' && fromCurrency) {
      // Get specific exchange rate
      const rate = await exchangeRateService.getExchangeRate(fromCurrency, toCurrency)
      return NextResponse.json({ rate, fromCurrency, toCurrency })
    }

    // Get all saved exchange rates
    const rates = await exchangeRateDatabaseService.getAllExchangeRates()
    return NextResponse.json({ rates })
  } catch (error) {
    console.error('Exchange rate API error:', error)
    return NextResponse.json({ error: 'Failed to process exchange rate request' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fromCurrency, toCurrency = 'USD', amount } = await request.json()

    if (!fromCurrency || amount === undefined) {
      return NextResponse.json({ error: 'fromCurrency and amount are required' }, { status: 400 })
    }

    const rate = await exchangeRateService.getExchangeRate(fromCurrency, toCurrency)
    const convertedAmount = exchangeRateService.convertPrice(amount, fromCurrency, rate, toCurrency)

    return NextResponse.json({
      originalAmount: amount,
      convertedAmount,
      fromCurrency,
      toCurrency,
      rate,
    })
  } catch (error) {
    console.error('Currency conversion error:', error)
    return NextResponse.json({ error: 'Failed to convert currency' }, { status: 500 })
  }
}