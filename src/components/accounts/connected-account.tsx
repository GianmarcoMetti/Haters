'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { disconnectAccount } from '@/lib/oauth/actions'
import { syncAccountComments, getAccountSyncStats } from '@/lib/social/actions'
import { Loader2, Unlink, CheckCircle, RefreshCw, Clock } from 'lucide-react'
import { platformConfigs } from '@/lib/oauth/config'
import type { SocialAccount } from '@/types/database'

interface ConnectedAccountProps {
  account: SocialAccount
  onDisconnected: () => void
}

export function ConnectedAccount({ account, onDisconnected }: ConnectedAccountProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [syncStats, setSyncStats] = useState<{
    totalComments: number
    lastSyncAt: string | null
  } | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const config = platformConfigs[account.platform]

  // Load sync stats on mount
  useEffect(() => {
    loadSyncStats()
  }, [account.id])

  const loadSyncStats = async () => {
    const result = await getAccountSyncStats(account.id)
    if (result.success && result.stats) {
      setSyncStats(result.stats)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncMessage(null)

    try {
      const result = await syncAccountComments(account.id)

      if (result.error) {
        setSyncMessage(`Error: ${result.error}`)
        setIsSyncing(false)
        return
      }

      if (result.result) {
        const { commentsFound, commentsIngested, commentsDuplicate } = result.result
        setSyncMessage(
          `Synced! Found ${commentsFound}, added ${commentsIngested} new (${commentsDuplicate} duplicates)`
        )
        // Reload stats
        await loadSyncStats()
      }

      setIsSyncing(false)
    } catch (err) {
      setSyncMessage('Failed to sync comments')
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)

    try {
      const result = await disconnectAccount(account.id)

      if (result.error) {
        alert(result.error)
        setIsLoading(false)
        return
      }

      onDisconnected()
    } catch (err) {
      alert('Failed to disconnect account')
      setIsLoading(false)
    }
  }

  const isExpired = account.token_expires_at
    ? new Date(account.token_expires_at) < new Date()
    : false

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-2xl p-2 rounded-lg bg-gradient-to-br ${config.color}`}>
                {config.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{config.displayName}</h3>
                  {!isExpired && (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {account.platform_user_id || 'Connected'}
                </p>
                {isExpired && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Token expired - reconnect required
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Connected {new Date(account.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing || isExpired || isLoading}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync
                  </>
                )}
              </Button>

              {!showConfirm ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowConfirm(true)}
                  disabled={isLoading || isSyncing}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisconnect}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          {syncStats && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-2">
                <span className="font-medium">{syncStats.totalComments}</span>
                <span>comments ingested</span>
              </div>
              {syncStats.lastSyncAt && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Last sync: {new Date(syncStats.lastSyncAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Sync Message */}
          {syncMessage && (
            <div className="text-sm p-2 bg-muted rounded-md">
              {syncMessage}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
