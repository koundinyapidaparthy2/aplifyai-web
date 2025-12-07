# Setting up Google Authentication (One Tap & Standard)

To enable "Sign in with Google" (both the standard redirect and the One Tap popup), you need to create credentials in the Google Cloud Console.

## Step 1: Create Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top-left and select **"New Project"**.
3. Name it "AplifyAI" (or your project name) and create it.

## Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (unless you are a G-Suite user testing internally) and click Create.
3. Fill in required fields:
   - **App Name:** AplifyAI
   - **User Support Email:** Your email
   - **Developer Contact Info:** Your email
4. Click **Save and Continue**.
5. (Optional) Skip Scopes and Test Users for now (or add your email as a test user if in testing mode).

## Step 3: Create Credentials (Client ID)
1. Go to **APIs & Services** > **Credentials**.
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name it "AplifyAI Web".
5. **Authorized JavaScript origins**:
   - Add: `http://localhost:3000`
   - (Later, add your production domain, e.g., `https://aplify.ai`)
6. **Authorized redirect URIs**:
   - Add: `http://localhost:3000/api/auth/callback/google`
   - (Later, add production: `https://aplify.ai/api/auth/callback/google`)
7. Click **Create**.

## Step 4: Update Environment Variables
You will see a popup with your **Client ID** and **Client Secret**. Copy them into your `apps/web/.env.local` file:

```env
# Google Auth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Google One Tap (Requires NEXT_PUBLIC_ prefix for frontend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

> **Note:** `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` should be the **same value**.

## Step 5: Restart Server
After updating `.env.local`, stop the development server (Ctrl+C) and run it again:
```bash
npm run dev:web
```
