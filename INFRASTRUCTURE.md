# AplifyAI Infrastructure Overview

Complete GCP infrastructure for the AplifyAI platform.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Custom Domain: aplifyai.com              │
│                   (Global Load Balancer + SSL)              │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐         ┌──────────────┐
│  Web App    │         │   Storage    │
│ (Cloud Run) │────────▶│   Buckets    │
│  Next.js    │         │    (GCS)     │
└──────┬──────┘         └──────────────┘
       │
       │ API Calls
       │
       ▼
┌──────────────────┐
│  Resume Gen      │
│  (Cloud Run)     │
│   Node.js        │
└────────┬─────────┘
         │
         │ PDF Conversion
         │
         ▼
┌──────────────────┐
│  LaTeX Service   │
│  (Cloud Run)     │
│   pdflatex       │
└──────────────────┘
```

## 📦 Components

### 1. Frontend Layer
- **aplifyai-web** - Next.js application
  - SSR + API routes
  - Firebase Auth integration
  - 1Gi RAM, 1 CPU
  - Auto-scales 0-10 instances

### 2. Backend Services
- **resume-generator** - Resume generation engine
  - Google Gemini AI integration
  - LaTeX template rendering
  - 2Gi RAM, 2 CPU
  - Auto-scales 0-5 instances

- **latex-pdf-service** - PDF conversion
  - LaTeX → PDF conversion
  - Word → PDF conversion
  - 2Gi RAM, 2 CPU
  - Min 1 instance (warm start)

### 3. Storage Layer
- **resume-generator-kp** - Resume storage
  - User resumes and profiles
  - 7-day lifecycle policy
  - Public read access

- **latex-pdf-outputs-jobseek-459701** - PDF outputs
  - Generated PDFs
  - 7-day auto-deletion
  - Public read access

### 4. Networking
- **Global Load Balancer** - HTTPS traffic routing
- **SSL Certificate** - Google-managed
- **Static IP** - For custom domain
- **HTTP → HTTPS** - Automatic redirect

## 🚀 Deployment Methods

### Unified Deployment (Recommended)
All services deployed together:
```bash
cd deployment-manager
./deploy.sh
```

### Individual Deployment
Deploy each service separately:
```bash
# Web App
./deploy-cloudrun.sh

# Resume Generator
cd ../resume-generator && gcloud run deploy ...

# LaTeX Service
cd ../latex-pdf-service && gcloud run deploy ...
```

## 🔧 Configuration

### Project Settings
- **Project ID**: `jobseek-459701`
- **Region**: `us-central1`
- **Custom Domain**: `aplifyai.com`

### Service URLs
After deployment:
- Web: `https://aplifyai.com`
- Resume Generator: `https://resume-generator-<hash>.run.app`
- LaTeX Service: `https://latex-pdf-service-<hash>.run.app`

### Environment Variables

**Web App**:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://aplifyai.com
NEXTAUTH_URL=https://aplifyai.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=jobseek-459701
GCP_PROJECT_ID=jobseek-459701
GCP_BUCKET_NAME=resume-generator-kp
RESUME_GENERATOR_URL=<resume-gen-url>
```

**Resume Generator**:
```env
NODE_ENV=production
PORT=8080
GCP_PROJECT_ID=jobseek-459701
GCP_BUCKET_NAME=resume-generator-kp
LATEX_PDF_SERVICE_URL=<latex-service-url>
GEMINI_API_KEY=<gemini-key>
```

**LaTeX Service**:
```env
NODE_ENV=production
PORT=8080
GCP_PROJECT_ID=jobseek-459701
GCP_BUCKET_NAME=latex-pdf-outputs-jobseek-459701
```

## 📊 Service Communication

```
User Request → Web App
               ↓
         Resume Generation?
               ↓
         Resume Generator API
               ↓
         Generate LaTeX
               ↓
         LaTeX PDF Service
               ↓
         Convert to PDF
               ↓
         Upload to GCS
               ↓
         Return URL
               ↓
         Display to User
```

## 💰 Cost Estimate

| Component | Monthly Cost |
|-----------|--------------|
| Cloud Run (3 services) | $5-20 |
| Cloud Storage | $1-5 |
| Load Balancer | $18 |
| Egress | $5-15 |
| **Total** | **$29-58** |

### Cost Optimization
- Set `minInstances: 0` for non-critical services
- Use 7-day lifecycle policies
- Monitor and adjust instance sizes
- Consider Direct Cloud Run URLs (skip LB, save $18/mo)

## 🔒 Security

### IAM & Permissions
- Service accounts with minimal permissions
- Cloud Run invoker role for public access
- Storage admin for bucket access

### Network Security
- HTTPS only (HTTP redirects)
- CORS configured per service
- Rate limiting on sensitive endpoints

### Data Security
- TLS in transit
- Encrypted at rest (GCS default)
- Auto-deletion policies (7 days)

## 📈 Monitoring

### Logs
```bash
# View all service logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### Metrics
- Request count
- Error rate
- Latency (p50, p95, p99)
- Memory/CPU usage
- Auto-scaling events

### Alerts
Set up alerts for:
- Error rate > 5%
- Latency > 2s
- Memory usage > 80%
- Failed deployments

## 🔄 CI/CD

### GitHub Actions (Optional)
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
      - run: gcloud builds submit --tag gcr.io/$PROJECT_ID/aplifyai-web
      - run: gcloud run deploy aplifyai-web --image gcr.io/$PROJECT_ID/aplifyai-web
```

## 📚 Documentation

- [Deployment Manager Guide](./deployment-manager/README.md)
- [Cloud Run Deployment](./DEPLOYMENT.md)
- [Architecture Details](./ARCHITECTURE.md)
- [API Documentation](./API.md)

## 🐛 Troubleshooting

### Service Communication Issues
```bash
# Test service-to-service communication
gcloud run services describe resume-generator --format='value(status.url)'
curl <SERVICE_URL>/timestamp
```

### CORS Issues
Update service CORS settings in `server.js` of each service.

### Domain Not Working
1. Check DNS propagation: `dig aplifyai.com`
2. Verify SSL certificate status
3. Wait 15-60 minutes for provisioning

## ✅ Deployment Checklist

- [ ] All Docker images built
- [ ] Deployment Manager config reviewed
- [ ] Environment variables set
- [ ] Services deployed successfully
- [ ] Storage buckets created
- [ ] Load balancer configured
- [ ] SSL certificate active
- [ ] DNS records updated
- [ ] All services communicating
- [ ] Custom domain accessible
- [ ] Logs and monitoring configured
- [ ] Backup strategy in place

---

**Infrastructure managed by**: GCP Deployment Manager  
**Last Updated**: November 22, 2025  
**Version**: 1.0.0
