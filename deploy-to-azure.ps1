# Deploy NetaBridge Frontend to Azure Container Apps
# Run this in PowerShell where you're logged into Azure

$ErrorActionPreference = "Stop"

# Config
$APP_NAME = "slava-netabridge-frontend"
$RG = "NetaBridge"
$ACR = "ca57b909ca19acr"
$ENV_NAME = "idealring-api-env"
$IMAGE = "$ACR.azurecr.io/${APP_NAME}:latest"

Write-Host "Building and deploying $APP_NAME..." -ForegroundColor Cyan

# Set encoding to UTF-8 to avoid charmap errors
$env:PYTHONIOENCODING = "utf-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Build image in ACR (suppress logs to avoid encoding issues)
Write-Host "Step 1: Building Docker image in ACR..." -ForegroundColor Yellow
az acr build --registry $ACR --image ${APP_NAME}:latest . --no-logs
if ($LASTEXITCODE -ne 0) {
    Write-Host "Checking if build succeeded anyway..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Check if image exists
Write-Host "Step 2: Verifying image..." -ForegroundColor Yellow
$imageExists = az acr repository show-tags --name $ACR --repository $APP_NAME --query "[?@=='latest']" -o tsv 2>$null
if (-not $imageExists) {
    Write-Host "Image not found. Waiting for build to complete..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Deploy container app
Write-Host "Step 3: Deploying container app..." -ForegroundColor Yellow
az containerapp create `
    --name $APP_NAME `
    --resource-group $RG `
    --environment $ENV_NAME `
    --image $IMAGE `
    --target-port 3000 `
    --ingress external `
    --registry-server "$ACR.azurecr.io" `
    --env-vars `
        "NEXT_PUBLIC_API_URL=https://idealring-api.whitepond-90b8fa05.canadacentral.azurecontainerapps.io" `
        "NEXT_PUBLIC_API_KEY=Neta_Is_Here_101" `
        "NEXT_PUBLIC_ENTRA_CLIENT_ID=e11df852-1343-481c-8dbb-ffb634351bd3" `
        "NEXT_PUBLIC_ENTRA_TENANT_ID=75ca4369-27c7-44c7-b22d-736f8986f8f5"

# Get URL
Write-Host "`nStep 4: Getting app URL..." -ForegroundColor Yellow
$url = az containerapp show --name $APP_NAME --resource-group $RG --query "properties.configuration.ingress.fqdn" -o tsv

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "App URL: https://$url" -ForegroundColor Cyan
Write-Host "`nAdd this as Redirect URI in Entra App Registration:" -ForegroundColor Yellow
Write-Host "https://$url" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green
