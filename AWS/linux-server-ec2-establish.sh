#!/usr/bin/env bash

#very common at the top of Bash scripts. It makes your script safer and stricter.
#makes a script stop immediately if:
#a command fails (-e)
#a variable isn’t set (-u)
#any command in a pipeline fails (pipefail)
set -euo pipefail

#usage
#bash ./linux-server-ec2-establish.sh ProductionServer

# --- CMD LINE PARAMETERS ---
SERVER_NAME=${1:-"ProductionServer"}
# ------------------

# --- CONFIGURATION ---
APP_PORT=5000                                         
NODE_MAJOR=18
TIMEZONE="Asia/Jerusalem"
# ------------------

# Resolve APP_DIR = one level up from where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"


echo "[1/5] Timezone"
sudo timedatectl set-timezone "$TIMEZONE"

echo "[2/5] Update OS"
sudo apt update && sudo apt -y upgrade

echo "[3/5] Install Node.js + tools"
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
sudo apt -y install nodejs nginx git unzip
cd "$APP_DIR/server"
npm ci --omit=dev         # install only production deps

echo "[4/5] Create systemd service"
sudo tee /etc/systemd/system/$SERVER_NAME.service >/dev/null <<UNIT
[Unit]
Description=$SERVER_NAME Node.js Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=$APP_DIR/server
ExecStart=/usr/bin/node $APP_DIR/server/server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now $SERVER_NAME
sudo systemctl status $SERVER_NAME --no-pager

echo "[5/5] Configure Nginx reverse proxy"
sudo tee /etc/nginx/sites-available/$SERVER_NAME >/dev/null <<NGINX
server {
    listen 80;
    server_name _;  # replace with domain if you have one

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
NGINX

#sudo ln -sf /etc/nginx/sites-available/$SERVER_NAME /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "=== DONE: Your app should be accessible via Elastic IP (port 80) ==="
