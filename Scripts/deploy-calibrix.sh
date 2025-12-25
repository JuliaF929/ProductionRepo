#!/bin/bash

#usage:
#bash deploy-calibrix.sh CalibrixEC2 1.0.22.0 ProductionServer

# -----------------------------
# PARAMETERS
# -----------------------------
EC2_NAME="$1"
CALIBRIX_VER="$2"
SERVER_NAME="$3"

# -----------------------------
# VALIDATION
# -----------------------------
if [ -z "$EC2_NAME" ] || [ -z "$CALIBRIX_VER" ] || [ -z "$SERVER_NAME" ]; then
  echo "Usage: $0 <EC2_NAME> <CALIBRIX_VER> <SERVER_NAME>"
  exit 1
fi

APP_DIR="/opt/$EC2_NAME"

# -----------------------------
# 1. cd /opt/<EC2_NAME>
# -----------------------------
if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: Directory $APP_DIR does not exist!"
  exit 1
fi

cd "$APP_DIR" || exit 1
echo "Working in: $APP_DIR"

# -----------------------------
# 2. git pull origin main
# -----------------------------
echo "Pulling latest code..."
git pull origin main || {
  echo "ERROR: git pull failed"
  exit 1
}

# -----------------------------
# 3. Update CALIBRIX_SERVER_VERSION in /opt/<EC2_NAME>/server/.env
# -----------------------------
ENV_FILE="$APP_DIR/server/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE does not exist!"
  exit 1
fi

echo "Updating CALIBRIX_SERVER_VERSION to $CALIBRIX_VER in $ENV_FILE"

# Remove existing line
sed -i '/^CALIBRIX_SERVER_VERSION=/d' "$ENV_FILE"

# Add new version line
echo "CALIBRIX_SERVER_VERSION=$CALIBRIX_VER" >> "$ENV_FILE"

# -----------------------------
# 4. Restart <SERVER_NAME>
# -----------------------------
echo "Restarting service: $SERVER_NAME"
sudo systemctl restart "$SERVER_NAME"

if ! systemctl is-active --quiet "$SERVER_NAME"; then
  echo "ERROR: Service $SERVER_NAME failed to restart!"
  exit 1
fi

echo "Server restarted successfully."

# -----------------------------
# 5. Get process-eng-app artifact from GitHub Releases
# -----------------------------
OWNER="JuliaF929"
REPO="ProductionRepo"
ASSET_NAME="process-eng-app-build.zip"

echo "Fetching latest frontend artifact from GitHub..."

ASSET_URL=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/releases/latest" \
  | jq -r ".assets[] | select(.name==\"$ASSET_NAME\") | .browser_download_url")

if [[ -z "$ASSET_URL" || "$ASSET_URL" == "null" ]]; then
  echo "ERROR: Could not find artifact $ASSET_NAME"
  exit 1
fi

TMP_FILE="/tmp/$ASSET_NAME"
echo "Downloading $ASSET_NAME..."
wget -q "$ASSET_URL" -O "$TMP_FILE"

# -----------------------------
# 6. Put static files at /var/www/process-eng-app/
# -----------------------------
TARGET_DIR="/var/www/process-eng-app"

echo "Cleaning target static directory..."
sudo rm -rf "$TARGET_DIR"
sudo mkdir -p "$TARGET_DIR"

echo "Unzipping frontend artifact..."
sudo unzip -q "$TMP_FILE" -d "$TARGET_DIR"

echo "Moving frontend static files from build folder to parent folder..."
sudo mv "$TARGET_DIR/build/"* "$TARGET_DIR/"
sudo rm -rf "$TARGET_DIR/build"

echo "Frontend updated successfully."

# -----------------------------
# DONE
# -----------------------------
echo "========================================="
echo "Calibrix deployment completed!"
echo "Version: $CALIBRIX_VER"
echo "Server:  $SERVER_NAME"
echo "App Dir: $APP_DIR"
echo "Static:  $TARGET_DIR"
echo "========================================="
