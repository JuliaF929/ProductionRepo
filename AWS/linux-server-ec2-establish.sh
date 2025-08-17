#!/usr/bin/env bash

#very common at the top of Bash scripts. It makes your script safer and stricter.
#makes a script stop immediately if:
#a command fails (-e)
#a variable isn’t set (-u)
#any command in a pipeline fails (pipefail)
set -euo pipefail

#usage
#chmod +x linux-server-ec2-establish.sh
#./linux-server-ec2-establish.sh https://github.com/JuliaF929/ProductionRepo.git ProductionEC2 ProductionServer

# --- PARAMETERS ---
GIT_REPO=${1:-"https://github.com/JuliaF929/ProductionRepo.git"}  # first arg
EC2_NAME=${2:-"ProductionEC2"}                                    # second arg
SERVER_NAME=${3:-"ProductionServer"}                              # third arg
APP_PORT=5000                                         
NODE_MAJOR=18
TIMEZONE="Asia/Jerusalem"
# ------------------

echo "=== Setup for EC2: $EC2_NAME, Service: $SERVER_NAME ==="

echo "[1/7] Timezone"
sudo timedatectl set-timezone "$TIMEZONE"

echo "[2/7] Update OS"
sudo apt update && sudo apt -y upgrade

echo "[3/7] Prepare app dir"
APP_DIR="/opt/$EC2_NAME"
sudo mkdir -p "$APP_DIR"
sudo chown ubuntu:ubuntu "$APP_DIR"

echo "[4/7] Install Node.js + tools"
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | sudo -E bash -
sudo apt -y install nodejs nginx git unzip

echo "[5/7] Get app & install deps"
cd "$APP_DIR"
git clone "$GIT_REPO" .   # clone repo into APP_DIR
cd "$APP_DIR/server"
npm ci --omit=dev         # install only production deps

echo "[6/7] Create systemd service"
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

echo "[7/7] Configure Nginx reverse proxy"
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
