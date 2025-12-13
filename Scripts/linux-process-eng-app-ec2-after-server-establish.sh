#!/usr/bin/env bash

# Makes the script safer (exit on error, undefined vars, pipe failures)
set -euo pipefail

# -------------------------------------------------------------------
# USAGE:
# bash linux-process-eng-app-ec2-after-server-establish.sh "<Elastic-IP>" CalibrixEC2 process-eng-app 5000 "<Artifact-URL>"
# -------------------------------------------------------------------

# --- PARAMETERS ---
ELASTIC_IP=${1:-"127.0.0.1"}          # first arg
EC2_NAME=${2:-"CalibrixEC2"}          # second arg
CLIENT_NAME=${3:-"process-eng-app"}   # third arg
SERVER_PORT=${4:-"5000"}              # fourth arg
ARTIFACT_URL=${5:-""}                 # fifth arg (URL to prebuilt ZIP)
# -------------------------------------------------------------------

if [ -z "$ARTIFACT_URL" ]; then
    echo "❌ ERROR: You must provide ARTIFACT_URL as the 5th parameter."
    exit 1
fi

echo "=== Deploying $CLIENT_NAME to $EC2_NAME (server running on :$SERVER_PORT) ==="


# -------------------------------------------------------------------
# [1/10] DOWNLOAD & EXTRACT ARTIFACT
# -------------------------------------------------------------------
echo "[1/10] Downloading prebuilt artifact from: $ARTIFACT_URL"

TEMP_DIR="/opt/$EC2_NAME/${CLIENT_NAME}_artifact"
sudo rm -rf "$TEMP_DIR"
sudo mkdir -p "$TEMP_DIR"
sudo chown ubuntu:ubuntu "$TEMP_DIR"

cd "$TEMP_DIR"

curl -L -o artifact.zip "$ARTIFACT_URL"

echo "[2/10] Extracting artifact..."
unzip -o artifact.zip

if [ ! -d "$TEMP_DIR/build" ]; then
    echo "❌ ERROR: The artifact ZIP does NOT contain a build/ folder."
    echo "Make sure your CI pipeline uploads a ZIP with structure: build/index.html etc."
    exit 1
fi

echo "[2/10] Artifact ready. build/ folder found."


# -------------------------------------------------------------------
# [3/10] COPY STATIC BUILD TO NGINX WEB ROOT
# -------------------------------------------------------------------
echo "[3/10] Copying build/ files to /var/www/$CLIENT_NAME"

sudo mkdir -p "/var/www/$CLIENT_NAME"
sudo rsync -a --delete "$TEMP_DIR/build/" "/var/www/$CLIENT_NAME/"

echo "[3/10] Build deployed."


# -------------------------------------------------------------------
# [4/10] WRITE NGINX CONFIG
# -------------------------------------------------------------------
NGINX_AVAIL="/etc/nginx/sites-available/$CLIENT_NAME"
NGINX_ENABL="/etc/nginx/sites-enabled"

echo "[4/10] Writing Nginx config → $NGINX_AVAIL"

sudo tee "$NGINX_AVAIL" >/dev/null <<NGINX
server {
    listen 80;
    server_name ${ELASTIC_IP};
    
    # Serve React static build
    root "/var/www/${CLIENT_NAME}";
    index index.html;

    # SPA routing fallback
    location / {
        try_files \$uri /index.html;
    }

    # Proxy API calls to Node.js server (assumes Node on ${SERVER_PORT})
    location /api/ {
        proxy_pass http://127.0.0.1:${SERVER_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX


# -------------------------------------------------------------------
# [5/10] ENABLE NGINX SITE
# -------------------------------------------------------------------
echo "[5/10] Enabling nginx site and reloading..."

sudo ln -sf "$NGINX_AVAIL" "$NGINX_ENABL"
sudo rm -f /etc/nginx/sites-enabled/default # removes the default configuration
sudo nginx -t && sudo systemctl reload nginx


# -------------------------------------------------------------------
# Diagnostics
# -------------------------------------------------------------------
echo "[6/10] Checking active nginx server block"
sudo nginx -T | grep -A2 "server {" | sed -n '1,120p'

echo "[7/10] Testing static site"
curl -I http://127.0.0.1/

echo "[8/10] Testing backend proxy (/api)"
curl -i http://127.0.0.1/api/item-types

echo "[9/10] Testing backend directly"
curl -i "http://127.0.0.1:${SERVER_PORT}/api/item-types"

echo "[10/10] Testing through nginx → /api"
curl -i http://127.0.0.1/api/item-types


echo "=== DONE: $CLIENT_NAME static app deployed at http://$ELASTIC_IP ==="
