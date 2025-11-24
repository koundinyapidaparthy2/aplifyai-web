# ✅ AplifyAI Unified Deployment - Setup Complete

## 🎉 What Has Been Created

All AplifyAI services can now be deployed to Google Cloud Platform under **one unified Deployment Manager** configuration.

### 📁 New Files Created

```
aplifyai-web/
├── deployment-manager/          ⭐ NEW - Unified deployment
│   ├── config.yaml              # Main configuration
│   ├── cloud-run-web.yaml       # Web app template
│   ├── cloud-run-resume-generator.yaml
│   ├── cloud-run-latex-service.yaml
│   ├── storage.yaml             # GCS buckets
│   ├── networking.yaml          # Load balancer + SSL
│   ├── deploy.sh               # One-command deployment
│   └── README.md               # Detailed guide
│
├── Dockerfile                   # Container for web app
├── .dockerignore               # Build optimization
├── deploy-cloudrun.sh          # Individual deployment (alternative)
├── DEPLOYMENT.md               # Updated deployment guide
├── INFRASTRUCTURE.md           # Architecture overview
├── ARCHITECTURE.md             # Detailed architecture
└── QUICKSTART.md              # Quick reference
```

## 🚀 How to Deploy

### Option 1: Deploy Everything (Recommended)

```bash
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web/deployment-manager
./deploy.sh
```

**This deploys**:
- ✅ Web App (Next.js) - `aplifyai-web`
- ✅ Resume Generator - `resume-generator`
- ✅ LaTeX PDF Service - `latex-pdf-service`
- ✅ Storage Buckets (2) - GCS
- ✅ Load Balancer with SSL - `aplifyai.com`
- ✅ Static IP Address
- ✅ HTTP → HTTPS redirect

**Time**: 15-20 minutes (first deployment)

### Option 2: Deploy Web App Only

```bash
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web
./deploy-cloudrun.sh
```

### Option 3: Use npm script

```bash
npm run deploy        # Full infrastructure
npm run deploy:web    # Web app only
```

## 📊 What Gets Deployed

| Component | Type | Resources | Auto-Scale |
|-----------|------|-----------|------------|
| **aplifyai-web** | Cloud Run | 1Gi RAM, 1 CPU | 0-10 instances |
| **resume-generator** | Cloud Run | 2Gi RAM, 2 CPU | 0-5 instances |
| **latex-pdf-service** | Cloud Run | 2Gi RAM, 2 CPU | 1-5 instances |
| **Storage** | GCS | 2 buckets | Unlimited |
| **Load Balancer** | Global | SSL + IP | N/A |

## 🌐 Custom Domain Setup

After deployment:

1. **Get the Global IP**:
   ```bash
   gcloud compute addresses describe aplifyai-global-ip --global --format='value(address)'
   ```

2. **Update DNS** at your domain registrar:
   
   | Type | Name | Value |
   |------|------|-------|
   | A | @ | `<GLOBAL_IP>` |
   | A | www | `<GLOBAL_IP>` |

3. **Wait for SSL**: 15-60 minutes for certificate provisioning

4. **Access**: `https://aplifyai.com`

## 🔍 Verify Deployment

```bash
# Check deployment status
gcloud deployment-manager deployments describe aplifyai-infrastructure

# List all services
gcloud run services list --region us-central1

# Get service URLs
gcloud run services describe aplifyai-web --region us-central1 --format='value(status.url)'

# View logs
gcloud run services logs read aplifyai-web --region us-central1 --limit 50
```

## 📝 Configuration

### Service URLs (Auto-generated after deployment)

Update these in your web app after deployment:

```bash
# Get resume generator URL
RESUME_GEN_URL=$(gcloud run services describe resume-generator --region us-central1 --format='value(status.url)')

# Get latex service URL  
LATEX_URL=$(gcloud run services describe latex-pdf-service --region us-central1 --format='value(status.url)')

# Update web app with these URLs
gcloud run services update aplifyai-web \
  --update-env-vars RESUME_GENERATOR_URL=$RESUME_GEN_URL \
  --region us-central1
```

