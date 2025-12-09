'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { initiateOAuth } from '@/lib/oauth/actions'
import { Loader2 } from 'lucide-react'
import type { Platform } from '@/types/database'
import { platformConfigs } from '@/lib/oauth/config'

interface PlatformCardProps {
  platform: Platform
  isConnected: boolean
}

export function PlatformCard({ platform, isConnected }: PlatformCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const config = platformConfigs[platform]

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await initiateOAuth(platform)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result.authUrl) {
        // Redirect to OAuth authorization page
        window.location.href = result.authUrl
      }
    } catch (err) {
      setError('Failed to initiate connection')
      setIsLoading(false)
    }
  }

  if (!config.enabled) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{config.icon}</div>
            <div>
              <CardTitle>{config.displayName}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configuration required. Please add credentials to environment variables.
          </p>
          <Button disabled variant="outline" className="w-full">
            Not Configured
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`text-3xl p-3 rounded-lg bg-gradient-to-br ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              {config.displayName}
              {isConnected && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  Connected
                </span>
              )}
            </CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}
        <Button
          onClick={handleConnect}
          disabled={isLoading || isConnected}
          className="w-full"
          variant={isConnected ? 'outline' : 'default'}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : isConnected ? (
            'Already Connected'
          ) : (
            `Connect ${config.displayName}`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
