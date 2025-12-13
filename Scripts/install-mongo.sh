#!/bin/bash
set -e

echo "=== Starting MongoDB installation and replica set setup ==="

# ------------------------------------------------------------------------------
# 1. Install MongoDB ONLY if missing
# ------------------------------------------------------------------------------

if ! command -v mongod >/dev/null 2>&1; then
    echo "=== Adding MongoDB GPG Key ==="
    wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

    echo "=== Adding MongoDB repository ==="
    echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
        | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

    echo "=== Updating system ==="
    sudo apt update

    echo "=== Installing MongoDB ==="
    sudo apt install -y mongodb-org
else
    echo "=== MongoDB already installed — skipping installation ==="
fi

# ------------------------------------------------------------------------------
# 2. Stop MongoDB before modifying config
# ------------------------------------------------------------------------------

echo "=== Stopping MongoDB service ==="
sudo systemctl stop mongod

# ------------------------------------------------------------------------------
# 3. Update mongod.conf with replica set
# ------------------------------------------------------------------------------

echo "=== Configuring replica set in mongod.conf ==="

# Add the replication block ONLY if not already present
if ! grep -q "replication:" /etc/mongod.conf; then
    sudo bash -c 'echo "
replication:
  replSetName: \"rs0\"
" >> /etc/mongod.conf'
    echo "Replica set block added."
else
    echo "Replica set already configured — skipping."
fi

# Optional: allow external access (same as before)
if grep -q "bindIp: 127.0.0.1" /etc/mongod.conf; then
    sudo sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf
    echo "bindIp updated to 0.0.0.0"
fi

# ------------------------------------------------------------------------------
# 4. Restart MongoDB
# ------------------------------------------------------------------------------

echo "=== Starting MongoDB ==="
sudo systemctl start mongod
sudo systemctl enable mongod

echo "Waiting for MongoDB to start..."
sleep 5

# ------------------------------------------------------------------------------
# 5. Initialize replica set (only if not initialized yet)
# ------------------------------------------------------------------------------

echo "=== Checking replica set status ==="

RS_STATUS=$(mongosh --quiet --eval "rs.status().ok" || echo "0")

if [ "$RS_STATUS" != "1" ]; then
    echo "=== Initializing replica set ==="
    mongosh --quiet --eval "rs.initiate()" || true
else
    echo "Replica set already initialized — skipping."
fi

echo "=== Replica set setup completed ==="
