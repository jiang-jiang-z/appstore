export interface AppStoreApp {
  bundleId: string
  trackName: string
  artistName: string
  description: string
  artworkUrl512: string
  primaryGenreName: string
  currency: string
  price: number
  formattedPrice: string
  country: string
}

export interface AppStorePricing {
  bundleId: string
  country: string
  currency: string
  monthlyPrice?: number
  yearlyPrice?: number
  lifetimePrice?: number
  formattedPrices: {
    monthly?: string
    yearly?: string
    lifetime?: string
  }
}

export interface SearchResult {
  bundleId: string
  name: string
  developer: string
  iconUrl: string | null
  category: string
  description: string
}