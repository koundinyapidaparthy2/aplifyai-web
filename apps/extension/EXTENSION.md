# Chrome Extension Features & Tests

## Features
1.  **Job Detection**: Automatically detects job postings on LinkedIn, Indeed, etc.
2.  **Side Panel**: Opens a side panel with job details and actions.
3.  **Auth Sync**: Shares authentication state with the Web App.
4.  **Autofill**: Fills application forms with generated data.

## Test Cases (Local)
Run `npm run test:local` to execute these tests.

### 1. Job Detection
- [ ] Icon highlights on LinkedIn job page.
- [ ] Side panel opens automatically (if configured).

### 2. Side Panel
- [ ] Displays "Analyze Job" button.
- [ ] Shows "Logged In" state if web app is authenticated.
- [ ] "Generate Resume" creates a PDF link.

### 3. Autofill
- [ ] "Autofill" button appears on supported forms.
- [ ] Fields are populated correctly.
