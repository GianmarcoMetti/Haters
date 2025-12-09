import type { Platform } from '@/types/database'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  authorizationUrl: string
  tokenUrl: string
  scope: string[]
  redirectUri: string
}

export interface PlatformConfig {
  name: string
  displayName: string
  icon: string
  color: string
  description: string
  enabled: boolean
}

// OAuth configuration for each platform
export const oauthConfigs: Record<Platform, OAuthConfig> = {
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    authorizationUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scope: ['user_profile', 'user_media'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/instagram`,
  },
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID || '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/facebook`,
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || '',
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
    ],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/youtube`,
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
    authorizationUrl: 'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token',
    scope: ['user.info.basic', 'video.list'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback/tiktok`,
  },
}

// Platform display configuration
export const platformConfigs: Record<Platform, PlatformConfig> = {
  instagram: {
    name: 'instagram',
    displayName: 'Instagram',
    icon: '📷',
    color: 'from-purple-500 to-pink-500',
    description: 'Monitor comments on your Instagram posts',
    enabled: !!process.env.INSTAGRAM_CLIENT_ID,
  },
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    icon: '👤',
    color: 'from-blue-600 to-blue-700',
    description: 'Monitor comments on your Facebook page',
    enabled: !!process.env.FACEBOOK_CLIENT_ID,
  },
  youtube: {
    name: 'youtube',
    displayName: 'YouTube',
    icon: '▶️',
    color: 'from-red-600 to-red-700',
    description: 'Monitor comments on your YouTube videos',
    enabled: !!process.env.YOUTUBE_CLIENT_ID,
  },
  tiktok: {
    name: 'tiktok',
    displayName: 'TikTok',
    icon: '🎵',
    color: 'from-gray-800 to-pink-600',
    description: 'Monitor comments on your TikTok videos',
    enabled: !!process.env.TIKTOK_CLIENT_ID,
  },
}

// Generate OAuth authorization URL
export function getAuthorizationUrl(platform: Platform, state: string): string {
  const config = oauthConfigs[platform]

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope.join(' '),
    response_type: 'code',
    state,
  })

  // Platform-specific parameters
  if (platform === 'youtube') {
    params.append('access_type', 'offline')
    params.append('prompt', 'consent')
  }

  if (platform === 'tiktok') {
    params.set('response_type', 'code')
  }

  return `${config.authorizationUrl}?${params.toString()}`
}

// Validate OAuth configuration
export function validateOAuthConfig(platform: Platform): boolean {
  const config = oauthConfigs[platform]
  return !!(
    config.clientId &&
    config.clientSecret &&
    config.redirectUri &&
    process.env.NEXT_PUBLIC_APP_URL
  )
}
