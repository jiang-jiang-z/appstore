import { PrismaClient } from '@/generated/prisma'
import { AppStoreApp } from '@/types/appstore'
import { exchangeRateDatabaseService } from './exchange-rate-db'
import { exchangeRateService } from './exchange-rate'

const prisma = new PrismaClient()

class DatabaseService {
  async saveApp(appData: AppStoreApp) {
    try {
      // First ensure the app exists
      const app = await prisma.app.upsert({
        where: { bundleId: appData.bundleId },
        update: {
          name: appData.trackName,
          iconUrl: appData.artworkUrl512,
          category: appData.primaryGenreName,
          developer: appData.artistName,
          description: appData.description,
        },
        create: {
          bundleId: appData.bundleId,
          name: appData.trackName,
          iconUrl: appData.artworkUrl512,
          category: appData.primaryGenreName,
          developer: appData.artistName,
          description: appData.description,
        },
      })

      // Get the country
      const country = await prisma.country.findUnique({
        where: { code: appData.country.toUpperCase() },
      })

      if (!country) {
        console.warn(`Country ${appData.country} not found in database`)
        return
      }

      // Save the price (assuming it's the base app price, not subscription)
      if (appData.price > 0) {
        // Convert to USD if not already
        let usdPrice = appData.price
        if (appData.currency !== 'USD') {
          try {
            const exchangeRate = await exchangeRateDatabaseService.getExchangeRate(appData.currency, 'USD')
            if (exchangeRate) {
              usdPrice = exchangeRateService.convertPrice(appData.price, appData.currency, exchangeRate.rate, 'USD')
            }
          } catch (error) {
            console.warn(`Could not convert ${appData.currency} to USD:`, error)
          }
        }

        await prisma.price.upsert({
          where: {
            appId_countryId_priceType: {
              appId: app.id,
              countryId: country.id,
              priceType: 'one_time',
            },
          },
          update: {
            originalPrice: appData.price,
            currencyCode: appData.currency,
            usdPrice: usdPrice,
            lastUpdated: new Date(),
          },
          create: {
            appId: app.id,
            countryId: country.id,
            priceType: 'one_time',
            originalPrice: appData.price,
            currencyCode: appData.currency,
            usdPrice: usdPrice,
          },
        })
      }

      return app
    } catch (error) {
      console.error('Error saving app to database:', error)
      throw error
    }
  }

  async saveBulkAppPrices(appPricesMap: { [bundleId: string]: AppStoreApp[] }) {
    const results = []
    
    for (const [bundleId, appPrices] of Object.entries(appPricesMap)) {
      try {
        for (const appPrice of appPrices) {
          await this.saveApp(appPrice)
        }
        results.push({ bundleId, success: true })
      } catch (error) {
        console.error(`Error saving prices for ${bundleId}:`, error)
        results.push({ bundleId, success: false, error })
      }
    }

    return results
  }

  async getAppWithPrices(bundleId: string) {
    return await prisma.app.findUnique({
      where: { bundleId },
      include: {
        prices: {
          include: {
            country: true,
          },
          orderBy: {
            originalPrice: 'asc',
          },
        },
      },
    })
  }

  async getAllAppsWithPrices() {
    return await prisma.app.findMany({
      include: {
        prices: {
          include: {
            country: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  async searchAppsInDatabase(searchTerm: string) {
    return await prisma.app.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { bundleId: { contains: searchTerm, mode: 'insensitive' } },
          { developer: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        prices: {
          include: {
            country: true,
          },
        },
      },
      take: 20,
    })
  }
}

export const databaseService = new DatabaseService()