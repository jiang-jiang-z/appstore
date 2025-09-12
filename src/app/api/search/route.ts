import { NextRequest, NextResponse } from 'next/server'
import { appStoreService } from '@/services/appstore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const term = searchParams.get('term')
    const country = searchParams.get('country') || 'us'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!term) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 })
    }

    const results = await appStoreService.searchApps(term, country, limit)
    
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Failed to search apps' }, { status: 500 })
  }
}