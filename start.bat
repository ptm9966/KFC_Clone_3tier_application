@echo off

REM KFC Application Docker Compose Startup Script for Windows

echo ================================
echo KFC Application - Docker Setup
echo ================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed
    pause
    exit /b 1
)

echo ✅ Docker is installed: 
docker --version
echo ✅ Docker Compose is installed:
docker-compose --version
echo.

REM Verify .env file exists
if not exist "Backend\.env" (
    echo ⚠️  Backend\.env file not found
    echo Creating .env file...
    (
        echo DB_URL=mongodb://admin:admin123456@mongodb:27017/kfc-database?authSource=admin
        echo PORT=8080
        echo FRONTEND_URL=http://localhost:3000
    ) > Backend\.env
)

echo.
echo 🏗️  Building Docker images...
docker-compose build --no-cache

echo.
echo 🚀 Starting services...
docker-compose up -d

echo.
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak

echo.
echo 📊 Service Status:
docker-compose ps

echo.
echo ✅ All services are running!
echo.
echo ================================
echo Access Points:
echo ================================
echo Frontend (React):     http://localhost:3000
echo Backend API:          http://localhost:8080
echo API Documentation:    http://localhost:8080/api-docs
echo MongoDB:              localhost:27017
echo.
echo Credentials:
echo MongoDB Username:     admin
echo MongoDB Password:     admin123456
echo MongoDB Database:     kfc-database
echo.
echo ================================
echo Useful Commands:
echo ================================
echo View logs:            docker-compose logs -f
echo View backend logs:    docker-compose logs -f backend
echo Stop services:        docker-compose down
echo Stop ^& remove data:  docker-compose down -v
echo.
pause
