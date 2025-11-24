# Artifact Cleanup Automation

## Overview

Automatic cleanup of old Docker images in Google Artifact Registry to save storage costs and maintain a clean registry. The system keeps only the **last 5 artifacts** and deletes older versions.

## How It Works

### 1. GitHub Actions Integration (Automatic)

The cleanup runs automatically after every successful deployment:

```yaml
- name: Cleanup Old Artifacts
  if: success()
  run: |
    chmod +x scripts/cleanup-artifacts.sh
    ./scripts/cleanup-artifacts.sh
  env:
    PROJECT_ID: ${{ env.PROJECT_ID }}
    REGION: ${{ env.REGION }}
    KEEP_COUNT: 5
```

**Trigger:** After successful Cloud Run deployment  
**Frequency:** Every push to main/master branch  
**Retention:** Last 5 versions  
**Non-blocking:** Cleanup failures won't fail the deployment

### 2. Manual Cleanup

To manually run cleanup:

```bash
cd scripts
chmod +x cleanup-artifacts.sh

export PROJECT_ID=jobseek-459701
export REGION=us-central1
export KEEP_COUNT=5

./cleanup-artifacts.sh
```

### 3. Configuration

Adjust retention by setting `KEEP_COUNT` environment variable:

```bash
# Keep last 10 versions instead of 5
export KEEP_COUNT=10
./cleanup-artifacts.sh
```

## What Gets Cleaned Up

1. **Old Image Versions**
   - Sorts all images by creation time
   - Keeps the newest 5 versions
   - Deletes all older versions

2. **Untagged Images**
   - Removes images without tags
   - Frees up storage from failed builds

## Storage Savings

With automatic cleanup:
- **Before:** ~10-20 artifacts accumulate over time (~5-10 GB)
- **After:** Only 5 artifacts maintained (~2-3 GB)
- **Savings:** 60-70% storage reduction

## Verification

Check current artifacts:

```bash
# List all artifacts
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/jobseek-459701/cloud-run-source-deploy/aplifyai-web \
  --format="table(digest.slice(0:12),CREATE_TIME,SIZE)"

# Count artifacts
gcloud artifacts docker images list \
  us-central1-docker.pkg.dev/jobseek-459701/cloud-run-source-deploy/aplifyai-web \
  --format="value(digest)" | wc -l
```

## Monitoring

View cleanup logs in GitHub Actions:

1. Go to: https://github.com/koundinyapidaparthy2/aplifyai-web/actions
2. Click on latest deployment
3. Expand "Cleanup Old Artifacts" step
4. Review deletion summary

## Troubleshooting

### Cleanup Not Running

**Symptom:** More than 5 artifacts in registry

**Solution:**
```bash
# Manually run cleanup
cd scripts
./cleanup-artifacts.sh

# Check GitHub Actions logs
# Ensure step is not being skipped
```

### Permission Errors

**Symptom:** "Permission denied" errors

**Solution:**
```bash
# Grant artifact registry admin role
gcloud projects add-iam-policy-binding jobseek-459701 \
  --member="serviceAccount:github-actions@jobseek-459701.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.repoAdmin"
```

### Repository Not Found

**Symptom:** "Repository not found" errors

**Solution:**
This is normal if Cloud Run manages artifacts automatically. The cleanup will gracefully exit.

## Best Practices

1. **Don't Decrease Retention Too Much**
   - Keep at least 3-5 versions for rollback capability
   - Consider keeping more in production

2. **Monitor Storage Usage**
   ```bash
   # Check Artifact Registry storage
   gcloud artifacts repositories list \
     --location=us-central1 \
     --format="table(name,sizeBytes)"
   ```

3. **Review Cleanup Logs**
   - Check GitHub Actions after each deployment
   - Ensure cleanup is working as expected

4. **Emergency Rollback**
   - Keep enough versions for quick rollback
   - 5 versions = approximately 5 deployments back

## Cost Impact

**Artifact Registry Pricing:**
- Storage: $0.10 per GB per month
- Network egress: $0.12 per GB

**Estimated Savings:**
- 5 artifacts (~3 GB): ~$0.30/month
- 20 artifacts (~12 GB): ~$1.20/month
- **Monthly savings: ~$0.90** (for this service)
- **Annual savings: ~$11** (across all services)

## Files

- `scripts/cleanup-artifacts.sh` - Main cleanup script
- `scripts/setup-artifact-cleanup-job.sh` - Setup helper
- `.github/workflows/deploy-production.yml` - GitHub Actions integration

## Future Enhancements

Potential improvements:
1. Cloud Scheduler for daily cleanup runs
2. Slack/email notifications on cleanup
3. Metrics dashboard for storage trends
4. Per-environment retention policies
5. Integration with Cloud Monitoring
