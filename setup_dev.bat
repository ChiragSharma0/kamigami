@echo off
echo ========================================================
echo 🐳 Starting Kamigami Developer Setup (.bat version)
echo ========================================================

:: 0. Pull latest code from Git
echo 📥 Step 0: Pulling latest commits from Git...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git pull failed. Please check your internet connection or git credentials.
    pause
    exit /b %ERRORLEVEL%
)

:: 1. Verify Docker is installed and running
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Docker is not installed on your machine.
    echo Please download and install Docker Desktop before running this script:
    echo 👉 https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Docker is installed, but the daemon is not running.
    echo Please start the Docker Desktop application on your machine and try again.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running.

:: 2. Setup Default Local .env Files if missing
echo 📝 Step 2: Configuring development environment files...

if not exist "client\.env" (
    echo Creating client\.env...
    (
    echo VITE_API_BASE_URL=http://localhost:7000/api/v1
    echo VITE_GOOGLE_CLIENT_ID=324772130177-kojl265ao1toebb2rog9i4c7lc1l7afk.apps.googleusercontent.com
    ) > "client\.env"
) else (
    echo ✅ client\.env already exists.
)

if not exist "server\.env" (
    echo Creating server\.env...
    (
    echo PORT=7000
    echo NODE_ENV=development
    echo DATABASE_URL=postgresql://postgres:postgres@postgres:5432/kamigami?connection_limit=20
    echo REDIS_URL=redis://redis:6379
    echo JWT_ACCESS_SECRET=devsecret
    echo JWT_REFRESH_SECRET=devrefreshsecret
    echo AWS_ACCESS_KEY_ID=AKIA5VLEXLP32QXQBRPD
    echo AWS_SECRET_ACCESS_KEY=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
    echo AWS_S3_BUCKET_NAME=kamigami-images
    echo AWS_REGION=ap-southeast-2
    echo SHIPROCKET_EMAIL=thekamigamiofficial@gmail.com
    echo SHIPROCKET_PASSWORD=Shiprocket@09Kami
    echo SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
    echo DEFAULT_PICKUP_LOCATION=primary
    ) > "server\.env"
) else (
    echo ✅ server\.env already exists.
)

:: 3. Spin up Docker Stack
echo 🐳 Step 3: Launching local container network...
docker compose down
docker compose up -d --build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose build failed.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Wait for database and deploy schema
echo 🗄️ Step 4: Synchronizing database schema via Prisma...
echo Waiting 5 seconds for Postgres DB container to initialize...
timeout /t 5 /nobreak >nul
docker compose exec -T backend npx prisma migrate deploy
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Prisma migration failed.
    pause
    exit /b %ERRORLEVEL%
)

echo ========================================================
echo 🎉 Kamigami Developer Setup Completed Successfully!
echo ========================================================
echo 🖥️  Storefront Client   ➔  http://localhost:3000
echo 🛠️  Admin Control Panel ➔  http://localhost:3500
echo 🔌 Express Backend API  ➔  http://localhost:7000
echo ========================================================
pause
