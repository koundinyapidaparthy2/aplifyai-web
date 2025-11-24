# AplifyAI - Complete Architecture

## 🏗️ System Architecture

```
                                   Internet
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │   Google Cloud DNS      │
                        │   aplifyai.com          │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │  Global Load Balancer   │
                        │  - Static IP            │
                        │  - SSL Certificate      │
                        │  - HTTP→HTTPS Redirect  │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │   aplifyai-web          │
                        │   (Cloud Run)           │
                        │   - Next.js 16          │
                        │   - API Routes          │
                        │   - SSR                 │
                        │   - 1Gi RAM, 1 CPU      │
                        │   - 0-10 instances      │
                        └──────┬──────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Firebase Auth   │  │  Firestore   │  │  GCS Storage │
    │  - GitHub OAuth  │  │  - Profiles  │  │  - Resumes   │
    │  - Email/Pass    │  │  - Jobs      │  │  - PDFs      │
    └──────────────────┘  └──────────────┘  └──────┬───────┘
                                                    │
                ┌───────────────────────────────────┤
                │                                   │
                ▼                                   │
    ┌──────────────────────┐                       │
    │  resume-generator    │                       │
    │  (Cloud Run)         │                       │
    │  - Node.js + Express │◀──────────────────────┘
    │  - Gemini AI         │
    │  - LaTeX Templates   │
    │  - 2Gi RAM, 2 CPU    │
    │  - 0-5 instances     │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  latex-pdf-service   │
    │  (Cloud Run)         │
    │  - pdflatex          │
    │  - LibreOffice       │
    │  - 2Gi RAM, 2 CPU    │
    │  - 1-5 instances     │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  GCS Output Bucket   │
    │  - Generated PDFs    │
    │  - 7-day lifecycle   │
    │  - Public access     │
    └──────────────────────┘
```

## 🔄 Request Flow

### 1. User Visits aplifyai.com
```
User Browser → DNS → Load Balancer → Cloud Run (aplifyai-web) → Response
```

### 2. Generate Resume
```
User Click "Generate Resume"
    ↓
Web App /api/resumes/generate
    ↓
POST to resume-generator service
    ↓
Gemini AI tailors content
    ↓
Renders LaTeX template
    ↓
POST to latex-pdf-service
    ↓
Converts LaTeX → PDF
    ↓
Uploads to GCS bucket
    ↓
Returns public URL
    ↓
Web app displays download link
    ↓
User downloads PDF
```

### 3. Authentication Flow
```
User Login
    ↓
NextAuth.js (Web App)
    ↓
Firebase Auth (GitHub OAuth)
    ↓
JWT token generated
    ↓
Session stored
    ↓
User redirected to dashboard
```

## 📦 Service Dependencies

```
aplifyai-web
├── Depends on:
│   ├── Firebase Auth
│   ├── Firestore
│   ├── resume-generator (API)
│   └── GCS Storage
│
resume-generator
├── Depends on:
│   ├── latex-pdf-service (API)
│   ├── GCS Storage
│   ├── Gemini AI API
│   └── Google Sheets (tracking)
│
latex-pdf-service
└── Depends on:
    └── GCS Storage
```

## 🔐 IAM & Security

### Service Accounts
- **Cloud Build SA**: Build and push images
- **Cloud Run SA**: Execute containers
- **Deployment Manager SA**: Manage infrastructure

### Permissions
```
aplifyai-web:
  - roles/run.invoker (public)
  - roles/storage.objectViewer (GCS)
  - roles/firebase.admin (Firebase)

resume-generator:
  - roles/run.invoker (public)
  - roles/storage.objectCreator (GCS)
  - roles/aiplatform.user (Gemini)

latex-pdf-service:
  - roles/run.invoker (public)
  - roles/storage.objectCreator (GCS)
```

## 🌐 Network Configuration

### Domains
- **Primary**: `aplifyai.com` → Load Balancer
- **WWW**: `www.aplifyai.com` → Load Balancer
- **Services**: `*.run.app` → Direct Cloud Run URLs

### Ports
- **443 (HTTPS)**: Primary traffic
- **80 (HTTP)**: Redirects to 443
- **8080**: Container port (internal)

### CORS
```javascript
// Allowed Origins
- https://aplifyai.com
- https://www.aplifyai.com
- https://*.run.app (service-to-service)

// Methods
- GET, POST, PUT, DELETE, OPTIONS

// Headers
- Content-Type, Authorization, x-api-key
```

## 💾 Data Flow

