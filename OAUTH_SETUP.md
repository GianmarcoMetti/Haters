# OAuth Setup Guide

This guide will help you configure OAuth credentials for Instagram, Facebook, YouTube, and TikTok integrations.

## Prerequisites

- A deployed or local instance of the Haters application
- Developer accounts for each platform you want to integrate

---

## Instagram OAuth Setup

Instagram uses Facebook's OAuth system (Meta for Developers).

### Steps:

1. **Create Facebook App**
   - Go to https://developers.facebook.com
   - Click "My Apps" → "Create App"
   - Choose "Consumer" as app type
   - Fill in app details

2. **Add Instagram Basic Display Product**
   - In your app dashboard, click "Add Product"
   - Find "Instagram Basic Display" and click "Set Up"
   - Click "Create New App" in the Instagram Basic Display section

3. **Configure OAuth Redirect URIs**
   - In Instagram Basic Display settings, add:
     - `http://localhost:3000/api/oauth/callback/instagram` (development)
     - `https://yourdomain.com/api/oauth/callback/instagram` (production)
   - Save changes

4. **Get Credentials**
   - Copy the "Instagram App ID" (Client ID)
   - Copy the "Instagram App Secret" (Client Secret)

5. **Add to `.env.local`**
   ```bash
   INSTAGRAM_CLIENT_ID=your_instagram_app_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
   ```

6. **Add Test Users**
   - In Instagram Basic Display, add Instagram Test Users
   - Test users must accept the invitation in their Instagram app

### API Permissions:
- `user_profile` - Read user profile
- `user_media` - Read user media and comments

---

## Facebook OAuth Setup

Uses the same Facebook app as Instagram.

### Steps:

1. **Use Existing Facebook App** (or create a new one)
   - Go to https://developers.facebook.com
   - Use the same app or create a new one

2. **Add Facebook Login Product**
   - Click "Add Product" → "Facebook Login"
   - Click "Settings" under Facebook Login

3. **Configure OAuth Redirect URIs**
   - Add to "Valid OAuth Redirect URIs":
     - `http://localhost:3000/api/oauth/callback/facebook`
     - `https://yourdomain.com/api/oauth/callback/facebook`
   - Save changes

4. **Get Credentials**
   - Go to Settings → Basic
   - Copy "App ID" (Client ID)
   - Copy "App Secret" (Client Secret)

5. **Add to `.env.local`**
   ```bash
   FACEBOOK_CLIENT_ID=your_facebook_app_id
   FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
   ```

6. **Request Advanced Permissions** (for production)
   - Go to App Review → Permissions and Features
   - Request:
     - `pages_show_list`
     - `pages_read_engagement`
     - `pages_manage_posts`

### API Permissions:
- `pages_show_list` - See list of Pages
- `pages_read_engagement` - Read engagement data
- `pages_manage_posts` - Manage posts and comments

---

## YouTube OAuth Setup

Uses Google Cloud Console and YouTube Data API v3.

### Steps:

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create a new project or select existing one
   - Name it (e.g., "Haters YouTube Integration")

2. **Enable YouTube Data API v3**
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User type: External
     - App name: Your app name
     - User support email: Your email
     - Developer contact: Your email
   - Application type: "Web application"
   - Name: "Haters Web Client"

4. **Configure Authorized Redirect URIs**
   - Add:
     - `http://localhost:3000/api/oauth/callback/youtube`
     - `https://yourdomain.com/api/oauth/callback/youtube`
   - Click "Create"

5. **Get Credentials**
   - Copy "Client ID"
   - Copy "Client Secret"

6. **Add to `.env.local`**
   ```bash
   YOUTUBE_CLIENT_ID=your_google_client_id
   YOUTUBE_CLIENT_SECRET=your_google_client_secret
   ```

7. **Add Test Users** (if app is in testing mode)
   - Go to OAuth consent screen
   - Add test users' Gmail addresses

### API Scopes:
- `https://www.googleapis.com/auth/youtube.readonly` - View YouTube account
- `https://www.googleapis.com/auth/youtube.force-ssl` - Manage YouTube account

### Quota:
- YouTube Data API has daily quota limits
- Default: 10,000 units/day
- Each read operation costs units (varies by endpoint)

---

## TikTok OAuth Setup

Uses TikTok for Developers and Login Kit.

### Steps:

1. **Register as TikTok Developer**
   - Go to https://developers.tiktok.com
   - Sign up or log in with your TikTok account
   - Complete developer registration

2. **Create App**
   - Go to "My Apps" → "Create App"
   - Fill in app details:
     - App name
     - Description
     - Category
   - Submit for review

3. **Add Login Kit**
   - In your app, go to "Products"
   - Add "Login Kit"

