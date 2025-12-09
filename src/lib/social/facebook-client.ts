import type { PlatformClient, RawComment, FetchOptions } from './types'

/**
 * Facebook API Client
 * Uses Facebook Graph API to fetch Page comments
 */
export class FacebookClient implements PlatformClient {
  platform = 'facebook' as const
  private baseUrl = 'https://graph.facebook.com/v18.0'

  /**
   * Fetch comments from Facebook Page posts
   */
  async fetchComments(
    accessToken: string,
    options: FetchOptions = {}
  ): Promise<RawComment[]> {
    const { limit = 100, since, maxPages = 5 } = options
    const comments: RawComment[] = []

    try {
      // Get user's pages
      const pagesResponse = await fetch(
        `${this.baseUrl}/me/accounts?access_token=${accessToken}`
      )

      if (!pagesResponse.ok) {
        throw new Error(`Failed to fetch Facebook pages: ${pagesResponse.statusText}`)
      }

      const pagesData = await pagesResponse.json()

      if (!pagesData.data || pagesData.data.length === 0) {
        return []
      }

      // Use the first page (can be extended to handle multiple pages)
      const page = pagesData.data[0]
      const pageAccessToken = page.access_token

      // Get page's posts
      let postsUrl = `${this.baseUrl}/${page.id}/posts?fields=id,message,created_time,permalink_url&limit=25&access_token=${pageAccessToken}`

      if (since) {
        postsUrl += `&since=${since}`
      }

      const postsResponse = await fetch(postsUrl)

      if (!postsResponse.ok) {
        throw new Error(`Failed to fetch Facebook posts: ${postsResponse.statusText}`)
      }

      const postsData = await postsResponse.json()

      if (!postsData.data || postsData.data.length === 0) {
        return []
      }

      // For each post, fetch comments
      for (const post of postsData.data.slice(0, maxPages)) {
        try {
          const commentsResponse = await fetch(
            `${this.baseUrl}/${post.id}/comments?fields=id,message,from,created_time,permalink_url&limit=${limit}&access_token=${pageAccessToken}`
          )

          if (!commentsResponse.ok) {
            console.error(`Failed to fetch comments for post ${post.id}`)
            continue
          }

          const commentsData = await commentsResponse.json()

          if (commentsData.data && Array.isArray(commentsData.data)) {
            for (const comment of commentsData.data) {
              comments.push({
                id: comment.id,
                text: comment.message || '',
                author: {
                  id: comment.from?.id || 'unknown',
                  name: comment.from?.name || 'Unknown User',
                },
                timestamp: comment.created_time || new Date().toISOString(),
                url: comment.permalink_url || post.permalink_url || undefined,
                metadata: {
                  postId: post.id,
                  postMessage: post.message,
                  pageId: page.id,
                  pageName: page.name,
                },
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching comments for post ${post.id}:`, error)
          continue
        }
      }

      return comments
    } catch (error) {
      console.error('Facebook API error:', error)
      throw new Error(
        `Failed to fetch Facebook comments: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate Facebook access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me?access_token=${accessToken}`
      )

      return response.ok
    } catch {
      return false
    }
  }
}
