import { PrismaClient } from '@/generated/prisma'
import { exchangeRateService, ExchangeRateData } from './exchange-rate'

const prisma = new PrismaClient()

class ExchangeRateDatabaseService {
  async saveExchangeRate(data: ExchangeRateData) {
    try {
      return await prisma.exchangeRate.upsert({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: data.fromCurrency,
            toCurrency: data.toCurrency,
          },
        },
        update: {
          rate: data.rate,
          updatedAt: data.lastUpdated,
        },
        create: {
          fromCurrency: data.fromCurrency,
          toCurrency: data.toCurrency,
          rate: data.rate,
          updatedAt: data.lastUpdated,
        },
      })
    } catch (error) {
      console.error('Error saving exchange rate:', error)
      throw error
    }
  }

  async saveMultipleExchangeRates(rates: ExchangeRateData[]) {
    const results = []
    for (const rate of rates) {
      try {
        const saved = await this.saveExchangeRate(rate)
        results.push(saved)
      } catch (error) {
        console.error(`Error saving rate ${rate.fromCurrency} to ${rate.toCurrency}:`, error)
      }
    }
    return results
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string = 'USD') {
    return await prisma.exchangeRate.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency,
          toCurrency,
        },
      },
    })
  }

  async getAllExchangeRates() {
    return await prisma.exchangeRate.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }

  async updateAllExchangeRates() {
    // Get all unique currencies from countries
    const countries = await prisma.country.findMany({
      select: { currencyCode: true },
      distinct: ['currencyCode'],
    })

    const currencies = countries.map(c => c.currencyCode).filter(c => c !== 'USD')
    
    // Fetch current rates
    const rates = await exchangeRateService.getMultipleExchangeRates(currencies, 'USD')
    
    // Save to database
    await this.saveMultipleExchangeRates(rates)
    
    return rates
  }

  async updatePricesWithExchangeRates() {
    try {
      // Get all prices that don't have USD conversion or are outdated
      const prices = await prisma.price.findMany({
        where: {
          OR: [
            { usdPrice: null },
            { 
              lastUpdated: {
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
              }
            }
          ]
        },
        include: {
          country: true,
        },
      })

      for (const price of prices) {
        if (price.currencyCode === 'USD') {
          // Already USD, no conversion needed
          await prisma.price.update({
            where: { id: price.id },
            data: { usdPrice: price.originalPrice },
          })
        } else {
          // Get exchange rate
          const exchangeRate = await this.getExchangeRate(price.currencyCode, 'USD')
          
          if (exchangeRate) {
            const usdPrice = exchangeRateService.convertPrice(
              price.originalPrice,
              price.currencyCode,
              exchangeRate.rate,
              'USD'
            )
            
            await prisma.price.update({
              where: { id: price.id },
              data: { usdPrice },
            })
          }
        }
      }

      return { updated: prices.length }
    } catch (error) {
      console.error('Error updating prices with exchange rates:', error)
      throw error
    }
  }
}

export const exchangeRateDatabaseService = new ExchangeRateDatabaseService()