# AplifyAI

<div align="center">

**An intelligent job application assistant that automates resume generation, cover letter creation, and application form filling using AI.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-purple?logo=google)](https://ai.google.dev/)

</div>
</div>

---

## 🎯 What is AplifyAI?

AplifyAI is an **end-to-end AI-powered job application platform** that eliminates the tedious, repetitive work of job hunting. It combines intelligent automation with personalized AI to help job seekers apply to positions 10x faster while maintaining quality and customization.

### Core Capabilities

```mermaid
mindmap
  root((AplifyAI))
    AI Resume Generation
      Parse existing resume
      Tailor to job description
      Professional LaTeX PDFs
      ATS-optimized formatting
    Smart Application Filing
      Auto-detect form fields
      Instant profile filling
      AI-powered question answering
      File attachment automation
    Application Tracking
      Centralized dashboard
      Status management
      Analytics & insights
      Document organization
    Multi-Platform
      Web Application
      Browser Extension
      Desktop App
      Mobile App
```

### How It Works

1. **One-Time Setup**: Upload your master resume and complete your profile once
2. **Browse Jobs**: Find positions on LinkedIn, Indeed, Greenhouse, Lever, or Workday
3. **AI Generation**: Click to generate a tailored resume and cover letter for each job
4. **Auto-Fill**: Browser extension detects and fills application forms automatically
5. **Track Progress**: Monitor all applications in a centralized dashboard with analytics

---

## 🚀 Scalability & Infrastructure

AplifyAI is built on **Google Cloud Platform** with a serverless, auto-scaling architecture that handles traffic from **zero to millions** of users without manual intervention.

### Auto-Scaling Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>aplifyai.com]
        EXT[Browser Extension<br/>Chrome/Edge]
        MOB[Mobile Apps<br/>iOS/Android]
        DESK[Desktop App<br/>Mac/Windows]
    end
    
    subgraph "CDN & Edge"
        FH[Firebase Hosting<br/>Global CDN]
    end
    
    subgraph "Google Cloud Run - Auto-Scaling"
        CR1[Instance 1<br/>1 CPU, 1GB RAM]
        CR2[Instance 2<br/>1 CPU, 1GB RAM]
        CR3[Instance ...<br/>Up to 10]
        LB[Cloud Load Balancer]
    end
    
    subgraph "Microservices"
        RG[Resume Generator<br/>LaTeX Service]
        PDF[PDF Compiler<br/>Document Service]
    end
    
    subgraph "Data Layer - Distributed"
        FS[(Firestore<br/>NoSQL Database)]
        GCS[Cloud Storage<br/>File Storage]
        AUTH[Firebase Auth<br/>Identity]
    end
    
    subgraph "AI Layer"
        GEMINI[Google Gemini 1.5<br/>AI Generation]
    end
    
    WEB --> FH
    EXT --> LB
    MOB --> FH
    DESK --> FH
    FH --> LB
    
    LB --> CR1
    LB --> CR2
    LB --> CR3
    
    CR1 --> RG
    CR2 --> RG
    CR3 --> RG
    
    RG --> PDF
    RG --> GEMINI
    
    CR1 --> FS
    CR1 --> GCS
    CR1 --> AUTH
    
    style CR1 fill:#3DCEA5,stroke:#2aa889,color:#000
    style CR2 fill:#3DCEA5,stroke:#2aa889,color:#000
    style CR3 fill:#3DCEA5,stroke:#2aa889,color:#000
    style GEMINI fill:#4dd4b5,stroke:#2aa889,color:#000
```

### Scaling Behavior

```mermaid
graph LR
    A[0 Requests<br/>💤 0 Instances] -->|User Traffic| B[1-100 req/s<br/>⚡ 1-3 Instances]
    B -->|High Load| C[100-500 req/s<br/>🔥 3-7 Instances]
    C -->|Peak Traffic| D[500+ req/s<br/>🚀 7-10 Instances]
    D -->|Traffic Decreases| B
    B -->|Idle 15min| A
    
    style A fill:#e0e0e0,stroke:#999,color:#000
    style B fill:#3DCEA5,stroke:#2aa889,color:#000
    style C fill:#FFA500,stroke:#FF8C00,color:#000
    style D fill:#FF6B6B,stroke:#FF5252,color:#fff
```

### Scalability Features

#### Cloud Run Auto-Scaling
- **Scale to Zero**: When idle, instances shut down (zero cost)
- **Instant Scale-Up**: New instances launch in <1 second under load
- **Horizontal Scaling**: Up to 10 concurrent instances (configurable to 1000+)
- **Global Distribution**: Multi-region deployment ready

#### Resource Allocation Per Instance
- **CPU**: 1 vCPU per instance
- **Memory**: 1 GiB RAM per instance
- **Concurrency**: 80 requests per instance (configurable)
- **Timeout**: 60 seconds per request

#### Performance Metrics
- **Cold Start**: ~2-3 seconds (Next.js)
- **Warm Response**: <100ms (cached)
- **AI Generation**: 3-8 seconds (Gemini API)
- **PDF Generation**: 2-5 seconds (LaTeX compilation)

#### Cost Efficiency
- **Pay-per-Use**: Only charged for actual request time
- **No Idle Costs**: Scales to zero when not in use
- **Free Tier**: 2 million requests/month on Cloud Run
- **Predictable**: ~$0.00002 per request at scale

### Database Scalability

```mermaid
graph TD
    subgraph "Firestore - Distributed NoSQL"
        FS1[Region: us-central]
        FS2[Region: europe-west]
        FS3[Region: asia-east]
    end
    
    subgraph "Automatic Features"
        AUTO1[Auto-Replication<br/>3+ zones]
        AUTO2[Auto-Sharding<br/>Horizontal partition]
        AUTO3[Auto-Indexing<br/>Query optimization]
    end
    
    FS1 -.->|Sync| FS2
    FS2 -.->|Sync| FS3
    FS3 -.->|Sync| FS1
    
    FS1 --> AUTO1
    FS1 --> AUTO2
    FS1 --> AUTO3
    
    style FS1 fill:#3DCEA5,stroke:#2aa889,color:#000
    style FS2 fill:#4dd4b5,stroke:#2aa889,color:#000
    style FS3 fill:#6ddac5,stroke:#2aa889,color:#000
```

**Firestore Limits (Per Database)**:
- **Writes**: 10,000/second
- **Reads**: 100,000/second
- **Documents**: Unlimited
- **Storage**: Unlimited (billed per GB)

---

## 📊 Visual Overview

### User Journey

```mermaid
graph LR
    A[🔐 Sign Up] --> B[📄 Onboarding]
    B --> C[📊 Dashboard]
    C --> D[🔍 Browse Jobs]
    D --> E[🤖 Generate Documents]
    E --> F[⚡ Auto-Fill Application]
    F --> G[📈 Track Progress]
    
    style A fill:#3DCEA5,stroke:#2aa889,color:#000
    style E fill:#3DCEA5,stroke:#2aa889,color:#000
    style F fill:#3DCEA5,stroke:#2aa889,color:#000
```

### Application Flow Process

Our intelligent 5-step automation process ensures seamless job applications:

```mermaid
graph TD
    A["Step 1: Collect Data<br/>(0-10%)<br/>📋 Extract job details from page"] --> B["Step 2: Fill Generic Questions<br/>(10-30%)<br/>⚡ Instant fill using cached profile"]
    B --> C["Step 3: Generate Documents<br/>(30-70%)<br/>🤖 AI creates resume & cover letter PDFs"]
    C --> D["Step 4: Fill AI Questions<br/>(70-90%)<br/>🧠 Smart answers using generated content"]
    D --> E["Step 5: Verify & Submit<br/>(90-100%)<br/>✅ Validate and scroll to submit"]
    
    style A fill:#3DCEA5,stroke:#2aa889,color:#000
    style B fill:#4dd4b5,stroke:#2aa889,color:#000
    style C fill:#6ddac5,stroke:#2aa889,color:#000
    style D fill:#8de0d5,stroke:#2aa889,color:#000
    style E fill:#ade6e5,stroke:#2aa889,color:#000
```

### Architecture

```mermaid
graph TB
    subgraph "User Interface Layer"
        UI1[Next.js 14]
        UI2[TypeScript]
        UI3[Tailwind CSS]
        UI4[Capacitor Mobile]
        UI5[Electron Desktop]
    end
    
    subgraph "Backend Services Layer"
        BE1[Next.js API Routes]
        BE2[Node.js Microservices]
        BE3[Resume Generator Service]
    end
    
    subgraph "Data & Storage Layer"
        DB1[Firebase Firestore]
        DB2[Google Cloud Storage]
        DB3[Firebase Authentication]
    end
    
    subgraph "AI & Processing Layer"
        AI1[Google Gemini 1.5 Flash]
        AI2[LaTeX PDF Generation]
        AI3[JWT Security]
    end
    
    UI1 --> BE1
    UI2 --> BE1
    UI3 --> BE1
    UI4 --> BE1
    UI5 --> BE1
    
    BE1 --> BE2
    BE2 --> BE3
    
    BE1 --> DB1
    BE1 --> DB2
    BE1 --> DB3
    
    BE3 --> AI1
    BE3 --> AI2
    BE1 --> AI3
    
    style UI1 fill:#3DCEA5,stroke:#2aa889,color:#000
    style BE1 fill:#3DCEA5,stroke:#2aa889,color:#000
    style DB1 fill:#3DCEA5,stroke:#2aa889,color:#000
    style AI1 fill:#3DCEA5,stroke:#2aa889,color:#000
```

---

## 🚀 Features

- **🤖 AI-Powered Resume Generation**: Tailor your resume to specific job descriptions using Gemini AI
- **✍️ Smart Cover Letters**: Generate personalized cover letters with adjustable tone and length
- **⚡ Auto-Fill Applications**: Browser extension auto-fills job applications with your tailored documents
- **📈 Job Tracking**: Keep track of all your applications, statuses, and documents in one place
- **📊 Analytics Dashboard**: Visualize your job search progress with charts and insights
- **📄 Resume Parsing**: Upload your existing resume to auto-fill your profile
- **🌐 Cross-Platform**: Available as web app, browser extension, mobile (iOS/Android), and desktop (Mac/Windows)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Capacitor** - Mobile app wrapper (iOS & Android)
- **Electron** - Desktop app wrapper (Mac & Windows)

### Backend Services
- **Next.js API Routes** - Serverless API endpoints
- **Node.js Microservices** - Resume generator service
- **LaTeX** - Professional PDF generation

### Data & Storage
- **Firebase Firestore** - NoSQL database
- **Google Cloud Storage** - File storage
- **Firebase Authentication** - User management

### AI & Intelligence
- **Google Gemini 1.5 Flash** - AI-powered content generation
- **JWT** - Secure authentication tokens

---

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
    cd aplifyai-web
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
    
    Navigate to the `resume-generator` directory:
    ```bash
    cd ../resume-generator
    npm install
    PORT=8000 npm start
    ```

5.  **Start the Web Application**
    ```bash
    cd ../aplifyai-web
    npm run dev
    ```

6.  **Open the App**
    
    Visit [http://localhost:3000](http://localhost:3000)

---

## 📱 Usage Flow

### Web Application

1.  **Sign Up** - Create your account
2.  **Onboarding** - Upload your resume or manually enter your details
3.  **Dashboard** - View your stats and recent activity
4.  **Jobs** - Create and manage job applications
5.  **Generate** - Create tailored resumes and cover letters
6.  **Track** - Monitor your application progress

### Browser Extension

1.  **Install Extension** - Load the extension from `apps/extension`
2.  **Login** - Authenticate with your AplifyAI account
3.  **Navigate to Job** - Open any job application page
4.  **Auto-Fill** - Click the extension to automatically fill the application
5.  **Review & Submit** - Verify the filled information and submit

---

## 🌐 Platform Availability

### 📱 Mobile App (iOS & Android)

Built with **Capacitor** for native mobile experience.

**Setup:**
```bash
# Sync project files
npx cap sync

# Run on iOS (Mac only)
npx cap open ios

# Run on Android
npx cap open android
```

### 🖥️ Desktop App (Mac & Windows)

Built with **Electron** for native desktop experience.

**Development:**
```bash
npm run electron:dev
```

**Build:**
```bash
npm run electron:build
```

### 🔌 Browser Extension (Chrome/Edge)

**Load Unpacked Extension:**
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `apps/extension` directory

---

## 📁 Project Structure

```
aplifyai-web/
├── apps/
│   └── extension/          # Browser extension
├── docs/
│   └── images/             # Documentation images
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and services
│   └── styles/            # Global styles
└── electron/              # Electron desktop wrapper
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🔗 Related Services

- **Resume Generator Service** - LaTeX-based PDF generation microservice
- **LaTeX PDF Service** - Document compilation service

---

<div align="center">

**Built with ❤️ using Next.js, Firebase, and Google Gemini AI**

</div>
