# Web Application Features & Tests

## Features
1.  **Authentication**: Sign in with Google (Firebase).
2.  **Dashboard**: View recent activity and stats.
3.  **Resume Builder**: Create and edit resumes.
4.  **Download Page**: Links to Extension and Desktop App.

## Test Cases (Local)
Run `npm run test:local` to execute these tests.

### 1. Authentication
- [ ] User can sign in with Google.
- [ ] User is redirected to Dashboard after login.
- [ ] Unauthenticated user is redirected to Login page.

### 2. Dashboard
- [ ] Displays user's name.
- [ ] Shows recent resume activity.

### 3. Download Page
- [ ] "Download Extension" button links to ZIP.
- [ ] "Download for Mac" button links to DMG.
- [ ] "Download for Windows" button is disabled.
