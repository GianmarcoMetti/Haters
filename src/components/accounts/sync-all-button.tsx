'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { syncAllComments } from '@/lib/social/actions'
import { Loader2, RefreshCw } from 'lucide-react'

export function SyncAllButton() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSyncAll = async () => {
    setIsSyncing(true)
    setMessage(null)

    try {
      const result = await syncAllComments()

      if (result.error) {
        setMessage(`Error: ${result.error}`)
        setIsSyncing(false)
        return
      }

      if (result.totals) {
        const { found, ingested, duplicates } = result.totals
        setMessage(
          `Synced all accounts! Found ${found}, added ${ingested} new (${duplicates} duplicates)`
        )
      }

      setIsSyncing(false)

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setMessage('Failed to sync all accounts')
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleSyncAll} disabled={isSyncing}>
        {isSyncing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Syncing All Accounts...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All Accounts
          </>
        )}
      </Button>

      {message && (
        <div className="text-sm p-3 bg-muted rounded-md max-w-xl">
          {message}
        </div>
      )}
    </div>
  )
}
