#!/bin/bash

# --- Kamigami Containerized Production Deployment Script ---
# Exit immediately if a command exits with a non-zero status
set -e

echo "========= 🚀 Starting Kamigami Deployment Process ========="

# 1. Pull latest code from Git
echo "📥 Step 1: Pulling latest commits from Git..."
git pull origin main

# 2. Spin up Docker Stack (Client, Admin, Backend, Postgres, Redis)
echo "🐳 Step 2: Rebuilding and launching all Docker containers..."
# Re-create containers to pick up code changes
docker compose down
docker compose up -d --build

# 3. Run Database Migrations
echo "🗄️ Step 3: Applying database migrations via Prisma..."
# Wait for postgres container health status to settle
echo "Waiting 5 seconds for Postgres DB startup..."
sleep 5
docker compose exec -T backend npx prisma migrate deploy

# 4. Reload Host Nginx Proxy (if applicable)
echo "⚙️ Step 4: Reloading host Nginx server..."
sudo systemctl reload nginx || echo "Note: No host Nginx reload needed or Nginx not installed on host."

echo "========= 🎉 Deployment Completed Successfully! ========="
