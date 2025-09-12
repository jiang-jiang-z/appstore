'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DataStatusProps {
  className?: string
}

export function DataStatus({ className }: DataStatusProps) {
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [exchangeRates, setExchangeRates] = useState<any[]>([])

  useEffect(() => {
    loadExchangeRates()
  }, [])

  const loadExchangeRates = async () => {
    try {
      const response = await axios.get('/api/exchange-rates')
      setExchangeRates(response.data.rates)
      
      if (response.data.rates.length > 0) {
        const mostRecent = response.data.rates.reduce((latest: any, rate: any) => 
          new Date(rate.updatedAt) > new Date(latest.updatedAt) ? rate : latest
        )
        setLastUpdate(new Date(mostRecent.updatedAt))
      }
    } catch (error) {
      console.error('Failed to load exchange rates:', error)
    }
  }

  const handleQuickUpdate = async () => {
    setLoading(true)
    setUpdateStatus('idle')
    
    try {
      const response = await axios.get('/api/update?type=quick')
      if (response.data.success) {
        setUpdateStatus('success')
        setLastUpdate(new Date())
        await loadExchangeRates()
      } else {
        setUpdateStatus('error')
      }
    } catch (error) {
      console.error('Update failed:', error)
      setUpdateStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (!lastUpdate) return 'gray'
    
    const hoursOld = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
    
    if (hoursOld < 1) return 'green'
    if (hoursOld < 6) return 'yellow'
    return 'red'
  }

  const getStatusText = () => {
    if (!lastUpdate) return '未知'
    
    const hoursOld = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
    
    if (hoursOld < 1) return '非常新鲜'
    if (hoursOld < 6) return '较新'
    return '需要更新'
  }

  const statusColor = getStatusColor()

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          数据状态
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={statusColor === 'green' ? 'default' : statusColor === 'yellow' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {getStatusText()}
            </Badge>
            {updateStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
            {updateStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickUpdate}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '更新中' : '刷新汇率'}
          </Button>
        </div>

        {lastUpdate && (
          <p className="text-xs text-gray-500">
            最后更新: {format(lastUpdate, 'MM-dd HH:mm', { locale: zhCN })}
          </p>
        )}

        {exchangeRates.length > 0 && (
          <div className="text-xs text-gray-600">
            <p>汇率数据: {exchangeRates.length} 个货币对</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}