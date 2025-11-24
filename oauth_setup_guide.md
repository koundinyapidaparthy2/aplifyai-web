# OAuth Setup Guide

To enable social login, you need to configure OAuth credentials for Google and GitHub.

## 1. Google OAuth Setup

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project (`jobseek-459701`).
3.  Navigate to **APIs & Services** > **Credentials**.
4.  Click **Create Credentials** > **OAuth client ID**.
5.  Select **Web application** as the application type.
6.  Name it "AplifyAI Web".
7.  Add **Authorized JavaScript origins**:
    *   `http://localhost:3000`
8.  Add **Authorized redirect URIs**:
    *   `http://localhost:3000/api/auth/callback/google`
9.  Click **Create**.
10. Copy the **Client ID** and **Client Secret**.
11. Update `.env.local`:
    ```env
    GOOGLE_CLIENT_ID=your_client_id_here
    GOOGLE_CLIENT_SECRET=your_client_secret_here
    ```

## 2. GitHub OAuth Setup

1.  Go to [GitHub Developer Settings](https://github.com/settings/developers).
2.  Click **New OAuth App**.
3.  Fill in the details:
    *   **Application Name**: AplifyAI
    *   **Homepage URL**: `http://localhost:3000`
    *   **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4.  Click **Register application**.
5.  Copy the **Client ID**.
6.  Generate a new **Client Secret** and copy it.
7.  Update `.env.local`:
    ```env
    GITHUB_CLIENT_ID=your_client_id_here
    GITHUB_CLIENT_SECRET=your_client_secret_here
    ```

## 3. Apple Sign In (Optional)

*Requires an Apple Developer Account ($99/year).*

1.  Go to [Apple Developer Account](https://developer.apple.com/account/).
2.  Navigate to **Certificates, Identifiers & Profiles**.
3.  Create a new **App ID** and enable "Sign In with Apple".
4.  Create a new **Service ID** and configure it with your domain and return URL (`http://localhost:3000/api/auth/callback/apple`).
5.  Create a **Private Key** for Sign In with Apple and download it.
6.  Update `.env.local` with the details.
