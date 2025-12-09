'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAuthorizationUrl, validateOAuthConfig } from './config'
import type { Platform } from '@/types/database'
import { randomBytes } from 'crypto'

/**
 * Initiate OAuth flow for a platform
 */
export async function initiateOAuth(platform: Platform) {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Validate OAuth configuration
  if (!validateOAuthConfig(platform)) {
    return { error: `${platform} OAuth is not configured. Please add credentials to environment variables.` }
  }

  // Generate state parameter for CSRF protection
  const state = randomBytes(32).toString('hex')

  // Store state in user metadata or session (for now, we'll use a simple approach)
  // In production, you'd want to store this in a session or encrypted cookie
  const stateData = {
    state,
    platform,
    userId: user.id,
    timestamp: Date.now(),
  }

  // Store state in localStorage via redirect URL (for demo purposes)
  // In production, use server-side sessions or encrypted cookies
  const authUrl = getAuthorizationUrl(platform, state)

  // Store state in session/cookie before redirect
  // For now, we'll pass it through the URL (not recommended for production)
  return { authUrl, state }
}

/**
 * Disconnect a social account
 */
export async function disconnectAccount(accountId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Delete the social account (RLS will ensure user can only delete their own)
  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error disconnecting account:', error)
    return { error: 'Failed to disconnect account' }
  }

  return { success: true }
}

/**
 * Refresh access token for a platform
 */
export async function refreshAccessToken(accountId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Fetch the account
  const { data: account, error: fetchError } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !account) {
    return { error: 'Account not found' }
  }

  // TODO: Implement token refresh logic for each platform
  // This will vary by platform and requires calling their token refresh endpoints

  return { error: 'Token refresh not yet implemented' }
}
