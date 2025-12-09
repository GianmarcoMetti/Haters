import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlatformCard } from '@/components/accounts/platform-card'
import { ConnectedAccount } from '@/components/accounts/connected-account'
import { SyncAllButton } from '@/components/accounts/sync-all-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import type { SocialAccount } from '@/types/database'
import type { Platform } from '@/types/database'

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch connected accounts
  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const connectedAccounts = (accounts || []) as SocialAccount[]
  const connectedPlatforms = new Set(connectedAccounts.map((a) => a.platform))

  const platforms: Platform[] = ['instagram', 'facebook', 'youtube', 'tiktok']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Accounts</h1>
          <p className="text-muted-foreground mt-2">
            Connect and manage your social media accounts
          </p>
        </div>
        {connectedAccounts.length > 0 && <SyncAllButton />}
      </div>

      {/* Success/Error Messages */}
      {searchParams.success && (
        <Alert className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Successfully connected {searchParams.success}!
          </AlertDescription>
        </Alert>
      )}

      {searchParams.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error: {decodeURIComponent(searchParams.error)}
          </AlertDescription>
        </Alert>
      )}

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Connected Accounts</h2>
          <div className="space-y-3">
            {connectedAccounts.map((account) => (
              <ConnectedAccount
                key={account.id}
                account={account}
                onDisconnected={() => {
                  // Refresh the page to show updated list
                  window.location.href = '/dashboard/accounts'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {connectedAccounts.length > 0 ? 'Connect More Accounts' : 'Connect Your First Account'}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform}
              platform={platform}
              isConnected={connectedPlatforms.has(platform)}
            />
          ))}
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="rounded-lg border bg-muted/50 p-6">
        <h3 className="font-semibold mb-2">Setup Instructions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          To enable social media connections, you need to configure OAuth credentials for each platform.
          Add the following environment variables to your <code className="bg-background px-1 py-0.5 rounded">.env.local</code> file:
        </p>
        <pre className="text-xs bg-background p-4 rounded-md overflow-x-auto">
{`# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Facebook
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# YouTube
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# TikTok
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# App URL (for OAuth callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
        </pre>
      </div>
    </div>
  )
}
