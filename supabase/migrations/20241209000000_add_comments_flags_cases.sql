-- Add tables for comments, flags, and cases
-- This completes the core data model for the Haters platform

-- =====================================================
-- COMMENTS TABLE
-- Stores ingested comments from social media platforms
-- =====================================================
create table comments (
  id uuid default gen_random_uuid() primary key,
  social_account_id uuid references social_accounts(id) on delete cascade not null,
  platform_comment_id text not null,
  content text not null,
  author_name text,
  author_handle text,
  url text,
  metadata jsonb default '{}'::jsonb,
  posted_at timestamp with time zone,
  ingested_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure we don't ingest the same comment twice
  unique(social_account_id, platform_comment_id)
);

-- Add index for efficient queries
create index comments_social_account_id_idx on comments(social_account_id);
create index comments_posted_at_idx on comments(posted_at desc);
create index comments_ingested_at_idx on comments(ingested_at desc);

-- Enable RLS
alter table comments enable row level security;

-- Users can view comments from their own social accounts
create policy "Users can view their own comments." on comments
  for select using (
    social_account_id in (
      select id from social_accounts where user_id = (select auth.uid())
    )
  );

-- Users can insert comments for their own social accounts
create policy "Users can insert comments for their accounts." on comments
  for insert with check (
    social_account_id in (
      select id from social_accounts where user_id = (select auth.uid())
    )
  );

-- Users can update comments from their own social accounts
create policy "Users can update their own comments." on comments
  for update using (
    social_account_id in (
      select id from social_accounts where user_id = (select auth.uid())
    )
  );

-- Users can delete comments from their own social accounts
create policy "Users can delete their own comments." on comments
  for delete using (
    social_account_id in (
      select id from social_accounts where user_id = (select auth.uid())
    )
  );

-- =====================================================
-- FLAGS TABLE
-- Stores AI-generated flags for potentially problematic comments
-- =====================================================
create table flags (
  id uuid default gen_random_uuid() primary key,
  comment_id uuid references comments(id) on delete cascade not null,
  confidence_score decimal(5,4) check (confidence_score >= 0 and confidence_score <= 1),
  category text not null check (category in ('defamation', 'threat', 'harassment', 'hate_speech', 'discrimination', 'other')),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'approved', 'dismissed')),
  ai_reasoning text,
  ai_model text,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add indexes for efficient queries
create index flags_comment_id_idx on flags(comment_id);
create index flags_status_idx on flags(status);
create index flags_category_idx on flags(category);
create index flags_confidence_score_idx on flags(confidence_score desc);
create index flags_created_at_idx on flags(created_at desc);

-- Enable RLS
alter table flags enable row level security;

-- Users can view flags for their own comments
create policy "Users can view flags for their comments." on flags
  for select using (
    comment_id in (
      select c.id from comments c
      join social_accounts sa on c.social_account_id = sa.id
      where sa.user_id = (select auth.uid())
    )
  );

-- System can insert flags (this will be done via service role or edge functions)
-- Users cannot directly insert flags
create policy "Service role can insert flags." on flags
  for insert with check (
    -- Only allow inserts from service role or authenticated users for their own comments
    comment_id in (
      select c.id from comments c
      join social_accounts sa on c.social_account_id = sa.id
      where sa.user_id = (select auth.uid())
    )
  );

-- Users can update flags for their own comments (e.g., changing status)
create policy "Users can update flags for their comments." on flags
  for update using (
    comment_id in (
      select c.id from comments c
      join social_accounts sa on c.social_account_id = sa.id
      where sa.user_id = (select auth.uid())
    )
  );

-- =====================================================
-- CASES TABLE
-- Stores legal cases created from approved flags
-- =====================================================
create table cases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  flag_id uuid references flags(id) on delete restrict not null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'closed')),
  jurisdiction text not null default 'IT' check (jurisdiction in ('IT', 'EU', 'US', 'UK', 'OTHER')),
  evidence_snapshot jsonb not null default '{}'::jsonb,
  legal_notes text,
  assigned_to uuid references auth.users(id),
  submitted_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  closed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure each flag only has one case
  unique(flag_id)
);

-- Add indexes for efficient queries
create index cases_user_id_idx on cases(user_id);
create index cases_flag_id_idx on cases(flag_id);
create index cases_status_idx on cases(status);
create index cases_assigned_to_idx on cases(assigned_to);
create index cases_created_at_idx on cases(created_at desc);

-- Enable RLS
alter table cases enable row level security;

-- Users can view their own cases
create policy "Users can view their own cases." on cases
  for select using ((select auth.uid()) = user_id);

-- Users can insert their own cases
create policy "Users can insert their own cases." on cases
  for insert with check ((select auth.uid()) = user_id);

-- Users can update their own cases
create policy "Users can update their own cases." on cases
  for update using ((select auth.uid()) = user_id);

-- Users can delete their own cases (only if in draft status)
create policy "Users can delete their draft cases." on cases
  for delete using ((select auth.uid()) = user_id and status = 'draft');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add triggers to automatically update updated_at
create trigger update_comments_updated_at
  before update on comments
  for each row
  execute function update_updated_at_column();

create trigger update_flags_updated_at
  before update on flags
  for each row
  execute function update_updated_at_column();

create trigger update_cases_updated_at
  before update on cases
  for each row
  execute function update_updated_at_column();

-- Also add trigger to social_accounts and profiles for consistency
create trigger update_social_accounts_updated_at
  before update on social_accounts
  for each row
  execute function update_updated_at_column();

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- STATISTICS VIEW (OPTIONAL)
-- Useful for dashboard analytics
-- =====================================================

create or replace view user_statistics as
select
  u.id as user_id,
  u.email,
  count(distinct sa.id) as connected_accounts,
  count(distinct c.id) as total_comments,
  count(distinct f.id) as total_flags,
  count(distinct f.id) filter (where f.status = 'pending') as pending_flags,
  count(distinct f.id) filter (where f.status = 'approved') as approved_flags,
  count(distinct ca.id) as total_cases,
  count(distinct ca.id) filter (where ca.status = 'submitted') as submitted_cases,
  count(distinct ca.id) filter (where ca.status = 'accepted') as accepted_cases
from auth.users u
left join social_accounts sa on sa.user_id = u.id
left join comments c on c.social_account_id = sa.id
left join flags f on f.comment_id = c.id
left join cases ca on ca.user_id = u.id
group by u.id, u.email;

-- Grant access to the view
grant select on user_statistics to authenticated;
