import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Legal Cases</h1>
        <p className="text-muted-foreground mt-2">
          Manage your legal case submissions and track their progress
        </p>
      </div>

      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          Case management coming soon. Your legal cases will be tracked and managed here.
        </p>
      </div>
    </div>
  )
}
