import type { PlatformClient, RawComment, FetchOptions } from './types'

/**
 * Instagram API Client
 * Uses Instagram Basic Display API or Instagram Graph API
 */
export class InstagramClient implements PlatformClient {
  platform = 'instagram' as const
  private baseUrl = 'https://graph.instagram.com'

  /**
   * Fetch comments from Instagram posts
   */
  async fetchComments(
    accessToken: string,
    options: FetchOptions = {}
  ): Promise<RawComment[]> {
    const { limit = 100, maxPages = 5 } = options
    const comments: RawComment[] = []

    try {
      // First, get user's media (posts)
      const mediaResponse = await fetch(
        `${this.baseUrl}/me/media?fields=id,caption,media_type,timestamp,permalink&limit=${Math.min(limit, 25)}&access_token=${accessToken}`
      )

      if (!mediaResponse.ok) {
        throw new Error(`Failed to fetch Instagram media: ${mediaResponse.statusText}`)
      }

      const mediaData = await mediaResponse.json()

      if (!mediaData.data || mediaData.data.length === 0) {
        return []
      }

      // For each post, fetch comments
      for (const media of mediaData.data.slice(0, maxPages)) {
        try {
          const commentsResponse = await fetch(
            `${this.baseUrl}/${media.id}/comments?fields=id,text,username,timestamp&access_token=${accessToken}`
          )

          if (!commentsResponse.ok) {
            console.error(`Failed to fetch comments for media ${media.id}`)
            continue
          }

          const commentsData = await commentsResponse.json()

          if (commentsData.data && Array.isArray(commentsData.data)) {
            for (const comment of commentsData.data) {
              comments.push({
                id: comment.id,
                text: comment.text || '',
                author: {
                  id: comment.username || 'unknown',
                  name: comment.username || 'Unknown User',
                  username: comment.username,
                },
                timestamp: comment.timestamp || new Date().toISOString(),
                url: media.permalink || undefined,
                metadata: {
                  mediaId: media.id,
                  mediaType: media.media_type,
                  mediaCaption: media.caption,
                },
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching comments for media ${media.id}:`, error)
          continue
        }
      }

      return comments
    } catch (error) {
      console.error('Instagram API error:', error)
      throw new Error(
        `Failed to fetch Instagram comments: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate Instagram access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?fields=id,username&access_token=${accessToken}`
      )

      return response.ok
    } catch {
      return false
    }
  }
}
