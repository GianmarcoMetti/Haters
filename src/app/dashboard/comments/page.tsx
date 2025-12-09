import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CommentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
        <p className="text-muted-foreground mt-2">
          View all comments ingested from your social accounts
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          Comment ingestion coming soon. Comments from your connected accounts will appear here.
        </p>
      </div>
    </div>
  )
}
