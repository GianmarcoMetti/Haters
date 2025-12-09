import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { platformConfigs } from '@/lib/oauth/config'
import { MessageSquare, ExternalLink } from 'lucide-react'
import type { Comment } from '@/types/database'

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: { limit?: string; offset?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const limit = parseInt(searchParams.limit || '50')
  const offset = parseInt(searchParams.offset || '0')

  // Fetch comments with social account info
  const { data: comments, error, count } = await supabase
    .from('comments')
    .select(`
      *,
      social_accounts!inner(platform, user_id)
    `, { count: 'exact' })
    .eq('social_accounts.user_id', user.id)
    .order('posted_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const totalComments = count || 0
  const commentsList = (comments || []) as (Comment & {
    social_accounts: { platform: string }
  })[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
          <p className="text-muted-foreground mt-2">
            {totalComments} comments ingested from your social accounts
          </p>
        </div>
      </div>

      {/* Comments List */}
      {commentsList.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Comments Yet</h3>
            <p className="text-muted-foreground">
              Connect your social accounts and sync to start ingesting comments.
            </p>
            <a
              href="/dashboard/accounts"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Go to Social Accounts →
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {commentsList.map((comment) => {
            const platform = comment.social_accounts?.platform as keyof typeof platformConfigs
            const config = platformConfigs[platform]

            return (
              <Card key={comment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-lg p-1.5 rounded bg-gradient-to-br ${config?.color || 'from-gray-500 to-gray-600'}`}>
                        {config?.icon || '📱'}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {comment.author_name}
                          {comment.author_handle && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              @{comment.author_handle}
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(comment.posted_at || comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {comment.url && (
                      <a
                        href={comment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

                  {Object.keys(comment.metadata || {}).length > 0 && (
                    <details className="mt-3 text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        Metadata
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(comment.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalComments > limit && (
        <div className="flex justify-center gap-2">
          {offset > 0 && (
            <a
              href={`/dashboard/comments?offset=${Math.max(0, offset - limit)}&limit=${limit}`}
              className="px-4 py-2 rounded border hover:bg-accent transition-colors"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-muted-foreground">
            {offset + 1} - {Math.min(offset + limit, totalComments)} of {totalComments}
          </span>
          {offset + limit < totalComments && (
            <a
              href={`/dashboard/comments?offset=${offset + limit}&limit=${limit}`}
              className="px-4 py-2 rounded border hover:bg-accent transition-colors"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}
