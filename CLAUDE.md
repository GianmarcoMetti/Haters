# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Haters is a digital startup offering a semi-automated legal service for social media users who receive potentially defamatory or illegal comments. The platform connects social accounts, analyzes comments using AI to flag potential legal violations, and generates legal bundles for partner lawyers.

**Core workflow**: Connect social accounts → AI analyzes comments → User reviews flags → Generate legal bundles → Partner lawyer verification.

**Business model**: Success-fee based.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **UI**: React 19, Tailwind CSS 4, lucide-react icons, sonner for toasts
- **AI**: OpenAI API for comment classification (provider-agnostic design)
- **Styling utilities**: class-variance-authority, clsx, tailwind-merge
- **Theme**: next-themes for dark/light mode support

## Common Commands

```bash
# Development
npm run dev                    # Start Next.js dev server (http://localhost:3000)

# Production
npm run build                  # Build for production
npm start                      # Start production server

# Code Quality
npm run lint                   # Run ESLint

# Supabase Local Development
supabase start                 # Start local Supabase (API: http://127.0.0.1:54321, Studio: http://127.0.0.1:54323)
supabase stop                  # Stop local Supabase
supabase db reset              # Reset database and run migrations/seeds
supabase db push               # Push migration changes to remote
supabase migration new <name>  # Create new migration file
supabase gen types typescript --local > src/types/supabase.ts  # Generate TypeScript types from schema (run after migrations)
```

## Architecture & Code Structure

### Supabase Client Patterns

The codebase uses three distinct Supabase client patterns based on execution context:

1. **Client Components** (`src/lib/supabase/client.ts`):
   - Uses `createBrowserClient` from `@supabase/ssr`
   - For React Client Components that run in the browser

2. **Server Components/Actions** (`src/lib/supabase/server.ts`):
   - Uses `createServerClient` from `@supabase/ssr`
   - Async function that handles cookie management via Next.js `cookies()` API
   - For Server Components, Server Actions, and Route Handlers
   - MUST be awaited: `const supabase = await createClient()`

3. **Middleware** (`src/lib/supabase/middleware.ts`):
   - Separate middleware-specific client for session refresh
   - Call `updateSession(request)` in your Next.js middleware
   - Must return the response object unchanged to preserve cookies

**Critical**: Always use the correct client for your execution context. Server actions (files with `'use server'`) MUST use the server client.

### Authentication Flow

- **Auth provider**: Supabase Auth with email/password
- **Login/Signup**: Server actions in `src/app/login/actions.ts`
  - `login(formData)`: Email/password sign in
  - `signup(formData)`: Email/password sign up with full_name metadata
  - `signout()`: Sign out and redirect to /login
- **Profile creation**: Automatic via database trigger (`handle_new_user()`) that creates profile record when new user signs up
- **Sign out route**: `src/app/auth/signout/route.ts`

### Database Schema

**Migration files**:
- `supabase/migrations/20240101000000_initial_schema.sql` - Users and social accounts
- `supabase/migrations/20241209000000_add_comments_flags_cases.sql` - Core data model

**Tables**:

1. **`profiles`**: User profiles (id, username, full_name, avatar_url, website)
   - Linked to `auth.users` via trigger on user creation
   - RLS enabled: public read, users can insert/update own profile

2. **`social_accounts`**: Connected social media accounts
   - Fields: platform (enum: instagram/facebook/youtube/tiktok), platform_user_id, access_token, refresh_token, token_expires_at
   - Unique constraint on (user_id, platform) - one account per platform per user
   - RLS enabled: users can only access their own social accounts

3. **`comments`**: Ingested social media comments
   - Fields: social_account_id, platform_comment_id, content, author_name, author_handle, url, metadata (jsonb), posted_at, ingested_at
   - Unique constraint on (social_account_id, platform_comment_id) - prevents duplicate ingestion
   - Indexes on social_account_id, posted_at, ingested_at
   - RLS enabled: users can only access comments from their own social accounts
   - Cascading delete when social account is removed

4. **`flags`**: AI-generated flags for potentially problematic comments
   - Fields: comment_id, confidence_score (0-1), category (defamation/threat/harassment/hate_speech/discrimination/other), status (pending/reviewed/approved/dismissed), ai_reasoning, ai_model, reviewed_at
   - Indexes on comment_id, status, category, confidence_score, created_at
   - RLS enabled: users can view/update flags for their own comments
   - Cascading delete when comment is removed

