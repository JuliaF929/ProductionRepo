#!/usr/bin/env bash

#very common at the top of Bash scripts. It makes your script safer and stricter.
#makes a script stop immediately if:
#a command fails (-e)
#a variable isn’t set (-u)
#any command in a pipeline fails (pipefail)
set -euo pipefail

#usage
#this script shall be run to publish process-eng-app at the same EC2 as a server
#it shall run after running linux-server-ec2-establish.sh
#chmod +x linux-process-eng-app-ec2-after-server-establish.sh
#./linux-process-eng-app-ec2-after-server-establish.sh "<put here the Elastic IP allocated>" CalibrixEC2 process-eng-app 5000

# --- PARAMETERS ---
ELASTIC_IP=${1:-"127.0.0.1"}        # first arg
EC2_NAME=${2:-"CalibrixEC2"}      # second arg
CLIENT_NAME=${3:-"process-eng-app"} # third arg
SERVER_PORT=${4:-"5000"}            # fourth arg                                         
# ------------------

echo "=== Setup for $CLIENT_NAME at $EC2_NAME (assumes server is already running on :$SERVER_PORT) ==="

echo "[1/10] Build the react application (client)"
cd "/opt/$EC2_NAME/$CLIENT_NAME"
npm ci
npm run build

echo "[2/10] Status: /opt/$EC2_NAME/$CLIENT_NAME/build/ created"


echo "[3/10] Copy build output into Nginx-s web root"
sudo mkdir -p "/var/www/$CLIENT_NAME"
sudo rsync -a --delete "/opt/$EC2_NAME/$CLIENT_NAME/build/" "/var/www/$CLIENT_NAME/"

NGINX_AVAIL="/etc/nginx/sites-available/$CLIENT_NAME"
NGINX_ENABL="/etc/nginx/sites-enabled"

echo "[4/10] Write Nginx site $NGINX_AVAIL (React + /api proxy)"
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

echo "[5/10] Enable nginx, disable default nginx configuration and reload"
sudo ln -sf "$NGINX_AVAIL" "$NGINX_ENABL"
sudo rm -f /etc/nginx/sites-enabled/default # removes the default configuration
sudo nginx -t && sudo systemctl reload nginx

echo "[6/10] Quick checks - Which site is active"
sudo nginx -T | grep -A2 "server {" | sed -n '1,120p'

echo "[7/10] Quick checks - Does your SPA serve"
curl -I http://127.0.0.1/

echo "[8/10] Quick checks - Does the API proxy work?"
curl -i http://127.0.0.1/api/item-types

echo "[9/10] Quick checks - Server from EC2"
curl -i "http://127.0.0.1:${SERVER_PORT}/api/item-types"

echo "[10/10] Quick checks - Through Nginx"
curl -i http://127.0.0.1/api/item-types

echo "=== DONE: $CLIENT_NAME app should be accessible at browser at http://$ELASTIC_IP with server connected ==="
