# AplifyAI Deployment - Quick Reference

## 🚀 Deploy Everything (One Command)

```bash
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web/deployment-manager
./deploy.sh
```

**Time**: 15-20 minutes  
**What it does**: Builds all images, deploys all services, configures networking

---

## 📋 What Gets Deployed

| Service | Type | Resources | URL |
|---------|------|-----------|-----|
| **aplifyai-web** | Cloud Run | 1Gi RAM, 1 CPU | https://aplifyai.com |
| **resume-generator** | Cloud Run | 2Gi RAM, 2 CPU | Auto-generated |
| **latex-pdf-service** | Cloud Run | 2Gi RAM, 2 CPU | Auto-generated |
| **Storage** | GCS | 2 buckets | gs://resume-generator-kp |
| **Load Balancer** | Global | SSL + Static IP | aplifyai.com |

---

## 🔍 Check Status

```bash
# View deployment
gcloud deployment-manager deployments describe aplifyai-infrastructure

# View service URLs
gcloud run services list --region us-central1

# View logs
gcloud run services logs read aplifyai-web --region us-central1
```

---

## 🔄 Update Deployment

```bash
# Edit config
vim deployment-manager/config.yaml

# Update deployment
gcloud deployment-manager deployments update aplifyai-infrastructure \
  --config deployment-manager/config.yaml
```

---

## 🗑️ Delete Everything

```bash
gcloud deployment-manager deployments delete aplifyai-infrastructure
```

---

## 🌐 DNS Setup

After deployment, update DNS:

```bash
# Get global IP
gcloud compute addresses describe aplifyai-global-ip --global --format='value(address)'
```

| Type | Name | Value |
|------|------|-------|
| A | @ | <GLOBAL_IP> |
| A | www | <GLOBAL_IP> |

---

## 💰 Cost

**Monthly**: $29-58 (typical usage)

- Cloud Run: $5-20
- Storage: $1-5
- Load Balancer: $18
- Egress: $5-15

---

## 📚 Full Documentation

- [Deployment Manager Guide](./deployment-manager/README.md)
- [Infrastructure Overview](./INFRASTRUCTURE.md)
- [Individual Deployment](./DEPLOYMENT.md)

---

## ⚡ Quick Commands

```bash
# Deploy
./deploy.sh

# Status
gcloud deployment-manager deployments describe aplifyai-infrastructure

# Update
gcloud deployment-manager deployments update aplifyai-infrastructure --config config.yaml

# Delete
gcloud deployment-manager deployments delete aplifyai-infrastructure

# Logs
gcloud run services logs read <SERVICE> --region us-central1

# Service URLs
gcloud run services describe <SERVICE> --region us-central1 --format='value(status.url)'
```
