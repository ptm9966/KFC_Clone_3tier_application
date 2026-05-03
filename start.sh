#!/bin/bash

# KFC Application Docker Compose Startup Script

set -e

echo "================================"
echo "KFC Application - Docker Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

echo "✅ Docker is installed: $(docker --version)"
echo "✅ Docker Compose is installed: $(docker-compose --version)"
echo ""

# Verify .env file exists
if [ ! -f "Backend/.env" ]; then
    echo "⚠️  Backend/.env file not found"
    echo "Creating .env file..."
    cp Backend/.env.example Backend/.env 2>/dev/null || echo "DB_URL=mongodb://admin:admin123456@mongodb:27017/kfc-database?authSource=admin
PORT=8080
FRONTEND_URL=http://localhost:3000" > Backend/.env
fi

# Build images if needed
echo "🏗️  Building Docker images..."
docker-compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ All services are running!"
echo ""
echo "================================"
echo "Access Points:"
echo "================================"
echo "Frontend (React):     http://localhost:3000"
echo "Backend API:          http://localhost:8080"
echo "API Documentation:    http://localhost:8080/api-docs"
echo "MongoDB:              localhost:27017"
echo ""
echo "Credentials:"
echo "MongoDB Username:     admin"
echo "MongoDB Password:     admin123456"
echo "MongoDB Database:     kfc-database"
echo ""
echo "================================"
echo "Useful Commands:"
echo "================================"
echo "View logs:            docker-compose logs -f"
echo "View backend logs:    docker-compose logs -f backend"
echo "Stop services:        docker-compose down"
echo "Stop & remove data:   docker-compose down -v"
echo ""
