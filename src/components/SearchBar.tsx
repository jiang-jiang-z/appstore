'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchResult } from '@/types/appstore'

interface SearchBarProps {
  onSearch: (query: string) => void
  results: SearchResult[]
  loading: boolean
  onSelectApp: (bundleId: string) => void
}

export function SearchBar({ onSearch, results, loading, onSelectApp }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setShowResults(true)
    }
  }

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="搜索应用，如 Spotify, Netflix, Adobe Creative Cloud..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '搜索中...' : '搜索'}
        </Button>
      </form>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
          {results.map((app) => (
            <div
              key={app.bundleId}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              onClick={() => {
                onSelectApp(app.bundleId)
                setShowResults(false)
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={app.iconUrl}
                  alt={app.name}
                  className="w-12 h-12 rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{app.name}</h3>
                  <p className="text-sm text-gray-600">{app.developer}</p>
                  <p className="text-xs text-gray-500">{app.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}