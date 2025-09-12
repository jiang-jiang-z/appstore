import { exchangeRateDatabaseService } from './exchange-rate-db'
import { databaseService } from './database'
import { appStoreService } from './appstore'

export interface UpdateResult {
  success: boolean
  message: string
  timestamp: Date
  details?: Record<string, string | number | boolean | unknown[]>
}

class UpdateService {
  private readonly POPULAR_APPS = [
    'com.spotify.client',
    'com.netflix.Netflix', 
    'com.adobe.creativecloud'
  ]

  async updateExchangeRates(): Promise<UpdateResult> {
    try {
      const rates = await exchangeRateDatabaseService.updateAllExchangeRates()
      return {
        success: true,
        message: `Updated ${rates.length} exchange rates`,
        timestamp: new Date(),
        details: { ratesCount: rates.length }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to update exchange rates: ${error}`,
        timestamp: new Date()
      }
    }
  }

  async updatePopularApps(): Promise<UpdateResult> {
    try {
      const results = []
      
      for (const bundleId of this.POPULAR_APPS) {
        try {
          const appPrices = await appStoreService.getAppPricesFromAllCountries(bundleId)
          if (appPrices.length > 0) {
            await databaseService.saveBulkAppPrices({ [bundleId]: appPrices })
            results.push({ bundleId, success: true, pricesCount: appPrices.length })
          }
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          results.push({ bundleId, success: false, error: String(error) })
        }
      }

      const successCount = results.filter(r => r.success).length
      
      return {
        success: successCount > 0,
        message: `Updated ${successCount}/${this.POPULAR_APPS.length} popular apps`,
        timestamp: new Date(),
        details: { results }
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to update popular apps: ${error}`,
        timestamp: new Date()
      }
    }
  }

  async updatePricesWithCurrentRates(): Promise<UpdateResult> {
    try {
      const result = await exchangeRateDatabaseService.updatePricesWithExchangeRates()
      
      return {
        success: true,
        message: `Updated USD prices for ${result.updated} items`,
        timestamp: new Date(),
        details: result
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to update prices with current rates: ${error}`,
        timestamp: new Date()
      }
    }
  }

  async runFullUpdate(): Promise<{ [key: string]: UpdateResult }> {
    const results: { [key: string]: UpdateResult } = {}
    
    // Update exchange rates first
    results.exchangeRates = await this.updateExchangeRates()
    
    // Wait a bit before updating prices with new rates
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update popular apps
    results.popularApps = await this.updatePopularApps()
    
    // Update existing prices with current exchange rates
    results.priceUpdates = await this.updatePricesWithCurrentRates()
    
    return results
  }

  isDataStale(lastUpdated: Date, maxAgeHours: number = 6): boolean {
    const maxAge = maxAgeHours * 60 * 60 * 1000 // Convert to milliseconds
    return Date.now() - lastUpdated.getTime() > maxAge
  }

  shouldRefreshExchangeRates(): Promise<boolean> {
    // For now, always allow manual refresh
    return Promise.resolve(true)
  }

  shouldRefreshAppPrices(lastUpdated?: Date): boolean {
    if (!lastUpdated) return true
    return this.isDataStale(lastUpdated, 24) // 24 hours for app prices
  }
}

export const updateService = new UpdateService()