#!/bin/bash
# Exit immediately if any command fails
set -e

# Assign positional arguments
TARGET_USER=$1
TARGET_IP=$2
APP_PATH=$3
SOURCE_DIR=$4
SSH_KEY="/root/.ssh/runner-vm"

echo "========================================="
echo "🚀 Starting Deployment for path: $APP_PATH"
echo "========================================="

# Common SSH configuration flags
SSH_FLAGS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# Step 1: Create remote folder structure and grant permissions
echo "📁 Preparing remote directory infrastructure..."
ssh $SSH_FLAGS "${TARGET_USER}@${TARGET_IP}" "sudo mkdir -p $APP_PATH && sudo chown -R ${TARGET_USER}:${TARGET_USER} $APP_PATH"

# Step 2: Deploy config files via SCP (using /. to copy folder contents safely)
echo "📦 Syncing configuration files securely..."
scp $SSH_FLAGS -r "${SOURCE_DIR}/*" "${TARGET_USER}@${TARGET_IP}:${APP_PATH}/"

# Step 3: Run the local docker stack
echo "🐳 Rebuilding Docker configuration stack..."
ssh $SSH_FLAGS "${TARGET_USER}@${TARGET_IP}" "
  cd $APP_PATH && \
  if [ -f docker-compose.yml ] || [ -f compose.yml ]; then
    docker compose down && \
    docker compose up -d --force-recreate
  else
    echo '⚠️ Warning: No docker-compose file found in target path!'
  fi
"

echo "✨ Deployment complete successfully!"
