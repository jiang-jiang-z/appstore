'use client'

import { useState } from 'react'
import axios from 'axios'
import { SearchBar } from '@/components/SearchBar'
import { PriceComparisonTable } from '@/components/PriceComparisonTable'
import { PopularApps } from '@/components/PopularApps'
import { DataStatus } from '@/components/DataStatus'
import { SearchResult } from '@/types/appstore'

interface AppWithPrices {
  id: string
  bundleId: string
  name: string
  iconUrl: string | null
  category: string | null
  developer: string | null
  description: string | null
  prices: Array<{
    id: string
    originalPrice: number
    currencyCode: string
    usdPrice: number | null
    country: {
      name: string
      code: string
      currencySymbol: string
    }
  }>
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState<AppWithPrices | null>(null)
  const [appLoading, setAppLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchLoading(true)
    try {
      const response = await axios.get(`/api/search?term=${encodeURIComponent(query)}&limit=10`)
      setSearchResults(response.data.results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectApp = async (bundleId: string) => {
    setAppLoading(true)
    setSelectedApp(null)
    
    try {
      const response = await axios.get(`/api/prices?bundleId=${encodeURIComponent(bundleId)}&refresh=true`)
      setSelectedApp(response.data.app)
    } catch (error) {
      console.error('Failed to load app prices:', error)
    } finally {
      setAppLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🍎 苹果应用价格对比
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              比较全球苹果商店应用价格，找到最优购买选择
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 flex justify-center">
              <SearchBar
                onSearch={handleSearch}
                results={searchResults}
                loading={searchLoading}
                onSelectApp={handleSelectApp}
              />
            </div>
            
            <DataStatus className="w-full lg:w-80" />
          </div>
        </header>

        <main className="space-y-12">
          {selectedApp || appLoading ? (
            <PriceComparisonTable
              app={selectedApp}
              loading={appLoading}
            />
          ) : (
            <PopularApps onSelectApp={handleSelectApp} />
          )}
        </main>

        <footer className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-gray-500">
            数据来源于苹果商店公开API，汇率实时更新
          </p>
        </footer>
      </div>
    </div>
  )
}
