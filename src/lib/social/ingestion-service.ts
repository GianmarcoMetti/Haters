import { createClient } from '@/lib/supabase/server'
import { InstagramClient } from './instagram-client'
import { FacebookClient } from './facebook-client'
import { YouTubeClient } from './youtube-client'
import { TikTokClient } from './tiktok-client'
import type {
  PlatformClient,
  RawComment,
  ProcessedComment,
  IngestionResult,
  FetchOptions,
} from './types'
import type { Platform, SocialAccount } from '@/types/database'

/**
 * Comment Ingestion Service
 * Coordinates fetching comments from all platforms and storing them
 */
export class IngestionService {
  private clients: Record<Platform, PlatformClient>

  constructor() {
    this.clients = {
      instagram: new InstagramClient(),
      facebook: new FacebookClient(),
      youtube: new YouTubeClient(),
      tiktok: new TikTokClient(),
    }
  }

  /**
   * Ingest comments for a specific social account
   */
  async ingestCommentsForAccount(
    account: SocialAccount,
    options?: FetchOptions
  ): Promise<IngestionResult> {
    const result: IngestionResult = {
      success: false,
      platform: account.platform,
      accountId: account.id,
      commentsFound: 0,
      commentsIngested: 0,
      commentsDuplicate: 0,
      errors: [],
      lastSyncAt: new Date().toISOString(),
    }

    try {
      const client = this.clients[account.platform]

      if (!client) {
        throw new Error(`No client available for platform: ${account.platform}`)
      }

      if (!account.access_token) {
        throw new Error('No access token available')
      }

      // Check if token is expired
      if (account.token_expires_at) {
        const expiresAt = new Date(account.token_expires_at)
        if (expiresAt < new Date()) {
          throw new Error('Access token has expired. Please reconnect your account.')
        }
      }

      // Validate token before fetching
      const isValid = await client.validateToken(account.access_token)
      if (!isValid) {
        throw new Error('Access token is invalid. Please reconnect your account.')
      }

      // Fetch raw comments from platform
      const rawComments = await client.fetchComments(account.access_token, options)
      result.commentsFound = rawComments.length

      if (rawComments.length === 0) {
        result.success = true
        return result
      }

      // Process and store comments
      const { ingested, duplicates, errors } = await this.storeComments(
        account.id,
        rawComments
      )

      result.commentsIngested = ingested
      result.commentsDuplicate = duplicates
      result.errors = errors
      result.success = errors.length === 0

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(errorMessage)
      console.error(`Ingestion error for account ${account.id}:`, error)
      return result
    }
  }

  /**
   * Ingest comments for all accounts of a user
   */
  async ingestCommentsForUser(
    userId: string,
    options?: FetchOptions
  ): Promise<IngestionResult[]> {
    const supabase = await createClient()

    // Fetch all user's social accounts
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)

    if (error || !accounts) {
      throw new Error('Failed to fetch social accounts')
    }

    // Ingest comments for each account in parallel
    const results = await Promise.all(
      accounts.map((account) =>
        this.ingestCommentsForAccount(account as SocialAccount, options)
      )
    )

    return results
  }

  /**
   * Store raw comments in database
   */
  private async storeComments(
    socialAccountId: string,
    rawComments: RawComment[]
  ): Promise<{
    ingested: number
    duplicates: number
    errors: string[]
  }> {
    const supabase = await createClient()
    let ingested = 0
    let duplicates = 0
    const errors: string[] = []

    for (const rawComment of rawComments) {
      try {
        const processedComment = this.processComment(rawComment)

        // Attempt to insert comment
        const { error } = await supabase.from('comments').insert({
          social_account_id: socialAccountId,
          platform_comment_id: processedComment.platform_comment_id,
          content: processedComment.content,
          author_name: processedComment.author_name,
          author_handle: processedComment.author_handle,
          url: processedComment.url,
          posted_at: processedComment.posted_at,
          metadata: processedComment.metadata,
        })

        if (error) {
          // Check if it's a duplicate (unique constraint violation)
          if (error.code === '23505') {
            duplicates++
          } else {
            errors.push(`Failed to insert comment ${rawComment.id}: ${error.message}`)
          }
        } else {
          ingested++
        }
      } catch (error) {
        errors.push(
          `Error processing comment ${rawComment.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        )
      }
    }

    return { ingested, duplicates, errors }
  }

  /**
   * Process raw comment into database format
   */
  private processComment(raw: RawComment): ProcessedComment {
    return {
      platform_comment_id: raw.id,
      content: raw.text,
      author_name: raw.author.name,
      author_handle: raw.author.username || null,
      url: raw.url || null,
      posted_at: raw.timestamp,
      metadata: raw.metadata || {},
    }
  }
}
