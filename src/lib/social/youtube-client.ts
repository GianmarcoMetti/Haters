import type { PlatformClient, RawComment, FetchOptions } from './types'

/**
 * YouTube API Client
 * Uses YouTube Data API v3
 */
export class YouTubeClient implements PlatformClient {
  platform = 'youtube' as const
  private baseUrl = 'https://www.googleapis.com/youtube/v3'

  /**
   * Fetch comments from YouTube videos
   */
  async fetchComments(
    accessToken: string,
    options: FetchOptions = {}
  ): Promise<RawComment[]> {
    const { limit = 100, maxPages = 5 } = options
    const comments: RawComment[] = []

    try {
      // Get user's channel
      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=id,snippet&mine=true&access_token=${accessToken}`
      )

      if (!channelResponse.ok) {
        throw new Error(`Failed to fetch YouTube channel: ${channelResponse.statusText}`)
      }

      const channelData = await channelResponse.json()

      if (!channelData.items || channelData.items.length === 0) {
        return []
      }

      const channelId = channelData.items[0].id

      // Get channel's videos
      const videosResponse = await fetch(
        `${this.baseUrl}/search?part=id&channelId=${channelId}&type=video&order=date&maxResults=25&access_token=${accessToken}`
      )

      if (!videosResponse.ok) {
        throw new Error(`Failed to fetch YouTube videos: ${videosResponse.statusText}`)
      }

      const videosData = await videosResponse.json()

      if (!videosData.items || videosData.items.length === 0) {
        return []
      }

      // For each video, fetch comment threads
      for (const video of videosData.items.slice(0, maxPages)) {
        try {
          const videoId = video.id.videoId

          let commentsUrl = `${this.baseUrl}/commentThreads?part=snippet&videoId=${videoId}&maxResults=${Math.min(limit, 100)}&textFormat=plainText&access_token=${accessToken}`

          const commentsResponse = await fetch(commentsUrl)

          if (!commentsResponse.ok) {
            // Video might have comments disabled
            console.error(`Failed to fetch comments for video ${videoId}`)
            continue
          }

          const commentsData = await commentsResponse.json()

          if (commentsData.items && Array.isArray(commentsData.items)) {
            for (const thread of commentsData.items) {
              const comment = thread.snippet.topLevelComment.snippet

              comments.push({
                id: thread.snippet.topLevelComment.id,
                text: comment.textDisplay || '',
                author: {
                  id: comment.authorChannelId?.value || 'unknown',
                  name: comment.authorDisplayName || 'Unknown User',
                },
                timestamp: comment.publishedAt || new Date().toISOString(),
                url: `https://www.youtube.com/watch?v=${videoId}&lc=${thread.snippet.topLevelComment.id}`,
                metadata: {
                  videoId: videoId,
                  likeCount: comment.likeCount || 0,
                  replyCount: thread.snippet.totalReplyCount || 0,
                  updatedAt: comment.updatedAt,
                },
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching comments for video ${video.id.videoId}:`, error)
          continue
        }
      }

      return comments
    } catch (error) {
      console.error('YouTube API error:', error)
      throw new Error(
        `Failed to fetch YouTube comments: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate YouTube access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/channels?part=id&mine=true&access_token=${accessToken}`
      )

      return response.ok
    } catch {
      return false
    }
  }
}
