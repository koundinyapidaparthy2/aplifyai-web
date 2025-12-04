# Desktop App Features & Tests

## Features
1.  **Offline Mode**: Access saved resumes without internet.
2.  **Resume Management**: Create, edit, and export resumes.
3.  **System Tray**: Quick access to recent notifications.
4.  **Cross-Platform**: Runs on macOS (ARM64/x64) and Windows.

## Test Cases (Local)
Run `npm run test:local` to execute these tests.

### 1. App Launch
- [ ] App opens successfully.
- [ ] "Welcome" screen is displayed.

### 2. Offline Capability
- [ ] Can view previously loaded resumes when disconnected.
- [ ] Shows "Offline" indicator.

### 3. System Integration
- [ ] App icon appears in Dock/Taskbar.
- [ ] Quit/Close behaves as expected (minimizes to tray or quits).
