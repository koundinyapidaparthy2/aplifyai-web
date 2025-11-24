# GitHub Actions Secrets Setup

To enable automatic deployment, add the following secrets to your GitHub repository:

## Required Secrets

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### 1. GCP_SA_KEY
**Description:** Google Cloud Service Account JSON key for authentication

**How to create:**
```bash
# Create a service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant necessary roles
gcloud projects add-iam-policy-binding jobseek-459701 \
  --member="serviceAccount:github-actions@jobseek-459701.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding jobseek-459701 \
  --member="serviceAccount:github-actions@jobseek-459701.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding jobseek-459701 \
  --member="serviceAccount:github-actions@jobseek-459701.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@jobseek-459701.iam.gserviceaccount.com

# Copy the entire contents of key.json and paste as GCP_SA_KEY secret
cat key.json
```

### 2. NEXTAUTH_SECRET
**Description:** Secret key for NextAuth.js session encryption

**How to create:**
```bash
openssl rand -base64 32
```

### 3. FIREBASE_TOKEN
**Description:** Firebase CI token for hosting deployment

**How to create:**
```bash
firebase login:ci
```
Copy the token and add as secret.

### 4. OAuth Secrets (Optional - if you have OAuth configured)

#### GOOGLE_CLIENT_ID
- Get from: https://console.cloud.google.com/apis/credentials

#### GOOGLE_CLIENT_SECRET
- Get from: https://console.cloud.google.com/apis/credentials

#### GITHUB_CLIENT_ID
- Get from: https://github.com/settings/developers

#### GITHUB_CLIENT_SECRET
- Get from: https://github.com/settings/developers

## Verify Setup

After adding all secrets:
1. Push to main/master branch
2. Go to `Actions` tab in GitHub
3. Watch the deployment workflow run
4. Check the deployment at https://aplifyai.com

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs
2. Verify all secrets are added correctly
3. Ensure service account has correct permissions
4. Check Cloud Run deployment logs: `gcloud logging read`