### Environment Variables

All environment variables are configured in `deployment-manager/config.yaml`:

```yaml
envVars:
  NODE_ENV: production
  NEXT_PUBLIC_APP_URL: https://aplifyai.com
  NEXTAUTH_URL: https://aplifyai.com
  # Add more as needed
```

## 💰 Cost Estimate

**Monthly Cost**: $29-58

| Service | Cost |
|---------|------|
| Cloud Run (3 services) | $5-20 |
| Cloud Storage | $1-5 |
| Load Balancer | $18 |
| Network Egress | $5-15 |

**Free Tier Credits**:
- First 2M requests/month: FREE
- First 360K GB-seconds/month: FREE
- First 180K vCPU-seconds/month: FREE

## 🔄 Update Deployment

```bash
# Edit configuration
vim deployment-manager/config.yaml

# Update deployment
gcloud deployment-manager deployments update aplifyai-infrastructure \
  --config deployment-manager/config.yaml
```

## 🗑️ Delete Everything

```bash
gcloud deployment-manager deployments delete aplifyai-infrastructure
```

This removes all services, load balancer, and networking (storage buckets may need manual deletion).

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [`QUICKSTART.md`](./QUICKSTART.md) | Quick reference for common tasks |
| [`deployment-manager/README.md`](./deployment-manager/README.md) | Complete deployment guide |
| [`INFRASTRUCTURE.md`](./INFRASTRUCTURE.md) | Infrastructure overview |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Detailed system architecture |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Individual service deployment |

## ✅ Pre-Deployment Checklist

Before running deployment:

- [ ] GCP project created (`jobseek-459701`)
- [ ] Google Cloud SDK installed
- [ ] Authenticated with GCP (`gcloud auth login`)
- [ ] Project set (`gcloud config set project jobseek-459701`)
- [ ] Domain registered (`aplifyai.com`)
- [ ] Environment variables reviewed
- [ ] Secrets updated (JWT_SECRET, NEXTAUTH_SECRET)

## 🎯 Post-Deployment Tasks

After deployment completes:

- [ ] Verify all services running
- [ ] Update DNS records
- [ ] Wait for SSL certificate (15-60 mins)
- [ ] Test web app at `https://aplifyai.com`
- [ ] Test authentication (GitHub OAuth)
- [ ] Test resume generation
- [ ] Configure CORS in backend services
- [ ] Update OAuth callback URLs
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy

## 🐛 Troubleshooting

### Deployment Failed
```bash
# View detailed errors
gcloud deployment-manager deployments describe aplifyai-infrastructure

# Check operation logs
gcloud deployment-manager operations list
```

### Service Not Starting
```bash
# View service logs
gcloud run services logs read <SERVICE_NAME> --region us-central1

# Check service details
gcloud run services describe <SERVICE_NAME> --region us-central1
```

### Domain Not Working
1. Verify DNS propagation: `dig aplifyai.com`
2. Check SSL certificate: `gcloud compute ssl-certificates describe aplifyai-ssl-cert`
3. Wait 15-60 minutes for provisioning

## 📞 Support Resources

- **Cloud Console**: https://console.cloud.google.com/run?project=jobseek-459701
- **Deployment Manager Docs**: https://cloud.google.com/deployment-manager/docs
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **Domain Mapping**: https://cloud.google.com/run/docs/mapping-custom-domains

## 🚀 Ready to Deploy!

Run this command to deploy everything:

```bash
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web/deployment-manager
./deploy.sh
```

---

**Status**: ✅ Ready for Production Deployment  
**Infrastructure**: Unified under GCP Deployment Manager  
**Services**: 3 Cloud Run services + Load Balancer + Storage  
**Domain**: aplifyai.com  
**Estimated Cost**: $29-58/month  

**Created**: November 22, 2025
