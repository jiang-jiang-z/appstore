import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface PopularApp {
  bundleId: string
  name: string
  iconUrl: string | null
  category: string | null
  developer: string | null
  description: string | null
}

interface PopularAppsProps {
  onSelectApp: (bundleId: string) => void
}

export function PopularApps({ onSelectApp }: PopularAppsProps) {
  const popularApps: PopularApp[] = [
    {
      bundleId: 'com.spotify.client',
      name: 'Spotify',
      iconUrl: '/app-icons/spotify.png',
      category: 'Music',
      developer: 'Spotify',
      description: '音乐流媒体服务'
    },
    {
      bundleId: 'com.netflix.Netflix',
      name: 'Netflix',
      iconUrl: '/app-icons/netflix.png', 
      category: 'Entertainment',
      developer: 'Netflix',
      description: '视频流媒体服务'
    },
    {
      bundleId: 'com.adobe.creativecloud',
      name: 'Adobe Creative Cloud',
      iconUrl: '/app-icons/adobe.png',
      category: 'Productivity', 
      developer: 'Adobe',
      description: '创意软件套件'
    }
  ]

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">热门应用价格对比</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularApps.map((app) => (
          <Card key={app.bundleId} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {app.name[0]}
                </div>
                <div>
                  <CardTitle className="text-lg">{app.name}</CardTitle>
                  <CardDescription>{app.developer}</CardDescription>
                </div>
              </div>
              {app.category && (
                <Badge variant="outline" className="w-fit">
                  {app.category}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{app.description}</p>
              <Button 
                onClick={() => onSelectApp(app.bundleId)}
                className="w-full"
                variant="outline"
              >
                查看价格对比
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}