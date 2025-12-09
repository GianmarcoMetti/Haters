export type Platform = 'instagram' | 'facebook' | 'youtube' | 'tiktok'

export type FlagCategory =
  | 'defamation'
  | 'threat'
  | 'harassment'
  | 'hate_speech'
  | 'discrimination'
  | 'other'

export type FlagStatus = 'pending' | 'reviewed' | 'approved' | 'dismissed'

export type CaseStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'closed'

export type Jurisdiction = 'IT' | 'EU' | 'US' | 'UK' | 'OTHER'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  updated_at: string | null
}

export interface SocialAccount {
  id: string
  user_id: string
  platform: Platform
  platform_user_id: string | null
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  social_account_id: string
  platform_comment_id: string
  content: string
  author_name: string | null
  author_handle: string | null
  url: string | null
  metadata: Record<string, any>
  posted_at: string | null
  ingested_at: string
  created_at: string
  updated_at: string
}

export interface Flag {
  id: string
  comment_id: string
  confidence_score: number | null
  category: FlagCategory
  status: FlagStatus
  ai_reasoning: string | null
  ai_model: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  user_id: string
  flag_id: string
  status: CaseStatus
  jurisdiction: Jurisdiction
  evidence_snapshot: Record<string, any>
  legal_notes: string | null
  assigned_to: string | null
  submitted_at: string | null
  reviewed_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface UserStatistics {
  user_id: string
  email: string | null
  connected_accounts: number
  total_comments: number
  total_flags: number
  pending_flags: number
  approved_flags: number
  total_cases: number
  submitted_cases: number
  accepted_cases: number
}
