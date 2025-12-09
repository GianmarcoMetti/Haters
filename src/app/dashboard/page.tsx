import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/dashboard/stat-card'
import {
  Users,
  MessageSquare,
  Flag,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import type { UserStatistics } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user statistics from the view
  const { data: stats, error } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', user.id)
    .single<UserStatistics>()

  if (error) {
    console.error('Error fetching statistics:', error)
  }

  // Default stats if query fails
  const userStats: UserStatistics = stats || {
    user_id: user.id,
    email: user.email,
    connected_accounts: 0,
    total_comments: 0,
    total_flags: 0,
    pending_flags: 0,
    approved_flags: 0,
    total_cases: 0,
    submitted_cases: 0,
    accepted_cases: 0
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {userStats.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Connected Accounts"
          value={userStats.connected_accounts}
          description="Social media accounts linked"
          icon={Users}
        />

        <StatCard
          title="Total Comments"
          value={userStats.total_comments}
          description="Comments ingested from your accounts"
          icon={MessageSquare}
        />

        <StatCard
          title="Flagged Content"
          value={userStats.total_flags}
          description="Comments flagged by AI"
          icon={Flag}
        />

        <StatCard
          title="Pending Review"
          value={userStats.pending_flags}
          description="Flags awaiting your review"
          icon={AlertCircle}
          className="border-orange-200 dark:border-orange-900"
        />

        <StatCard
          title="Approved Flags"
          value={userStats.approved_flags}
          description="Flags you've approved"
          icon={CheckCircle}
          className="border-green-200 dark:border-green-900"
        />

        <StatCard
          title="Legal Cases"
          value={userStats.total_cases}
          description={`${userStats.submitted_cases} submitted, ${userStats.accepted_cases} accepted`}
          icon={FileText}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/dashboard/accounts"
            className="flex flex-col items-center justify-center rounded-lg border p-6 hover:bg-accent transition-colors"
          >
            <Users className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">Connect Account</span>
            <span className="text-sm text-muted-foreground">Link social media</span>
          </a>

          <a
            href="/dashboard/flags"
            className="flex flex-col items-center justify-center rounded-lg border p-6 hover:bg-accent transition-colors"
          >
            <Flag className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">Review Flags</span>
            <span className="text-sm text-muted-foreground">{userStats.pending_flags} pending</span>
          </a>

          <a
            href="/dashboard/cases"
            className="flex flex-col items-center justify-center rounded-lg border p-6 hover:bg-accent transition-colors"
          >
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <span className="font-medium">View Cases</span>
            <span className="text-sm text-muted-foreground">{userStats.total_cases} total</span>
          </a>
        </div>
      </div>

      {/* Getting Started */}
      {userStats.connected_accounts === 0 && (
        <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-6">
          <h3 className="font-semibold text-lg mb-2">Get Started</h3>
          <p className="text-muted-foreground mb-4">
            Connect your first social media account to start monitoring comments and protecting your online presence.
          </p>
          <a
            href="/dashboard/accounts"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Connect Your First Account
          </a>
        </div>
      )}
    </div>
  )
}
