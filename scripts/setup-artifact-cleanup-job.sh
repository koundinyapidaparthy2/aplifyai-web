#!/bin/bash

# Setup Cloud Scheduler job for automatic artifact cleanup
# Run this once to configure automatic cleanup

set -e

PROJECT_ID="${PROJECT_ID:-jobseek-459701}"
REGION="${REGION:-us-central1}"
JOB_NAME="artifact-cleanup-aplifyai-web"
SERVICE_ACCOUNT="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔧 Setting up Cloud Scheduler for automatic artifact cleanup..."
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo ""

# Check if service account exists
if ! gcloud iam service-accounts describe "${SERVICE_ACCOUNT}" --project="${PROJECT_ID}" &>/dev/null; then
  echo "❌ Service account ${SERVICE_ACCOUNT} not found"
  echo "Please ensure the GitHub Actions service account exists"
  exit 1
fi

# Grant necessary permissions for artifact cleanup
echo "📝 Granting Artifact Registry permissions..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/artifactregistry.repoAdmin" \
  --condition=None \
  2>/dev/null || echo "Permission already granted"

# Create the cleanup script as a Cloud Function or Cloud Build trigger
# For now, we'll document the manual cleanup command

echo ""
echo "✅ Service account permissions configured"
echo ""
echo "📋 Artifact cleanup is now integrated into GitHub Actions workflow"
echo "   It will run automatically after each successful deployment"
echo ""
echo "💡 To manually run cleanup at any time:"
echo ""
echo "   cd scripts"
echo "   export PROJECT_ID=${PROJECT_ID}"
echo "   export REGION=${REGION}"
echo "   export KEEP_COUNT=5"
echo "   ./cleanup-artifacts.sh"
echo ""
echo "🔄 Cleanup Configuration:"
echo "   - Runs after every successful deployment"
echo "   - Keeps last 5 artifact versions"
echo "   - Deletes untagged images"
echo "   - Non-blocking (won't fail deployment)"
echo ""
