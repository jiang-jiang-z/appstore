import axios from 'axios'
import { AppStoreApp, SearchResult } from '@/types/appstore'

const COUNTRIES = [
  'us', 'cn', 'jp', 'gb', 'de', 'au', 'ca', 'in', 'kr', 'br'
]

interface ITunesAppResult {
  bundleId: string
  trackName: string
  artistName: string
  description: string
  artworkUrl512?: string
  artworkUrl100?: string
  primaryGenreName: string
  currency: string
  price: number
  formattedPrice: string
}

class AppStoreService {
  private readonly baseUrl = 'https://itunes.apple.com'

  async searchApps(term: string, country: string = 'us', limit: number = 10): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          term,
          country,
          entity: 'software',
          limit,
        },
      })

      return response.data.results.map((app: ITunesAppResult): SearchResult => ({
        bundleId: app.bundleId,
        name: app.trackName,
        developer: app.artistName,
        iconUrl: app.artworkUrl512 || app.artworkUrl100 || null,
        category: app.primaryGenreName,
        description: app.description,
      }))
    } catch (error) {
      console.error('Error searching apps:', error)
      throw new Error('Failed to search apps')
    }
  }

  async getAppDetails(bundleId: string, country: string = 'us'): Promise<AppStoreApp | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/lookup`, {
        params: {
          bundleId,
          country,
          entity: 'software',
        },
      })

      if (response.data.results.length === 0) {
        return null
      }

      const app: ITunesAppResult = response.data.results[0]
      return {
        bundleId: app.bundleId,
        trackName: app.trackName,
        artistName: app.artistName,
        description: app.description,
        artworkUrl512: app.artworkUrl512 || app.artworkUrl100 || '',
        primaryGenreName: app.primaryGenreName,
        currency: app.currency,
        price: app.price,
        formattedPrice: app.formattedPrice,
        country,
      }
    } catch (error) {
      console.error(`Error getting app details for ${bundleId} in ${country}:`, error)
      return null
    }
  }

  async getAppPricesFromAllCountries(bundleId: string): Promise<AppStoreApp[]> {
    const promises = COUNTRIES.map(country => 
      this.getAppDetails(bundleId, country)
    )

    const results = await Promise.allSettled(promises)
    return results
      .filter((result): result is PromiseFulfilledResult<AppStoreApp> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
  }

  async getMultipleAppsPricing(bundleIds: string[]): Promise<{ [bundleId: string]: AppStoreApp[] }> {
    const result: { [bundleId: string]: AppStoreApp[] } = {}
    
    for (const bundleId of bundleIds) {
      try {
        result[bundleId] = await this.getAppPricesFromAllCountries(bundleId)
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error getting prices for ${bundleId}:`, error)
        result[bundleId] = []
      }
    }

    return result
  }
}

export const appStoreService = new AppStoreService()