import axios from 'axios'

export interface ExchangeRateData {
  fromCurrency: string
  toCurrency: string
  rate: number
  lastUpdated: Date
}

class ExchangeRateService {
  private readonly baseUrl = 'https://api.exchangerate-api.com/v4/latest'
  
  async getExchangeRate(fromCurrency: string, toCurrency: string = 'USD'): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/${fromCurrency}`)
      const rates = response.data.rates
      
      if (!rates[toCurrency]) {
        throw new Error(`Exchange rate for ${fromCurrency} to ${toCurrency} not found`)
      }
      
      return rates[toCurrency]
    } catch (error) {
      console.error(`Error getting exchange rate from ${fromCurrency} to ${toCurrency}:`, error)
      throw error
    }
  }

  async getMultipleExchangeRates(fromCurrencies: string[], toCurrency: string = 'USD'): Promise<ExchangeRateData[]> {
    const results: ExchangeRateData[] = []
    
    for (const fromCurrency of fromCurrencies) {
      try {
        const rate = await this.getExchangeRate(fromCurrency, toCurrency)
        results.push({
          fromCurrency,
          toCurrency,
          rate,
          lastUpdated: new Date()
        })
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error getting rate for ${fromCurrency}:`, error)
      }
    }
    
    return results
  }

  async getAllRatesForBaseCurrency(baseCurrency: string = 'USD'): Promise<{ [currency: string]: number }> {
    try {
      const response = await axios.get(`${this.baseUrl}/${baseCurrency}`)
      return response.data.rates
    } catch (error) {
      console.error(`Error getting all rates for ${baseCurrency}:`, error)
      throw error
    }
  }

  convertPrice(price: number, fromCurrency: string, rate: number, toCurrency: string = 'USD'): number {
    if (fromCurrency === toCurrency) {
      return price
    }
    return Number((price * rate).toFixed(2))
  }
}

export const exchangeRateService = new ExchangeRateService()