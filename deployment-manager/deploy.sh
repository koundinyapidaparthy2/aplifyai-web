#!/bin/bash

# AplifyAI Complete Infrastructure Deployment
# Uses GCP Deployment Manager to deploy all services

set -e

PROJECT_ID="jobseek-459701"
DEPLOYMENT_NAME="aplifyai-infrastructure"
REGION="us-central1"

echo "🚀 AplifyAI Infrastructure Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project: ${PROJECT_ID}"
echo "Deployment: ${DEPLOYMENT_NAME}"
echo "Region: ${REGION}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Set project
echo ""
echo "📦 Setting GCP project..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo ""
echo "🔌 Enabling required APIs..."
gcloud services enable deploymentmanager.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable compute.googleapis.com

# Build Docker images
echo ""
echo "🔨 Building Docker images..."
echo "This may take 10-15 minutes for first build..."

# Build Web App
echo ""
echo "Building aplifyai-web..."
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web
gcloud builds submit --tag gcr.io/${PROJECT_ID}/aplifyai-web:latest .

# Build Resume Generator
echo ""
echo "Building resume-generator..."
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/resume-generator
gcloud builds submit --tag gcr.io/${PROJECT_ID}/resume-generator:latest -f Dockerfile.simple .

# Build LaTeX PDF Service
echo ""
echo "Building latex-pdf-service..."
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/latex-pdf-service
gcloud builds submit --tag gcr.io/${PROJECT_ID}/latex-pdf-service:latest .

# Deploy with Deployment Manager
echo ""
echo "🚀 Deploying infrastructure with Deployment Manager..."
cd /Users/koundinya.pidaparthy/Desktop/P1kp/JobSeek/aplifyai-web/deployment-manager

# Check if deployment exists
if gcloud deployment-manager deployments describe ${DEPLOYMENT_NAME} --project=${PROJECT_ID} 2>/dev/null; then
    echo "Deployment exists. Updating..."
    gcloud deployment-manager deployments update ${DEPLOYMENT_NAME} \
        --config config.yaml \
        --project ${PROJECT_ID}
else
    echo "Creating new deployment..."
    gcloud deployment-manager deployments create ${DEPLOYMENT_NAME} \
        --config config.yaml \
        --project ${PROJECT_ID}
fi

# Get deployment outputs
echo ""
echo "📊 Deployment outputs:"
gcloud deployment-manager deployments describe ${DEPLOYMENT_NAME} \
    --project ${PROJECT_ID} \
    --format="value(outputs)"

echo ""
echo "✅ Deployment complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo "1. Update DNS records for aplifyai.com to point to the global IP"
echo "2. Wait 15-60 minutes for SSL certificate provisioning"
echo "3. Test services:"
echo "   - Web App: https://aplifyai.com"
echo "   - Resume Generator: Check Cloud Run console"
echo "   - LaTeX Service: Check Cloud Run console"
echo ""
echo "🔍 View deployment:"
echo "gcloud deployment-manager deployments describe ${DEPLOYMENT_NAME}"
echo ""
echo "🗑️  Delete deployment (if needed):"
echo "gcloud deployment-manager deployments delete ${DEPLOYMENT_NAME}"
echo ""
