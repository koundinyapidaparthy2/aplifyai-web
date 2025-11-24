# AplifyAI Production Deployment Guide

## 🚀 Complete Infrastructure Deployment

This guide covers deploying **all AplifyAI services** to Google Cloud Platform using a unified Deployment Manager configuration.

## 🎯 Deployment Options

### Option 1: Unified Deployment (Recommended) ⭐

Deploy all services with one command using **GCP Deployment Manager**:
- Web App (Next.js)
- Resume Generator Service
- LaTeX PDF Service
- Storage Buckets
- Load Balancer with SSL

**See**: [`deployment-manager/README.md`](./deployment-manager/README.md) for complete guide.

**Quick Start**:
```bash
cd deployment-manager
./deploy.sh
```

### Option 2: Individual Service Deployment

Deploy services separately to Cloud Run (this guide below).

---

## 🚀 Individual Deployment to Google Cloud Run

This section covers deploying AplifyAI web app individually to **Google Cloud Run** with the custom domain **aplifyai.com**.

> **Why Cloud Run?** Your Next.js app has API routes (`/api/*`) which require server-side execution. Cloud Run supports full Next.js features including SSR, API routes, and middleware.

---

## 📋 Prerequisites

1. **Google Cloud SDK installed**
   ```bash
   # Install via Homebrew (macOS)
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticated with GCP**
   ```bash
   gcloud auth login
   gcloud config set project jobseek-459701
   ```

3. **Docker installed** (for local testing)
   ```bash
   brew install docker
   ```

4. **GCP Project**: `jobseek-459701`
5. **Custom Domain**: `aplifyai.com`

---

## 🔧 Configuration Files Created

- ✅ `Dockerfile` - Container configuration for Cloud Run
- ✅ `.dockerignore` - Files to exclude from Docker build
- ✅ `deploy-cloudrun.sh` - Automated deployment script
- ✅ `.env.production` - Production environment variables
- ✅ `next.config.ts` - Next.js configuration (standalone output)

---

## 🛠️ Deployment Steps

### Option 1: Automated Deployment (Recommended)

```bash
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web

# Run the deployment script
./deploy-cloudrun.sh
```

This script will:
1. Set GCP project
2. Enable required APIs
3. Build Docker image
4. Deploy to Cloud Run
5. Output the service URL

### Option 2: Manual Deployment

#### Step 1: Set GCP Project

```bash
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web
gcloud config set project jobseek-459701
```

#### Step 2: Build Docker Image

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/jobseek-459701/aplifyai-web .
```

**Build time**: ~5-10 minutes (first build), ~2-3 minutes (subsequent builds)

#### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy aplifyai-web \
  --image gcr.io/jobseek-459701/aplifyai-web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 60s \
  --set-env-vars "NODE_ENV=production,NEXT_PUBLIC_APP_URL=https://aplifyai.com,NEXTAUTH_URL=https://aplifyai.com"
```

#### Step 4: Get Service URL

```bash
gcloud run services describe aplifyai-web \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

**Service URL**: `https://aplifyai-web-<hash>-uc.a.run.app`

#### Step 5: Map Custom Domain

```bash
# Map aplifyai.com to Cloud Run service
gcloud run domain-mappings create \
  --service aplifyai-web \
  --domain aplifyai.com \
  --region us-central1
```

**Note**: You'll need to update DNS records (see section below)

---

## 🌐 Custom Domain Setup (aplifyai.com)

### DNS Configuration

After running domain mapping, Cloud Run will provide DNS records. Update your domain registrar:

**For root domain (aplifyai.com):**

| Type  | Name | Value |
|-------|------|-------|
| A     | @    | 216.239.32.21 |
| A     | @    | 216.239.34.21 |
| A     | @    | 216.239.36.21 |
| A     | @    | 216.239.38.21 |
| AAAA  | @    | 2001:4860:4802:32::15 |
| AAAA  | @    | 2001:4860:4802:34::15 |
| AAAA  | @    | 2001:4860:4802:36::15 |
| AAAA  | @    | 2001:4860:4802:38::15 |

**For www subdomain (www.aplifyai.com):**

| Type  | Name | Value |
|-------|------|-------|
| CNAME | www  | ghs.googlehosted.com |

### Verify Domain Mapping

```bash
# Check domain mapping status
gcloud run domain-mappings describe \
  --domain aplifyai.com \
  --region us-central1

# List all domain mappings
gcloud run domain-mappings list \
  --region us-central1
```

**SSL Certificate**: Automatically provisioned and renewed by Google (can take 15-60 minutes)

---

## 🔐 Environment Variables

Production environment variables are set in `.env.production`:

```env
# Update these before deployment:
JWT_SECRET=your-production-jwt-secret
NEXTAUTH_SECRET=your-production-nextauth-secret

# Service URLs (already configured):
RESUME_GENERATOR_URL=https://resume-generator-148210206342.us-central1.run.app
LATEX_PDF_SERVICE_URL=http://35.208.102.91:8080
NEXT_PUBLIC_APP_URL=https://aplifyai.com
```

### ⚠️ Important: Update Secrets

Before deploying, update these secrets in `.env.production`:

```bash
# Generate secure secrets (run in terminal)
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for NEXTAUTH_SECRET
```

---

## 🔍 Post-Deployment Verification

### 1. Check Deployment Status

```bash
firebase hosting:sites:list
firebase hosting:releases:list
```

### 2. Test Live Site

Visit these URLs and verify:

- ✅ https://aplifyai.com - Main domain
- ✅ https://www.aplifyai.com - WWW redirect
- ✅ https://jobseek-459701.web.app - Firebase URL

### 3. Test Critical Paths

