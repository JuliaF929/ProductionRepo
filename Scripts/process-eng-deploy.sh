#!/bin/bash

set -e  # Exit immediately on error

### --- CONFIGURATION --- ###
OWNER="JuliaF929"
REPO="ProductionRepo"
ASSET_NAME="process-eng-app-build.zip"
TARGET_DIR="/var/www/process-eng-app"
BACKEND_SERVICE="ProductionServer"     # systemd service name (edit if needed)
USE_PM2=false                          # set to true if using PM2 instead of systemd

echo "----------------------------------------"
echo "Starting Calibrix UI Deployment"
echo "----------------------------------------"

### 1. Fetch latest release tag
echo "Fetching latest release tag from GitHub..."
LATEST_TAG=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/releases/latest" | jq -r '.tag_name')

if [[ -z "$LATEST_TAG" || "$LATEST_TAG" == "null" ]]; then
    echo "ERROR: Could not fetch latest tag. Aborting."
    exit 1
fi

echo "Latest release tag: $LATEST_TAG"

### 2. Get the asset download URL
echo "Fetching asset download URL..."

ASSET_URL=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/releases/latest" \
    | jq -r ".assets[] | select(.name==\"$ASSET_NAME\") | .browser_download_url")

if [[ -z "$ASSET_URL" || "$ASSET_URL" == "null" ]]; then
    echo "ERROR: Cannot find asset '$ASSET_NAME' in the release."
    exit 1
fi

echo "Download URL: $ASSET_URL"

### 3. Download artifact
echo "Downloading artifact..."
wget -q "$ASSET_URL" -O "/tmp/$ASSET_NAME"

echo "Downloaded to /tmp/$ASSET_NAME"

### 4. Remove old UI
echo "Cleaning old UI directory: $TARGET_DIR"
sudo rm -rf "$TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"

### 5. Unzip new build
echo "Extracting new UI build..."
sudo unzip -q "/tmp/$ASSET_NAME" -d "$TARGET_DIR"
sudo mv "$TARGET_DIR/build/"* "$TARGET_DIR/"
sudo rm -rf "$TARGET_DIR/build"


echo "Extraction completed successfully"

### 6. Restart backend
if [ "$USE_PM2" = true ]; then
    echo "Restarting backend via PM2..."
    pm2 restart all
else
    echo "Restarting backend service: $BACKEND_SERVICE"
    sudo systemctl restart "$BACKEND_SERVICE"
fi

echo "----------------------------------------"
echo "Deployment completed successfully"
echo "UI is now updated to version $LATEST_TAG"
echo "----------------------------------------"
