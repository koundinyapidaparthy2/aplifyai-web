# AplifyAI Deployment Manager

Complete infrastructure-as-code for deploying all AplifyAI services to Google Cloud Platform using Deployment Manager.

## 🏗️ Architecture

This deployment creates:

### Cloud Run Services
- **aplifyai-web** - Next.js web application (1Gi RAM, 1 CPU)
- **resume-generator** - Resume generation service (2Gi RAM, 2 CPU)
- **latex-pdf-service** - PDF conversion service (2Gi RAM, 2 CPU)

### Storage
- **resume-generator-kp** - Resume storage (7-day lifecycle)
- **latex-pdf-outputs-jobseek-459701** - PDF outputs (7-day lifecycle)

### Networking
- **Global Load Balancer** - HTTPS load balancing
- **Static IP** - For custom domain
- **SSL Certificate** - Google-managed SSL for aplifyai.com
- **HTTP → HTTPS Redirect** - Automatic redirect

## 📋 Prerequisites

1. **GCP Project**: `jobseek-459701`
2. **Domain**: `aplifyai.com` (configured in DNS)
3. **Docker Images**: Built and pushed to GCR
4. **Permissions**: Deployment Manager, Cloud Run, Storage, Compute Engine

## 🚀 Deployment

### Quick Deploy (Automated)

```bash
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web/deployment-manager
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. Enable required APIs
2. Build all Docker images
3. Create deployment
4. Configure services

**Time**: 15-20 minutes (first deployment)

### Manual Deployment

#### 1. Build Docker Images

```bash
# Web App
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web
gcloud builds submit --tag gcr.io/jobseek-459701/aplifyai-web:latest .

# Resume Generator
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/resume-generator
gcloud builds submit --tag gcr.io/jobseek-459701/resume-generator:latest .

# LaTeX PDF Service
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/latex-pdf-service
gcloud builds submit --tag gcr.io/jobseek-459701/latex-pdf-service:latest .
```

#### 2. Create Deployment

```bash
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web/deployment-manager

gcloud deployment-manager deployments create aplifyai-infrastructure \
  --config config.yaml \
  --project jobseek-459701
```

#### 3. Update Existing Deployment

```bash
gcloud deployment-manager deployments update aplifyai-infrastructure \
  --config config.yaml \
  --project jobseek-459701
```

## 📁 Files

```
deployment-manager/
├── config.yaml                          # Main configuration
├── cloud-run-web.yaml                   # Web app template
├── cloud-run-resume-generator.yaml      # Resume generator template
├── cloud-run-latex-service.yaml         # LaTeX service template
├── storage.yaml                         # GCS buckets
├── networking.yaml                      # Load balancer, SSL
├── deploy.sh                            # Automated deployment
└── README.md                            # This file
```

## 🔧 Configuration

### Edit Service Resources

Update `config.yaml`:

```yaml
resources:
  - name: aplifyai-web
    properties:
      memory: 1Gi      # Increase for more traffic
      cpu: "1"         # Increase for better performance
      maxInstances: 10 # Scale limit
      minInstances: 0  # Cold start vs cost tradeoff
```

### Update Environment Variables

```yaml
envVars:
  NODE_ENV: production
  CUSTOM_VAR: value
```

### Change Region

```yaml
properties:
  region: us-west1  # Change from us-central1
```

## 🌐 DNS Configuration

After deployment, get the global IP:

```bash
gcloud deployment-manager deployments describe aplifyai-infrastructure \
  --format="value(outputs[0].outputValue)"
```

Update DNS records:

| Type  | Name | Value |
|-------|------|-------|
| A     | @    | <GLOBAL_IP> |
| A     | www  | <GLOBAL_IP> |

Or use Cloud Run domain mapping (simpler):

```bash
gcloud run domain-mappings create \
  --service aplifyai-web \
  --domain aplifyai.com \
  --region us-central1
```

## 📊 Monitoring

### View Deployment

```bash
gcloud deployment-manager deployments describe aplifyai-infrastructure
```

### View Service URLs

```bash
# Web App
gcloud run services describe aplifyai-web --region us-central1 --format='value(status.url)'

# Resume Generator
gcloud run services describe resume-generator --region us-central1 --format='value(status.url)'

