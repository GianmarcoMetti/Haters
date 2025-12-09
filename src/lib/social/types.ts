import type { Platform } from '@/types/database'

/**
 * Raw comment data from social media platforms
 */
export interface RawComment {
  id: string // Platform's comment ID
  text: string // Comment content
  author: {
    id: string
    name: string
    username?: string
  }
  timestamp: string // ISO 8601
  url?: string // Direct link to comment
  metadata?: Record<string, any> // Platform-specific data
}

/**
 * Processed comment ready for database storage
 */
export interface ProcessedComment {
  platform_comment_id: string
  content: string
  author_name: string
  author_handle: string | null
  url: string | null
  posted_at: string
  metadata: Record<string, any>
}

/**
 * Result of comment ingestion
 */
export interface IngestionResult {
  success: boolean
  platform: Platform
  accountId: string
  commentsFound: number
  commentsIngested: number
  commentsDuplicate: number
  errors: string[]
  lastSyncAt: string
}

/**
 * Platform API client interface
 */
export interface PlatformClient {
  platform: Platform
  fetchComments(accessToken: string, options?: FetchOptions): Promise<RawComment[]>
  validateToken(accessToken: string): Promise<boolean>
}

/**
 * Options for fetching comments
 */
export interface FetchOptions {
  limit?: number
  since?: string // ISO 8601 timestamp
  until?: string // ISO 8601 timestamp
  maxPages?: number
}

/**
 * API Rate limit info
 */
export interface RateLimitInfo {
  remaining: number
  reset: number // Unix timestamp
  limit: number
}
