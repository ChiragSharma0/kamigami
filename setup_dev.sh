#!/bin/bash

# --- Kamigami Local Developer Setup Script (Docker Version) ---
set -e

echo "========= 🐳 Starting Kamigami Developer Setup ========="

# 1. Verify Docker is installed and running
if ! command -v docker &> /dev/null; then
  echo "❌ Error: Docker is not installed on your machine."
  echo "Please download and install Docker Desktop before running this script:"
  echo "👉 https://www.docker.com/products/docker-desktop"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo "❌ Error: Docker is installed, but the daemon is not running."
  echo "Please start the Docker Desktop application on your machine and try again."
  exit 1
fi

echo "✅ Docker is installed and running."

# 2. Setup Default Local .env Files if missing
echo "📝 Step 2: Configuring development environment files..."

# Client Env
if [ ! -f client/.env ]; then
  echo "Creating client/.env..."
  cat <<EOT > client/.env
VITE_API_BASE_URL=http://localhost:7000/api/v1
VITE_GOOGLE_CLIENT_ID=324772130177-kojl265ao1toebb2rog9i4c7lc1l7afk.apps.googleusercontent.com
EOT
else
  echo "✅ client/.env already exists."
fi

# Server Env
if [ ! -f server/.env ]; then
  echo "Creating server/.env..."
  cat <<EOT > server/.env
PORT=7000
NODE_ENV=development

# Database & Redis target internal docker containers (using compose service names)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kamigami?connection_limit=20
REDIS_URL=redis://redis:6379

JWT_ACCESS_SECRET=devsecret
JWT_REFRESH_SECRET=devrefreshsecret

AWS_ACCESS_KEY_ID=AKIA5VLEXLP32QXQBRPD
AWS_SECRET_ACCESS_KEY=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
AWS_S3_BUCKET_NAME=kamigami-images
AWS_REGION=ap-southeast-2

SHIPROCKET_EMAIL=thekamigamiofficial@gmail.com
SHIPROCKET_PASSWORD=Shiprocket@09Kami
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
DEFAULT_PICKUP_LOCATION=primary
EOT
else
  echo "✅ server/.env already exists."
fi

# 3. Spin up Docker Stack
echo "🐳 Step 3: Launching local container network..."
docker compose down
docker compose up -d --build

# 4. Wait for database and deploy schema
echo "🗄️ Step 4: Synchronizing database schema via Prisma..."
echo "Waiting 5 seconds for Postgres DB container to initialize..."
sleep 5
docker compose exec -T backend npx prisma migrate deploy

echo "========================================================"
echo "🎉 Kamigami Developer Setup Completed Successfully!"
echo "========================================================"
echo "🖥️  Storefront Client   ➔  http://localhost:6000"
echo "🛠️  Admin Control Panel ➔  http://localhost:6500"
echo "🔌 Express Backend API  ➔  http://localhost:7000"
echo "========================================================"
