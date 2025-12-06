#!/usr/bin/env bash

#very common at the top of Bash scripts. It makes your script safer and stricter.
#makes a script stop immediately if:
#a command fails (-e)
#a variable isn’t set (-u)
#any command in a pipeline fails (pipefail)
set -euo pipefail

#usage
# bash ./clone-git-repo.sh https://github.com/JuliaF929/ProductionRepo.git CalibrixEC2

# --- PARAMETERS ---
GIT_REPO=${1:-"https://github.com/JuliaF929/ProductionRepo.git"}  # first arg
EC2_NAME=${2:-"CalibrixEC2"}                                      # second arg
# ------------------

echo "[1/2] Prepare app dir"
APP_DIR="/opt/$EC2_NAME"
sudo mkdir -p "$APP_DIR"
sudo chown ubuntu:ubuntu "$APP_DIR"

echo "[2/2] Get app & install deps"
cd "$APP_DIR"
git clone "$GIT_REPO" .   # clone repo into APP_DIR
cd "$APP_DIR/server"
npm ci --omit=dev         # install only production deps