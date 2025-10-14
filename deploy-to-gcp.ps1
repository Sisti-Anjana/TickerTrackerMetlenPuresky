# Google Cloud Deployment Script
# Automated deployment for Ticket Tracking System

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

Write-Host "🚀 Starting Google Cloud Deployment..." -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host ""

# Set project
Write-Host "📦 Setting up Google Cloud project..." -ForegroundColor Yellow
gcloud config set project $ProjectId
gcloud config set run/region $Region

# Enable required services
Write-Host "🔧 Enabling required Google Cloud services..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

Write-Host "✅ Services enabled successfully!" -ForegroundColor Green
Write-Host ""

# Deploy Backend
Write-Host "🔨 Deploying Backend to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy ticket-system-backend `
    --source . `
    --dockerfile Dockerfile.backend `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars "SUPABASE_URL=https://tlnojwnrvvrnujnhdlrr.supabase.co" `
    --set-env-vars "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsbm9qd25ydnZybnVqbmhkbHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MjMwODgsImV4cCI6MjA3NTA5OTA4OH0.RO8AHtbWFPcqbUCpKylS5mXA24pSIWpQ5kXIs2Gs_BM" `
    --set-env-vars "JWT_SECRET=TanjTicketSystem2024SecureKey987654321" `
    --set-env-vars "PORT=8080" `
    --max-instances 10 `
    --memory 512Mi `
    --cpu 1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    
    # Get backend URL
    $backendUrl = gcloud run services describe ticket-system-backend --format="value(status.url)" --region $Region
    Write-Host "🌐 Backend URL: $backendUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update your frontend API configuration with this URL!" -ForegroundColor Yellow
    Write-Host ""
    
    # Deploy Frontend
    Write-Host "🎨 Deploying Frontend to Cloud Run..." -ForegroundColor Yellow
    gcloud run deploy ticket-system-frontend `
        --source . `
        --dockerfile Dockerfile.frontend `
        --platform managed `
        --region $Region `
        --allow-unauthenticated `
        --max-instances 10 `
        --memory 256Mi `
        --cpu 1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
        
        # Get frontend URL
        $frontendUrl = gcloud run services describe ticket-system-frontend --format="value(status.url)" --region $Region
        Write-Host "🌐 Frontend URL: $frontendUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Open your frontend: $frontendUrl" -ForegroundColor White
        Write-Host "2. Test all functionality" -ForegroundColor White
        Write-Host "3. Set up custom domain (optional)" -ForegroundColor White
        Write-Host "4. Configure monitoring and alerts" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
        Write-Host "Check logs: gcloud run logs read ticket-system-frontend" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    Write-Host "Check logs: gcloud run logs read ticket-system-backend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 View your services:" -ForegroundColor Cyan
Write-Host "https://console.cloud.google.com/run?project=$ProjectId" -ForegroundColor White
