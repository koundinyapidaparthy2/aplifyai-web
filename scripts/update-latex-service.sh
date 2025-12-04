#!/bin/bash

# Migrate LaTeX PDF Service from Compute Engine to Cloud Run
# This saves ~$30/month by using scale-to-zero instead of always-on VM

set -e

PROJECT_ID="jobseek-459701"
SERVICE_NAME="latex-pdf-service"
REGION="us-central1"
VM_NAME="latex-service-4n9c"
VM_ZONE="us-central1-c"

echo "🔄 Migrate LaTeX Service: Compute Engine → Cloud Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: ${PROJECT_ID}"
echo ""
echo "Current Setup (Compute Engine):"
echo "  - VM: ${VM_NAME}"
echo "  - Zone: ${VM_ZONE}"
echo "  - Cost: ~\$30/month (always running)"
echo ""
echo "New Setup (Cloud Run):"
echo "  - Service: ${SERVICE_NAME}"
echo "  - Region: ${REGION}"
echo "  - Memory: 2Gi, CPU: 2"
echo "  - minInstances: 0 (scale to zero)"
echo "  - Cost: ~\$0-10/month (pay per use)"
echo ""
echo "Estimated savings: ~\$20-30/month"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Continue with migration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled."
    exit 1
fi

# Step 1: Check if latex-pdf-service image exists
echo ""
echo "📦 Step 1: Checking for Docker image..."
if gcloud container images describe gcr.io/${PROJECT_ID}/latex-pdf-service:latest 2>/dev/null; then
    echo "✅ Image exists: gcr.io/${PROJECT_ID}/latex-pdf-service:latest"
else
    echo "⚠️  Image not found. You need to build and push it first:"
    echo ""
    echo "   cd /path/to/latex-pdf-service"
    echo "   gcloud builds submit --tag gcr.io/${PROJECT_ID}/latex-pdf-service:latest ."
    echo ""
    read -p "Have you built the image? Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 2: Deploy to Cloud Run
echo ""
echo "🚀 Step 2: Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image=gcr.io/${PROJECT_ID}/latex-pdf-service:latest \
    --region=${REGION} \
    --project=${PROJECT_ID} \
    --platform=managed \
    --allow-unauthenticated \
    --min-instances=0 \
    --max-instances=5 \
    --memory=2Gi \
    --cpu=2 \
    --timeout=300s \
    --concurrency=5 \
    --set-env-vars="NODE_ENV=production,PORT=8080,GCP_PROJECT_ID=${PROJECT_ID},GCP_BUCKET_NAME=latex-pdf-outputs-jobseek-459701"

# Step 3: Get the new URL
echo ""
echo "📍 Step 3: Getting Cloud Run URL..."
NEW_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region=${REGION} \
    --project=${PROJECT_ID} \
    --format='value(status.url)')

echo "✅ Cloud Run service deployed: ${NEW_URL}"

# Step 4: Test the new service
echo ""
echo "🧪 Step 4: Testing new service..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${NEW_URL}/health" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Health check passed!"
else
    echo "⚠️  Health check returned: ${HTTP_STATUS}"
    echo "   Service may still be starting up (cold start). Try again in a few seconds."
fi

# Step 5: Stop (not delete) the Compute Engine VM
echo ""
echo "🛑 Step 5: Stopping Compute Engine VM..."
echo "   (VM will be stopped, not deleted, in case you need to rollback)"
gcloud compute instances stop ${VM_NAME} \
    --zone=${VM_ZONE} \
    --project=${PROJECT_ID} \
    --quiet

echo ""
echo "✅ Migration complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Summary:"
echo "   Cloud Run URL: ${NEW_URL}"
echo "   Compute Engine VM: STOPPED (not deleted)"
echo ""
echo "🔧 Update your environment variables:"
echo "   LATEX_PDF_SERVICE_URL=${NEW_URL}"
echo ""
echo "🗑️  To permanently delete the VM (after testing):"
echo "   gcloud compute instances delete ${VM_NAME} --zone=${VM_ZONE} --project=${PROJECT_ID}"
echo ""
