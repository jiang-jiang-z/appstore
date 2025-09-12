import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Price {
  id: string
  originalPrice: number
  currencyCode: string
  usdPrice: number | null
  country: {
    name: string
    code: string
    currencySymbol: string
  }
}

interface AppWithPrices {
  id: string
  bundleId: string
  name: string
  iconUrl: string | null
  category: string | null
  developer: string | null
  description: string | null
  prices: Price[]
}

interface PriceComparisonTableProps {
  app: AppWithPrices | null
  loading: boolean
}

export function PriceComparisonTable({ app, loading }: PriceComparisonTableProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!app) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-gray-500">请搜索应用以查看价格对比</p>
        </CardContent>
      </Card>
    )
  }

  if (app.prices.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            {app.iconUrl && (
              <img src={app.iconUrl} alt={app.name} className="w-16 h-16 rounded-lg" />
            )}
            <div>
              <CardTitle className="text-2xl">{app.name}</CardTitle>
              <p className="text-gray-600">{app.developer}</p>
              {app.category && <Badge variant="outline">{app.category}</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            暂无价格信息，可能这是一个免费应用
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort prices by USD price (lowest first)
  const sortedPrices = [...app.prices].sort((a, b) => {
    const aPrice = a.usdPrice || a.originalPrice
    const bPrice = b.usdPrice || b.originalPrice
    return aPrice - bPrice
  })

  const lowestPrice = sortedPrices[0]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          {app.iconUrl && (
            <img src={app.iconUrl} alt={app.name} className="w-16 h-16 rounded-lg" />
          )}
          <div>
            <CardTitle className="text-2xl">{app.name}</CardTitle>
            <p className="text-gray-600">{app.developer}</p>
            <div className="flex gap-2 mt-2">
              {app.category && <Badge variant="outline">{app.category}</Badge>}
              <Badge variant="secondary">
                最低价格: {lowestPrice.country.currencySymbol}{lowestPrice.originalPrice.toFixed(2)} ({lowestPrice.country.name})
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>国家</TableHead>
              <TableHead>原价格</TableHead>
              <TableHead>USD价格</TableHead>
              <TableHead className="text-right">节省金额</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPrices.map((price, index) => {
              const savings = price.usdPrice 
                ? (sortedPrices[sortedPrices.length - 1].usdPrice || 0) - (price.usdPrice || 0)
                : 0
              const isLowest = index === 0

              return (
                <TableRow key={price.id} className={isLowest ? 'bg-green-50' : ''}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`fi fi-${price.country.code.toLowerCase()}`}></span>
                      {price.country.name}
                      {isLowest && (
                        <Badge variant="default" className="text-xs">
                          最优价格
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {price.country.currencySymbol}{price.originalPrice.toFixed(2)} {price.currencyCode}
                  </TableCell>
                  <TableCell>
                    ${price.usdPrice?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {savings > 0 ? (
                      <span className="text-green-600 font-medium">
                        -${savings.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}