# LaTeX Service
gcloud run services describe latex-pdf-service --region us-central1 --format='value(status.url)'
```

### View Logs

```bash
# Web App
gcloud run services logs read aplifyai-web --region us-central1 --limit 50

# Resume Generator
gcloud run services logs read resume-generator --region us-central1 --limit 50

# LaTeX Service
gcloud run services logs read latex-pdf-service --region us-central1 --limit 50
```

### View Resources

```bash
# List all resources
gcloud deployment-manager resources list \
  --deployment aplifyai-infrastructure

# View specific resource
gcloud deployment-manager resources describe <RESOURCE_NAME> \
  --deployment aplifyai-infrastructure
```

## 🔄 Updates

### Update Service Configuration

1. Edit `config.yaml`
2. Run update:
   ```bash
   gcloud deployment-manager deployments update aplifyai-infrastructure \
     --config config.yaml
   ```

### Update Docker Images

1. Build new image:
   ```bash
   gcloud builds submit --tag gcr.io/jobseek-459701/aplifyai-web:latest .
   ```

2. Force new revision:
   ```bash
   gcloud run services update aplifyai-web \
     --image gcr.io/jobseek-459701/aplifyai-web:latest \
     --region us-central1
   ```

### Rollback

```bash
# List revisions
gcloud run revisions list --service aplifyai-web --region us-central1

# Rollback to previous revision
gcloud run services update-traffic aplifyai-web \
  --to-revisions <REVISION_NAME>=100 \
  --region us-central1
```

## 🗑️ Cleanup

### Delete Deployment

```bash
gcloud deployment-manager deployments delete aplifyai-infrastructure
```

This will delete:
- All Cloud Run services
- Load balancer
- SSL certificate
- Static IP
- **Note**: Storage buckets may need manual deletion due to data retention policies

### Delete Storage Buckets

```bash
gsutil rm -r gs://resume-generator-kp
gsutil rm -r gs://latex-pdf-outputs-jobseek-459701
```

## 🐛 Troubleshooting

### Deployment Failed

```bash
# View deployment errors
gcloud deployment-manager deployments describe aplifyai-infrastructure

# View operation logs
gcloud deployment-manager operations describe <OPERATION_NAME>
```

### Service Not Starting

```bash
# Check service logs
gcloud run services logs read <SERVICE_NAME> --region us-central1 --limit 50

# Check service details
gcloud run services describe <SERVICE_NAME> --region us-central1
```

### SSL Certificate Pending

SSL provisioning takes 15-60 minutes. Check status:

```bash
gcloud compute ssl-certificates describe aplifyai-ssl-cert
```

### Permission Denied

Grant Deployment Manager permissions:

```bash
PROJECT_NUMBER=$(gcloud projects describe jobseek-459701 --format="value(projectNumber)")

gcloud projects add-iam-policy-binding jobseek-459701 \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudservices.gserviceaccount.com" \
  --role="roles/editor"
```

## 💰 Cost Estimate

### Monthly Cost (Low Traffic)

| Service | Cost |
|---------|------|
| Cloud Run (3 services) | $5-15 |
| Cloud Storage (2 buckets) | $1-3 |
| Load Balancer | $18 |
| Egress | $5-10 |
| **Total** | **$29-46/month** |

### Cost Optimization

1. **Reduce min instances**: Set to 0 for dev/staging
2. **Smaller resources**: Use 512Mi RAM, 0.5 CPU
3. **Direct Cloud Run**: Skip load balancer, use Cloud Run domain mapping (saves $18/month)
4. **Lifecycle policies**: Already enabled (7-day deletion)

## 📚 References

- [Deployment Manager Docs](https://cloud.google.com/deployment-manager/docs)
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Load Balancer Docs](https://cloud.google.com/load-balancing/docs)
- [Domain Mapping Guide](https://cloud.google.com/run/docs/mapping-custom-domains)

## ✅ Checklist

- [ ] Docker images built and pushed to GCR
- [ ] Deployment Manager APIs enabled
- [ ] Deployment created successfully
- [ ] All services running
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] Custom domain accessible (https://aplifyai.com)
- [ ] Services can communicate with each other
- [ ] Storage buckets accessible
- [ ] Logs monitoring configured
- [ ] Backup strategy in place

---

**Ready to deploy!** Run `./deploy.sh` 🚀
