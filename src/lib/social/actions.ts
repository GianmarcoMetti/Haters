'use server'

import { createClient } from '@/lib/supabase/server'
import { IngestionService } from './ingestion-service'
import type { SocialAccount } from '@/types/database'
import { revalidatePath } from 'next/cache'

/**
 * Sync comments for a specific social account
 */
export async function syncAccountComments(accountId: string) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Fetch the account (RLS will ensure user owns it)
    const { data: account, error: fetchError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !account) {
      return { error: 'Account not found' }
    }

    // Ingest comments
    const ingestionService = new IngestionService()
    const result = await ingestionService.ingestCommentsForAccount(
      account as SocialAccount
    )

    // Revalidate pages that show comment data
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/comments')
    revalidatePath('/dashboard/accounts')

    return { success: true, result }
  } catch (error) {
    console.error('Sync error:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to sync comments',
    }
  }
}

/**
 * Sync comments for all user's accounts
 */
export async function syncAllComments() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Ingest comments from all accounts
    const ingestionService = new IngestionService()
    const results = await ingestionService.ingestCommentsForUser(user.id)

    // Revalidate pages
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/comments')
    revalidatePath('/dashboard/accounts')

    // Calculate totals
    const totals = results.reduce(
      (acc, result) => ({
        found: acc.found + result.commentsFound,
        ingested: acc.ingested + result.commentsIngested,
        duplicates: acc.duplicates + result.commentsDuplicate,
        errors: acc.errors + result.errors.length,
      }),
      { found: 0, ingested: 0, duplicates: 0, errors: 0 }
    )

    return { success: true, results, totals }
  } catch (error) {
    console.error('Sync all error:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to sync comments',
    }
  }
}

/**
 * Get sync history/stats for an account
 */
export async function getAccountSyncStats(accountId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get comment count for this account
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('social_account_id', accountId)

    if (error) {
      throw error
    }

    // Get most recent comment timestamp
    const { data: recentComment } = await supabase
      .from('comments')
      .select('ingested_at')
      .eq('social_account_id', accountId)
      .order('ingested_at', { ascending: false })
      .limit(1)
      .single()

    return {
      success: true,
      stats: {
        totalComments: count || 0,
        lastSyncAt: recentComment?.ingested_at || null,
      },
    }
  } catch (error) {
    console.error('Get stats error:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to get stats',
    }
  }
}
