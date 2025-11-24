#!/bin/bash

# Quick Deploy - AplifyAI Web App Only
# Backend services already running

set -e

PROJECT_ID="jobseek-459701"
REGION="us-central1"
SERVICE_NAME="aplifyai-web"

echo "🚀 Deploying AplifyAI Web App"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get resume generator URL
RESUME_GEN_URL=$(gcloud run services describe resume-generator --region ${REGION} --format='value(status.url)' 2>/dev/null || echo "https://resume-generator-148210206342.us-central1.run.app")

echo ""
echo "📦 Backend Services:"
echo "   Resume Generator: ${RESUME_GEN_URL}"

echo ""
echo "🔨 Building and deploying..."
echo "This will take ~5-8 minutes"

# Build and deploy in one command
gcloud run deploy ${SERVICE_NAME} \
  --source . \
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
  --set-env-vars "NEXT_PUBLIC_APP_URL=https://aplifyai.com" \
  --set-env-vars "NEXTAUTH_URL=https://aplifyai.com" \
  --set-env-vars "AUTH_TRUST_HOST=true" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_PROJECT_ID=jobseek-459701" \
  --set-env-vars "GCP_PROJECT_ID=jobseek-459701" \
  --set-env-vars "GCP_BUCKET_NAME=resume-generator-kp" \
  --set-env-vars "RESUME_GENERATOR_URL=${RESUME_GEN_URL}"

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')

echo ""
echo "✅ Deployment successful!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Service URL: ${SERVICE_URL}"
echo ""
echo "📝 Next steps:"
echo "1. Map custom domain:"
echo "   gcloud run domain-mappings create --service ${SERVICE_NAME} --domain aplifyai.com --region ${REGION}"
echo ""
echo "2. Test the service:"
echo "   curl ${SERVICE_URL}"
echo ""
echo "🎉 Done!"