5. **`cases`**: Legal case bundles created from approved flags
   - Fields: user_id, flag_id, status (draft/submitted/under_review/accepted/rejected/closed), jurisdiction (IT/EU/US/UK/OTHER), evidence_snapshot (jsonb), legal_notes, assigned_to, submitted_at, reviewed_at, closed_at
   - Unique constraint on flag_id - each flag can only have one case
   - Indexes on user_id, flag_id, status, assigned_to, created_at
   - RLS enabled: users can only access their own cases
   - Restrict delete on flag (cannot delete flag if case exists)

**Helper Functions**:
- `update_updated_at_column()`: Automatically updates the updated_at timestamp on row updates
- Applied via triggers to all tables

**Views**:
- `user_statistics`: Aggregated stats per user (connected accounts, comments, flags by status, cases by status)
- Useful for dashboard analytics

### Path Aliases

- `@/*` maps to `./src/*` (configured in tsconfig.json)
- Use for all imports: `import { createClient } from '@/lib/supabase/server'`

### Environment Variables

Required for Supabase connection:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous/public key

Local development uses Supabase local instance (no remote env vars needed when running `supabase start`).

### Local Development Setup

1. Run `supabase start` to start local Supabase stack
2. Run `npm run dev` to start Next.js dev server
3. Access Supabase Studio at http://127.0.0.1:54323 for database management
4. Email testing available at http://127.0.0.1:54324 (Inbucket)

### OAuth Integration (Implemented)

Social media account connection via OAuth 2.0 for Instagram, Facebook, YouTube, and TikTok.

**Architecture**:
- `src/lib/oauth/config.ts` - Platform configurations and OAuth URLs
- `src/lib/oauth/actions.ts` - Server actions for initiating OAuth and managing accounts
- `src/app/api/oauth/callback/[platform]/route.ts` - OAuth callback handler (dynamic route)
- `src/components/accounts/` - UI components for account connection and management

**OAuth Flow**:
1. User clicks "Connect" on platform card
2. Server action generates OAuth authorization URL with state parameter (CSRF protection)
3. User redirected to platform's OAuth consent page
4. Platform redirects back to `/api/oauth/callback/[platform]` with authorization code
5. Callback route exchanges code for access token
6. Token and platform user ID stored in `social_accounts` table
7. User redirected to accounts page with success message

**Environment Variables Required**:
```bash
# Instagram (Meta/Facebook)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Facebook (Meta)
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# YouTube (Google)
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret

# TikTok
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# App URL (for OAuth redirect URIs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting OAuth Credentials**:
- **Instagram/Facebook**: Create app at https://developers.facebook.com
- **YouTube**: Create project at https://console.cloud.google.com and enable YouTube Data API v3
- **TikTok**: Register at https://developers.tiktok.com

**Security Features**:
- State parameter for CSRF protection
- Tokens stored server-side only (never exposed to client)
- RLS policies ensure users can only access their own accounts
- Token expiration tracking with `token_expires_at` field

**Account Management**:
- View connected accounts with platform info and connection date
- Disconnect accounts (cascading delete removes associated comments/flags/cases)
- Token expiration warnings
- Confirmation dialog before disconnection

### Planned Features (Not Yet Implemented)

Per README.md design:

- **Token Refresh**: Automatic refresh of expired OAuth tokens
- **AI Service** (`src/lib/ai/`): OpenAI integration for comment classification (severity, category, confidence scoring)
  - Database schema ready: `flags` table with category, confidence_score, ai_reasoning fields
- **Social Media API Clients** (`src/lib/social/`): Platform-specific API clients for fetching comments
  - OAuth integration complete, ready for API implementation
- **Comment Ingestion Pipeline**: System to fetch and store comments from connected social accounts
  - Database schema ready: `comments` table with unique constraint to prevent duplicates
- **Admin UI**: Dashboard for legal partners to review cases
  - Database schema ready: `cases` table with assigned_to field for lawyer assignment
- **Webhooks** (`supabase/functions/`): Real-time webhook handlers for social platform events

### Key Design Principles

- **Provider-agnostic AI**: Designed to support multiple AI providers beyond OpenAI
- **Row Level Security**: All user data tables use RLS policies
- **Server Actions**: Prefer server actions over API routes for data mutations
- **Type Safety**: Strict TypeScript with generated Supabase types
