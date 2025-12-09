import type { PlatformClient, RawComment, FetchOptions } from './types'

/**
 * TikTok API Client
 * Uses TikTok API v2
 */
export class TikTokClient implements PlatformClient {
  platform = 'tiktok' as const
  private baseUrl = 'https://open.tiktokapis.com/v2'

  /**
   * Fetch comments from TikTok videos
   */
  async fetchComments(
    accessToken: string,
    options: FetchOptions = {}
  ): Promise<RawComment[]> {
    const { limit = 100, maxPages = 5 } = options
    const comments: RawComment[] = []

    try {
      // Get user's videos
      const videosResponse = await fetch(
        `${this.baseUrl}/video/list/?fields=id,title,create_time,share_url&max_count=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!videosResponse.ok) {
        throw new Error(`Failed to fetch TikTok videos: ${videosResponse.statusText}`)
      }

      const videosData = await videosResponse.json()

      if (!videosData.data?.videos || videosData.data.videos.length === 0) {
        return []
      }

      // For each video, fetch comments
      for (const video of videosData.data.videos.slice(0, maxPages)) {
        try {
          // Note: TikTok comment API requires additional permissions
          // and may not be available for all developers
          const commentsResponse = await fetch(
            `${this.baseUrl}/video/comment/list/?video_id=${video.id}&max_count=${Math.min(limit, 50)}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (!commentsResponse.ok) {
            console.error(`Failed to fetch comments for video ${video.id}`)
            continue
          }

          const commentsData = await commentsResponse.json()

          if (commentsData.data?.comments && Array.isArray(commentsData.data.comments)) {
            for (const comment of commentsData.data.comments) {
              comments.push({
                id: comment.id,
                text: comment.text || '',
                author: {
                  id: comment.user_id || 'unknown',
                  name: comment.user_name || 'Unknown User',
                  username: comment.unique_id,
                },
                timestamp: new Date(comment.create_time * 1000).toISOString(),
                url: video.share_url || undefined,
                metadata: {
                  videoId: video.id,
                  videoTitle: video.title,
                  likeCount: comment.like_count || 0,
                  replyCount: comment.reply_count || 0,
                },
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching comments for video ${video.id}:`, error)
          continue
        }
      }

      return comments
    } catch (error) {
      console.error('TikTok API error:', error)
      throw new Error(
        `Failed to fetch TikTok comments: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate TikTok access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/info/?fields=open_id,display_name`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.ok
    } catch {
      return false
    }
  }
}
