# AmplifyAI

AmplifyAI is an intelligent job search assistant that helps you generate tailored resumes and cover letters, track applications, and analyze your progress.

## 🚀 Features

- **AI-Powered Resume Generation**: Tailor your resume to specific job descriptions using Gemini AI.
- **Smart Cover Letters**: Generate personalized cover letters with adjustable tone and length.
- **Job Tracking**: Keep track of all your applications, statuses, and documents in one place.
- **Analytics Dashboard**: Visualize your job search progress with charts and insights.
- **Resume Parsing**: Upload your existing resume to auto-fill your profile.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js (Microservice)
- **Database**: Firebase Firestore
- **Storage**: Google Cloud Storage
- **AI**: Google Gemini 1.5 Flash
- **PDF Generation**: LaTeX

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud Platform account with Firestore and Storage enabled
- Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd amplifyai-web
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory:
    ```env
    # Firebase Admin
    FIREBASE_PROJECT_ID=your-project-id
    FIREBASE_CLIENT_EMAIL=your-client-email
    FIREBASE_PRIVATE_KEY="your-private-key"

    # Firebase Client
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

    # Services
    RESUME_GENERATOR_URL=http://localhost:8000
    RESUME_GENERATOR_API_KEY=123456
    
    # JWT
    JWT_SECRET=your-secret-key
    ```

4.  **Start the Resume Generator Service**
    Navigate to the `resume-generator` directory (assumed to be a sibling or submodule):
    ```bash
    cd ../resume-generator
    npm install
    PORT=8000 npm start
    ```

5.  **Start the Web Application**
    ```bash
    cd ../amplifyai-web
    npm run dev
    ```

6.  **Open the App**
    Visit [http://localhost:3000](http://localhost:3000)

## 📱 Usage Flow

1.  **Sign Up**: Create an account.
2.  **Onboarding**: Upload your resume or manually enter your details.
3.  **Dashboard**: View your stats and recent activity.
4.  **Jobs**: Go to the Jobs page to create a new application.
5.  **Generate**: Use "New Resume" or "Generate Cover Letter" to create tailored documents.
6.  **Track**: Update the status of your applications as you progress.

## 📄 License

MIT

## 📱 Mobile App (iOS & Android)

This project uses **Capacitor** to run on mobile devices.

### Setup
1.  **Sync Project**:
    ```bash
    npx cap sync
    ```
2.  **Run on iOS** (Mac only):
    ```bash
    npx cap open ios
    ```
3.  **Run on Android**:
    ```bash
    npx cap open android
    ```

## 🖥️ Desktop App (Mac & Windows)

This project uses **Electron** to run on desktop.

### Development
Run the Next.js app and Electron wrapper concurrently:
```bash
npm run electron:dev
```

### Build
Create a distributable app (DMG/EXE):
```bash
npm run electron:build
```
