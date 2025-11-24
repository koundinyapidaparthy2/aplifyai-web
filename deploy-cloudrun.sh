#!/bin/bash

# AplifyAI Web - Cloud Run Deployment Script
# This script deploys the Next.js app to Google Cloud Run

set -e  # Exit on error

# Configuration
PROJECT_ID="jobseek-459701"
SERVICE_NAME="aplifyai-web"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
CUSTOM_DOMAIN="aplifyai.com"

echo "🚀 Deploying AplifyAI Web to Cloud Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Domain: ${CUSTOM_DOMAIN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Set GCP project
echo ""
echo "📦 Step 1: Setting GCP project..."
gcloud config set project ${PROJECT_ID}

# Step 2: Enable required APIs
echo ""
echo "🔌 Step 2: Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Step 3: Build Docker image
echo ""
echo "🔨 Step 3: Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME} .

# Step 4: Deploy to Cloud Run
echo ""
echo "🚀 Step 4: Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 60s \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "NEXT_PUBLIC_APP_URL=https://${CUSTOM_DOMAIN}" \
  --set-env-vars "NEXTAUTH_URL=https://${CUSTOM_DOMAIN}"

# Step 5: Get service URL
echo ""
echo "🌐 Step 5: Getting service URL..."
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --format 'value(status.url)')

echo ""
echo "✅ Deployment successful!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Service URL: ${SERVICE_URL}"
echo ""
echo "📝 Next steps:"
echo "1. Map custom domain: gcloud run domain-mappings create --service ${SERVICE_NAME} --domain ${CUSTOM_DOMAIN} --region ${REGION}"
echo "2. Update DNS records to point to Cloud Run"
echo "3. Test the application: curl ${SERVICE_URL}"
echo ""
echo "🎉 Done!"