4. **Configure Redirect URIs**
   - In Login Kit settings:
     - Add `http://localhost:3000/api/oauth/callback/tiktok`
     - Add `https://yourdomain.com/api/oauth/callback/tiktok`

5. **Get Credentials**
   - Go to "Basic Info"
   - Copy "Client Key" (Client ID)
   - Copy "Client Secret"

6. **Add to `.env.local`**
   ```bash
   TIKTOK_CLIENT_ID=your_tiktok_client_key
   TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
   ```

7. **Request Scopes**
   - In Login Kit, request:
     - `user.info.basic` - User profile info
     - `video.list` - List of user videos

### API Scopes:
- `user.info.basic` - Basic user information
- `video.list` - Access to user's video list
- `video.comment` - Access to video comments (may require additional approval)

### Review Process:
- TikTok requires app review before production use
- Provide detailed use case explanation
- May take several days to weeks for approval

---

## Environment Variables Setup

Create or update `.env.local` in your project root:

```bash
# Instagram (Meta)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# Facebook (Meta)
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# YouTube (Google)
YOUTUBE_CLIENT_ID=your_google_client_id
YOUTUBE_CLIENT_SECRET=your_google_client_secret

# TikTok
TIKTOK_CLIENT_ID=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# App URL (REQUIRED for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (should already be configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important Notes**:
- Never commit `.env.local` to version control
- `.env.local` is already in `.gitignore`
- For production, set these in your hosting platform's environment variables
- `NEXT_PUBLIC_APP_URL` must match your actual domain (no trailing slash)

---

## Testing OAuth Integration

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Accounts Page**
   - Go to http://localhost:3000/dashboard/accounts
   - You should see platform cards

3. **Test Connection**
   - Click "Connect" on a configured platform
   - Complete OAuth authorization
   - You should be redirected back with success message
   - Connected account appears in "Connected Accounts" section

4. **Check Database**
   - Open Supabase Studio: http://127.0.0.1:54323
   - Navigate to Table Editor → `social_accounts`
   - Verify new row with your platform connection

---

## Troubleshooting

### "Not Configured" Error
- Check that environment variables are set in `.env.local`
- Restart dev server after adding new variables
- Verify variable names match exactly (case-sensitive)

### OAuth Redirect URI Mismatch
- Ensure redirect URI in platform settings matches exactly:
  - Development: `http://localhost:3000/api/oauth/callback/[platform]`
  - Production: `https://yourdomain.com/api/oauth/callback/[platform]`
- No trailing slashes
- Protocol must match (http vs https)

### "Invalid Client" Error
- Double-check Client ID and Client Secret
- Ensure no extra spaces when copying credentials
- Verify app is not in restricted/sandbox mode

### Tokens Expire Too Quickly
- Some platforms (Facebook, YouTube) support refresh tokens
- Token refresh will be implemented in future updates
- For now, users can reconnect accounts when tokens expire

### Permission Denied Errors
- Verify you requested correct API scopes
- For Facebook/Instagram: Check App Review status
- For TikTok: Ensure app is approved for production

---

## Production Deployment

When deploying to production:

1. **Update Redirect URIs** in all platform apps:
   - Change from `localhost:3000` to your production domain
   - Add both http and https versions if needed

2. **Set Environment Variables** in hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Build & Deploy → Environment
   - Update `NEXT_PUBLIC_APP_URL` to production domain

3. **Submit for App Review** (if required):
   - Facebook/Instagram: Submit for advanced permissions review
   - TikTok: Submit app for production approval
   - Include detailed use case and privacy policy

4. **Test in Production**:
   - Test OAuth flow with production URLs
   - Verify tokens are stored correctly
   - Check error handling with real accounts

---

## Security Best Practices

1. **Never expose secrets**:
   - Client secrets stay on server
   - Tokens never sent to client
   - Use HTTPS in production

2. **Implement State Validation**:
   - CSRF protection via state parameter
   - Verify state matches before exchanging tokens

3. **Token Storage**:
   - Stored in database with RLS
   - Consider encryption for sensitive tokens
   - Implement automatic token refresh

4. **Rate Limiting**:
   - Implement on OAuth endpoints
   - Prevent abuse of callback routes

5. **Error Handling**:
   - Don't expose internal errors to users
   - Log OAuth errors securely
   - Provide user-friendly messages

---

## Additional Resources

- **Facebook**: https://developers.facebook.com/docs/facebook-login
- **Instagram**: https://developers.facebook.com/docs/instagram-basic-display-api
- **YouTube**: https://developers.google.com/youtube/v3/guides/authentication
- **TikTok**: https://developers.tiktok.com/doc/login-kit-web

For questions or issues, refer to each platform's developer documentation or support channels.
