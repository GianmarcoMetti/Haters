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

**Required for all environments**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous/public key (safe to expose - protected by RLS)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only, never expose to client)
- `NEXT_PUBLIC_APP_URL`: Application URL (e.g., http://localhost:3000 or https://your-app.vercel.app)

**OAuth Credentials** (see OAuth Integration section for details):
- `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`
- `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`
- `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`
- `TIKTOK_CLIENT_ID`, `TIKTOK_CLIENT_SECRET`

Local development uses Supabase local instance (remote Supabase env vars still needed for production features).

### Production Deployment (Vercel)

**Status**: ✅ Successfully deployed

**Deployment Platform**: Vercel (connected to GitHub repository)

**Production URLs**:
- Main app: Check Vercel dashboard for current deployment URL
- Privacy Policy: `/privacy`
- Terms of Service: `/terms`
- User Data Deletion: `/data-deletion`

**Deployment Notes**:
- Automatic deployments on push to `main` branch
- Environment variables configured in Vercel dashboard (Settings → Environment Variables)
- All environment variables must be set for "All Environments" (Production, Preview, Development)

**Critical Configuration**:
1. **Next.js 16 Compatibility**: The app uses Next.js 16, which has breaking changes:
   - Dynamic route `params` are now async (must use `await params`)
   - OAuth callback route at `src/app/api/oauth/callback/[platform]/route.ts` has been updated
   - All route handlers with dynamic params must await the params Promise

2. **Vercel Configuration**: `vercel.json` configured for optimal deployment
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build`
   - Region: iad1 (Washington DC)

3. **Known Issues & Fixes**:
   - TypeScript strict mode requires explicit return types for server actions
   - Email field from Supabase auth can be `undefined`, convert to `null` for database consistency
   - OAuth redirect URIs must match exactly between platform developer consoles and environment variables

**Deployment Checklist**:
- ✅ All TypeScript errors resolved
- ✅ Environment variables configured
- ✅ Build succeeds on Vercel
- ✅ Middleware authentication working
- ⏳ Supabase redirect URLs need updating with production URL
- ⏳ Facebook/Meta app configuration needs production URLs (Privacy Policy, Terms, Data Deletion)
- ⏳ OAuth redirect URIs need updating in platform developer consoles

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
  - Requires: Privacy Policy URL, Terms of Service URL, User Data Deletion URL
  - App Review required for production (public access)
  - Facebook and Instagram share the same App ID and Secret
- **YouTube**: Create project at https://console.cloud.google.com and enable YouTube Data API v3
  - Create OAuth 2.0 credentials with authorized redirect URIs
- **TikTok**: Register at https://developers.tiktok.com
  - Comment API requires special permissions (not available to all developers)

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

### Legal & Policy Pages (Implemented)

Required pages for OAuth app submission (especially Facebook/Meta) have been implemented:

**Routes**:
- `src/app/privacy/page.tsx` - Privacy Policy
- `src/app/terms/page.tsx` - Terms of Service
- `src/app/data-deletion/page.tsx` - User Data Deletion Instructions

**Privacy Policy** (`/privacy`):
- Data collection and usage explanation
- Third-party service integrations (Supabase, OpenAI, social platforms)
- Security measures (RLS, encryption, HTTPS)
- GDPR rights (access, rectification, erasure, portability, objection)
- Data retention policies
- Contact information

**Terms of Service** (`/terms`):
- Service description and acceptable use policy
- User account responsibilities
- Social media integration terms
- AI classification disclaimer (not legal advice)
- Intellectual property rights
- Limitation of liability
- Governing law (Italy)

**User Data Deletion** (`/data-deletion`):
- Three deletion methods:
  1. Self-service via dashboard settings (recommended)
  2. Email request with verification
  3. Individual social account disconnection
- Complete data deletion details (what gets deleted)
- Retention timeline (immediate marking, 30-day permanent deletion)
- Instructions for revoking OAuth permissions per platform
- GDPR compliance information

**Key Features**:
- Dynamic "Last updated" date using `new Date().toLocaleDateString()`
- Responsive design with Tailwind CSS
- Dark mode support via next-themes
- Clear navigation back to home
- Contact email for support: gianmarco.rnetti.design@gmail.com

**Usage**:
- Production URLs needed for Facebook/Meta app configuration
- Required before app can go through App Review process
- Must be publicly accessible (no authentication required)

### Comment Ingestion Pipeline (Implemented)

Automated comment fetching from connected social media accounts using platform APIs.

**Architecture**:
- `src/lib/social/types.ts` - Shared interfaces and types for all platforms
- `src/lib/social/instagram-client.ts` - Instagram API client (Basic Display API)
- `src/lib/social/facebook-client.ts` - Facebook API client (Graph API for Pages)
- `src/lib/social/youtube-client.ts` - YouTube API client (Data API v3)
- `src/lib/social/tiktok-client.ts` - TikTok API client (TikTok API v2)
- `src/lib/social/ingestion-service.ts` - Coordinating service for all platforms
- `src/lib/social/actions.ts` - Server actions for triggering syncs

**Ingestion Flow**:
1. User clicks "Sync" button on connected account or "Sync All Accounts"
2. Server action validates OAuth token and checks expiration
3. Platform-specific client fetches comments from recent posts/videos
4. Raw comments transformed to standardized format
5. Comments stored in database with deduplication (unique constraint on platform_comment_id + social_account_id)
6. Results returned showing found/ingested/duplicate counts

**Platform-Specific Details**:

**Instagram**:
- Fetches user's media (posts) via `/me/media`
- For each post, fetches comments via `/{media-id}/comments`
- Fields: id, text, username, timestamp
- Limited to last 25 posts (configurable)

**Facebook**:
- Fetches Pages via `/me/accounts`
- Gets Page posts with `/{ page-id}/posts`
- For each post, fetches comments via `/{post-id}/comments`
- Fields: id, message, from (name/id), created_time, permalink
- Uses Page access token for API calls

**YouTube**:
- Gets user's channel via `/channels?mine=true`
- Searches for channel videos via `/search?channelId=...`
- Fetches comment threads via `/commentThreads?videoId=...`
- Fields: id, textDisplay, authorDisplayName, publishedAt
- Supports pagination, max 100 comments per request

**TikTok**:
- Fetches user's videos via `/video/list`
- For each video, fetches comments via `/video/comment/list`
- Note: Comment API requires special permissions (not available to all developers)
- Fields: id, text, user_name, create_time

**Deduplication**:
- Database unique constraint on (social_account_id, platform_comment_id)
- Prevents duplicate ingestion across multiple syncs
- Returns count of duplicates in sync results

**Error Handling**:
- Token validation before fetching
- Expiration checks with user-friendly messages
- Per-post error handling (continues if one post fails)
- Detailed error reporting in sync results

**UI Features**:
- Individual account sync buttons with loading states
- "Sync All Accounts" button for batch processing
- Real-time sync results (found/ingested/duplicates)
- Sync statistics (total comments, last sync time)
- Comments list page with pagination
- Platform indicators and metadata display

**Rate Limiting**:
- Respects platform API quotas:
  - Instagram: ~200 requests/hour
  - Facebook: Varies by app/page
  - YouTube: 10,000 units/day (100 requests ~= 100-400 units)
  - TikTok: 1,000 requests/day
- Configurable max pages/posts per sync
- Error handling for rate limit errors

### Planned Features (Not Yet Implemented)

Per README.md design:

- **Token Refresh**: Automatic refresh of expired OAuth tokens
- **Scheduled Syncs**: Cron jobs or background workers for automatic ingestion
- **AI Service** (`src/lib/ai/`): OpenAI integration for comment classification (severity, category, confidence scoring)
  - Database schema ready: `flags` table with category, confidence_score, ai_reasoning fields
  - Comment ingestion complete, ready for AI classification
- **Admin UI**: Dashboard for legal partners to review cases
  - Database schema ready: `cases` table with assigned_to field for lawyer assignment
- **Webhooks** (`supabase/functions/`): Real-time webhook handlers for social platform events
- **Advanced Filtering**: Filter comments by date range, platform, keywords
- **Bulk Operations**: Mark multiple comments as reviewed, export comments

### Key Design Principles

- **Provider-agnostic AI**: Designed to support multiple AI providers beyond OpenAI
- **Row Level Security**: All user data tables use RLS policies
- **Server Actions**: Prefer server actions over API routes for data mutations
- **Type Safety**: Strict TypeScript with generated Supabase types
