#!/bin/bash

# Cleanup old Artifact Registry images, keeping only the last 5 versions
# This script should be run after successful deployments

set -e

PROJECT_ID="${PROJECT_ID:-jobseek-459701}"
REGION="${REGION:-us-central1}"
REPOSITORY="${REPOSITORY:-cloud-run-source-deploy}"
IMAGE_NAME="${IMAGE_NAME:-aplifyai-web}"
KEEP_COUNT="${KEEP_COUNT:-5}"

echo "🗑️  Starting artifact cleanup..."
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Repository: ${REPOSITORY}"
echo "Image: ${IMAGE_NAME}"
echo "Keeping last ${KEEP_COUNT} versions"
echo ""

# Full image path
IMAGE_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}"

# Get all image digests sorted by creation time (newest first)
DIGESTS=$(gcloud artifacts docker images list "${IMAGE_PATH}" \
  --format="value(digest)" \
  --sort-by="~CREATE_TIME" \
  2>/dev/null || echo "")

if [ -z "$DIGESTS" ]; then
  echo "ℹ️  No artifacts found or unable to access repository"
  echo "This is normal if artifacts are automatically managed by Cloud Run"
  exit 0
fi

# Count total images
TOTAL_COUNT=$(echo "$DIGESTS" | wc -l | tr -d ' ')
echo "📦 Found ${TOTAL_COUNT} total artifacts"

if [ "$TOTAL_COUNT" -le "$KEEP_COUNT" ]; then
  echo "✅ Only ${TOTAL_COUNT} artifacts exist. Nothing to clean up."
  exit 0
fi

# Calculate how many to delete
DELETE_COUNT=$((TOTAL_COUNT - KEEP_COUNT))
echo "🗑️  Will delete ${DELETE_COUNT} old artifacts"
echo ""

# Skip the first KEEP_COUNT images and delete the rest
COUNTER=0
DELETED=0
FAILED=0

echo "$DIGESTS" | while read -r DIGEST; do
  COUNTER=$((COUNTER + 1))
  
  if [ "$COUNTER" -le "$KEEP_COUNT" ]; then
    echo "✓ Keeping artifact #${COUNTER}: ${DIGEST:0:12}..."
  else
    echo "🗑️  Deleting artifact #${COUNTER}: ${DIGEST:0:12}..."
    
    if gcloud artifacts docker images delete \
      "${IMAGE_PATH}@${DIGEST}" \
      --quiet \
      --delete-tags 2>/dev/null; then
      DELETED=$((DELETED + 1))
      echo "  ✅ Deleted successfully"
    else
      FAILED=$((FAILED + 1))
      echo "  ⚠️  Failed to delete (may already be deleted)"
    fi
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo "   Deleted: ${DELETED} artifacts"
if [ "$FAILED" -gt 0 ]; then
  echo "   Failed: ${FAILED} artifacts (non-critical)"
fi

# Also cleanup untagged images
echo ""
echo "🗑️  Cleaning up untagged images..."
gcloud artifacts docker images list "${IMAGE_PATH}" \
  --format="value(digest)" \
  --filter="tags:*=null" \
  2>/dev/null | while read -r DIGEST; do
    echo "  Deleting untagged: ${DIGEST:0:12}..."
    gcloud artifacts docker images delete \
      "${IMAGE_PATH}@${DIGEST}" \
      --quiet 2>/dev/null || echo "  ⚠️  Failed (may already be deleted)"
done

echo ""
echo "✅ All cleanup operations complete!"