- [ ] Sign up / Login
- [ ] Profile creation
- [ ] Resume generation
- [ ] Job tracking
- [ ] File uploads

### 4. Check Browser Console

- No 404 errors for assets
- No CORS issues
- API calls working

---

## 📊 Firebase Hosting Features

### Automatic Features Enabled

- ✅ **SSL Certificate**: Auto-provisioned and renewed
- ✅ **CDN**: Global content delivery
- ✅ **HTTP/2**: Enabled by default
- ✅ **Compression**: Gzip/Brotli for all assets
- ✅ **Cache Headers**: Optimized caching (see `firebase.json`)
- ✅ **Security Headers**: XSS, clickjacking protection

### Performance Headers

```json
{
  "Cache-Control": "public, max-age=31536000, immutable",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"
}
```

---

## 🔄 Continuous Deployment (Optional)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build:firebase
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          # Add other secrets...
          
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: jobseek-459701
```

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Solution**: 
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Issue: Docker Build Fails

**Solution**:
```bash
# Test Docker build locally
docker build -t aplifyai-web-test .

# Run locally to test
docker run -p 8080:8080 --env-file .env.production aplifyai-web-test
```

### Issue: "Permission Denied" on Cloud Build

**Solution**:
```bash
# Grant Cloud Build permissions
gcloud projects add-iam-policy-binding jobseek-459701 \
  --member=serviceAccount:148210206342@cloudbuild.gserviceaccount.com \
  --role=roles/run.admin
```

### Issue: Environment Variables Not Loading

**Solution**: Pass env vars during deployment:
```bash
gcloud run deploy aplifyai-web \
  --image gcr.io/jobseek-459701/aplifyai-web \
  --update-env-vars KEY1=value1,KEY2=value2
```

### Issue: Custom Domain Not Working

**Solution**:
1. Verify DNS propagation: `dig aplifyai.com`
2. Check domain mapping status
3. Wait for SSL certificate (15-60 minutes)
4. Clear browser cache

---

## 💰 Pricing (Google Cloud Run)

### Cost Breakdown

**Cloud Run** - Pay only for what you use:
- ✅ First 2 million requests/month: **FREE**
- ✅ First 360,000 GB-seconds/month: **FREE**
- ✅ First 180,000 vCPU-seconds/month: **FREE**

**Estimated Monthly Cost** (after free tier):
- Low traffic (< 100k requests): **$0-5**
- Medium traffic (100k-500k requests): **$10-30**
- High traffic (500k-1M requests): **$30-60**

**Additional Costs**:
- Container Registry storage: ~$0.02/GB/month
- Cloud Build: First 120 builds/day free
- Bandwidth: $0.12/GB (after 1GB free)

**Total Estimated Cost**: **$5-15/month** for typical usage

---

## 📈 Monitoring & Logs

### View Logs

```bash
# View real-time logs
gcloud run services logs read aplifyai-web \
  --region us-central1 \
  --follow

# View logs in Cloud Console
open "https://console.cloud.google.com/run/detail/us-central1/aplifyai-web/logs?project=jobseek-459701"
```

### Monitor Performance

```bash
# Get service details
gcloud run services describe aplifyai-web \
  --region us-central1

# View metrics in Cloud Console
open "https://console.cloud.google.com/run/detail/us-central1/aplifyai-web/metrics?project=jobseek-459701"
```

### Set Up Alerts

1. Go to Cloud Console → Monitoring → Alerting
2. Create alert for:
   - High error rate (> 5%)
   - High latency (> 2s)
   - Memory usage (> 80%)

---

## 🎯 Next Steps After Deployment

1. **Update OAuth Redirect URIs**
   - GitHub: Add `https://aplifyai.com/api/auth/callback/github`
   - Google: Add `https://aplifyai.com/api/auth/callback/google`

2. **Configure Backend CORS**
   - Add `https://aplifyai.com` to allowed origins in:
     - `resume-generator/server.js`
     - `latex-pdf-service/server.js`

3. **Test Email Service**
   - Configure SendGrid with production domain
   - Update FROM_EMAIL to `noreply@aplifyai.com`

4. **Set Up Monitoring**
   - Firebase Performance Monitoring
   - Error tracking (Sentry/Firebase Crashlytics)

5. **Enable Backups**
   - Firestore automatic backups
   - Cloud Storage backup strategy

---

## 📞 Support

- **Firebase Console**: https://console.firebase.google.com/project/jobseek-459701
- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **Custom Domain Guide**: https://firebase.google.com/docs/hosting/custom-domain

---

## ✅ Deployment Checklist

- [ ] Google Cloud SDK installed and authenticated
- [ ] `.env.production` secrets updated (JWT_SECRET, NEXTAUTH_SECRET)
- [ ] Docker installed and running
- [ ] Build successful locally (`npm run build`)
- [ ] Deployment script executed (`./deploy-cloudrun.sh`)
- [ ] Service URL working (test Cloud Run URL)
- [ ] Custom domain mapped (`aplifyai.com`)
- [ ] DNS records updated at registrar
- [ ] SSL certificate active (wait 15-60 mins)
- [ ] All pages loading correctly
- [ ] Authentication working (GitHub OAuth)
- [ ] API routes functional (`/api/*`)
- [ ] Backend services accessible
- [ ] CORS configured in backends
- [ ] OAuth callbacks updated
- [ ] Logs monitoring set up
- [ ] Performance metrics verified

---

**Ready to deploy!** Run `./deploy-cloudrun.sh` to push to production. 🚀

## 📞 Support

- **Cloud Console**: https://console.cloud.google.com/run?project=jobseek-459701
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Domain Mapping Guide**: https://cloud.google.com/run/docs/mapping-custom-domains