### Storage Buckets
```
resume-generator-kp/
├── users/
│   └── {userId}/
│       ├── profile.json
│       ├── resume-v1.pdf
│       └── resume-v2.pdf
└── templates/
    └── template-001.tex

latex-pdf-outputs-jobseek-459701/
└── {timestamp}-{uuid}-output.pdf
    (auto-deleted after 7 days)
```

### Database (Firestore)
```
users/
└── {userId}/
    ├── profile: { name, email, ... }
    ├── experience: [ ... ]
    ├── education: [ ... ]
    └── skills: [ ... ]

jobs/
└── {jobId}/
    ├── title
    ├── company
    ├── status
    └── documents: { resumeUrl, coverLetterUrl }

resumes/
└── {resumeId}/
    ├── userId
    ├── jobId
    ├── pdfUrl
    └── createdAt
```

## 📊 Monitoring & Observability

### Metrics Tracked
- **Request Rate**: Requests/second per service
- **Latency**: p50, p95, p99 response times
- **Error Rate**: 4xx, 5xx errors
- **Resource Usage**: CPU, Memory, Disk
- **Cost**: Daily spend per service

### Logging
```bash
# Structured logs with severity levels
INFO:  Normal operations
WARN:  Potential issues
ERROR: Failed operations
DEBUG: Detailed debugging

# Log aggregation
All services → Cloud Logging → BigQuery (optional)
```

### Alerts
- Error rate > 5% → Email
- Latency > 2s → Slack
- Memory > 80% → PagerDuty
- Service down → All channels

## 🔄 Deployment Pipeline

### CI/CD Flow (Optional)
```
Git Push to main
    ↓
GitHub Actions triggered
    ↓
Run tests
    ↓
Build Docker images
    ↓
Push to GCR
    ↓
Update Deployment Manager config
    ↓
Deploy to Cloud Run
    ↓
Health checks
    ↓
Route traffic
    ↓
Notify team
```

### Manual Deployment
```bash
./deploy.sh
    ↓
Build images (10-15 min)
    ↓
Create/update deployment
    ↓
Provision resources
    ↓
Deploy services
    ↓
Configure networking
    ↓
Done!
```

## 🔧 Configuration Management

### Environment Variables
- **Stored**: Deployment Manager config
- **Injected**: Container runtime
- **Secrets**: Google Secret Manager
- **Override**: Individual service updates

### Feature Flags
```javascript
// Dynamic configuration
{
  "features": {
    "aiMatching": true,
    "coverLetters": true,
    "analytics": true,
    "autofill": false
  }
}
```

## 📈 Scaling Strategy

### Auto-scaling Rules
```yaml
aplifyai-web:
  minInstances: 0    # Cost optimization
  maxInstances: 10   # Peak load capacity
  target: 80% CPU    # Scale trigger

resume-generator:
  minInstances: 0
  maxInstances: 5
  target: 70% CPU

latex-pdf-service:
  minInstances: 1    # Warm start (cold start = 60s)
  maxInstances: 5
  target: 60% CPU
```

### Load Distribution
- **Geographic**: Global CDN via Load Balancer
- **Service**: Round-robin across instances
- **Request**: Connection pooling

## 💰 Cost Optimization

### Strategies
1. **Cold Starts**: Accept for low-traffic services
2. **Lifecycle Policies**: Auto-delete old files
3. **Right-sizing**: Monitor and adjust resources
4. **Reserved Capacity**: Sustained use discounts
5. **Spot Instances**: Not available for Cloud Run

### Cost Breakdown
```
Fixed Costs:
- Load Balancer: $18/mo

Variable Costs:
- Cloud Run: $0.00002400/vCPU-sec + $0.00000250/GiB-sec
- Storage: $0.020/GiB-month
- Egress: $0.12/GiB (after 1GB free)

Estimated Total: $29-58/mo (typical usage)
```

## 🎯 Performance Targets

### SLOs (Service Level Objectives)
- **Availability**: 99.5% uptime
- **Latency**: 
  - p50 < 200ms
  - p95 < 500ms
  - p99 < 1000ms
- **Error Rate**: < 1%
- **Resume Generation**: < 10s

### Optimization Techniques
- **Caching**: Redis (optional)
- **CDN**: Static assets via Load Balancer
- **Compression**: Gzip/Brotli
- **Connection Pooling**: Database connections
- **Lazy Loading**: Frontend components

---

**Last Updated**: November 22, 2025  
**Version**: 1.0.0  
**Maintained by**: DevOps Team
