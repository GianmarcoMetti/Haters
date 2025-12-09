import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { oauthConfigs } from '@/lib/oauth/config'
import type { Platform } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const { platform: platformParam } = await params
  const platform = platformParam as Platform

  // Handle OAuth errors
  if (error) {
    console.error(`OAuth error for ${platform}:`, error)
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=missing_parameters', request.url)
    )
  }

  // Validate platform
  if (!['instagram', 'facebook', 'youtube', 'tiktok'].includes(platform)) {
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=invalid_platform', request.url)
    )
  }

  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/login?error=not_authenticated', request.url)
      )
    }

    // TODO: Verify state parameter (CSRF protection)
    // In production, retrieve stored state and compare

    // Exchange authorization code for access token
    const config = oauthConfigs[platform]
    const tokenResponse = await exchangeCodeForToken(platform, code, config)

    if (!tokenResponse.access_token) {
      throw new Error('Failed to obtain access token')
    }

    // Fetch platform user ID
    const platformUserId = await fetchPlatformUserId(
      platform,
      tokenResponse.access_token
    )

    // Calculate token expiration
    const tokenExpiresAt = tokenResponse.expires_in
      ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
      : null

    // Store or update social account in database
    const { error: dbError } = await supabase.from('social_accounts').upsert(
      {
        user_id: user.id,
        platform,
        platform_user_id: platformUserId,
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token || null,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,platform',
      }
    )

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save account')
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?success=${platform}`, request.url)
    )
  } catch (err) {
    console.error(`OAuth callback error for ${platform}:`, err)
    return NextResponse.redirect(
      new URL(
        `/dashboard/accounts?error=${encodeURIComponent(
          err instanceof Error ? err.message : 'unknown_error'
        )}`,
        request.url
      )
    )
  }
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(
  platform: Platform,
  code: string,
  config: typeof oauthConfigs[Platform]
): Promise<{
  access_token: string
  refresh_token?: string
  expires_in?: number
}> {
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  })

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Token exchange failed for ${platform}:`, errorText)
    throw new Error(`Token exchange failed: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch platform-specific user ID
 */
async function fetchPlatformUserId(
  platform: Platform,
  accessToken: string
): Promise<string> {
  let url: string
  let headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  }

  switch (platform) {
    case 'instagram':
      url = 'https://graph.instagram.com/me?fields=id,username'
      break
    case 'facebook':
      url = 'https://graph.facebook.com/me?fields=id,name'
      break
    case 'youtube':
      url = 'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true'
      break
    case 'tiktok':
      url = 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name'
      break
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`Failed to fetch user ID for ${platform}`)
  }

  const data = await response.json()

  // Extract user ID based on platform response structure
  switch (platform) {
    case 'instagram':
    case 'facebook':
      return data.id
    case 'youtube':
      return data.items?.[0]?.id || ''
    case 'tiktok':
      return data.data?.user?.open_id || ''
    default:
      throw new Error(`Cannot extract user ID for ${platform}`)
  }
}
