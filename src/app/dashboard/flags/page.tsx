import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function FlagsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flagged Content</h1>
        <p className="text-muted-foreground mt-2">
          Review comments flagged by AI as potentially problematic
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          AI flagging system coming soon. Potentially problematic comments will be flagged and displayed here for your review.
        </p>
      </div>
    </div>
  )
}
