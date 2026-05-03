# Docker Compose Setup Guide

## Overview

This Docker Compose configuration runs the complete KFC application stack with:
- **MongoDB** - Database (v7.0 Alpine)
- **Backend** - Node.js Express API (Port 8080)
- **Frontend** - React Application (Port 3000)

## Prerequisites

### Required Software

1. **Docker** - [Download](https://www.docker.com/products/docker-desktop)
   - Windows: Docker Desktop
   - Mac: Docker Desktop
   - Linux: Install Docker Engine and Docker Compose

2. **Docker Compose** - Usually included with Docker Desktop
   ```bash
   docker-compose --version
   ```

### Verify Installation

```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

**Output:**
```
Creating kfc-mongodb   ... done
Creating kfc-backend   ... done
Creating kfc-frontend  ... done
```

### 2. Check Service Status

```bash
docker-compose ps
```

**Output:**
```
NAME              STATUS              PORTS
kfc-mongodb       Up 2 minutes        27017/tcp
kfc-backend       Up 1 minute         0.0.0.0:8080->8080/tcp
kfc-frontend      Up 30 seconds       0.0.0.0:3000->3000/tcp
```

### 3. Access Applications

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **API Documentation:** http://localhost:8080/api-docs
- **MongoDB:** localhost:27017

### 4. Stop All Services

```bash
docker-compose down
```

To also remove volumes:
```bash
docker-compose down -v
```

## Service Configuration

### MongoDB Service

```yaml
mongodb:
  image: mongo:7.0-alpine
  ports: 27017:27017
  username: admin
  password: admin123456
  database: kfc-database
```

**Connection String (inside Docker):**
```
mongodb://admin:admin123456@mongodb:27017/kfc-database?authSource=admin
```

**Connection String (from Host):**
```
mongodb://admin:admin123456@localhost:27017/kfc-database?authSource=admin
```

### Backend Service

```yaml
backend:
  port: 8080
  environment:
    DB_URL: mongodb://admin:admin123456@mongodb:27017/kfc-database?authSource=admin
    FRONTEND_URL: http://localhost:3000
```

### Frontend Service

```yaml
frontend:
  port: 3000
  environment:
    REACT_APP_BACKEND_URL: http://localhost:8080
```

## Common Commands

### View Logs

**All services:**
```bash
docker-compose logs
```

**Specific service:**
```bash
docker-compose logs backend
docker-compose logs mongodb
docker-compose logs frontend
```

**Follow logs in real-time:**
```bash
docker-compose logs -f backend
```

### Execute Commands in Container

**Run command in backend:**
```bash
docker-compose exec backend npm list
```

**Access MongoDB shell:**
```bash
docker-compose exec mongodb mongosh --username admin --password admin123456
```

**Run command in frontend:**
```bash
docker-compose exec frontend npm list
```

### Rebuild Containers

After code changes:
```bash
docker-compose up -d --build
```

To rebuild specific service:
```bash
docker-compose up -d --build backend
```

### Remove Everything and Start Fresh

```bash
docker-compose down -v
docker-compose up -d
```

## Environment Variables

### Backend (.env)

Located in `Backend/.env`:
```env
PORT=8080
DB_URL=mongodb://admin:admin123456@mongodb:27017/kfc-database?authSource=admin
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

Located in `Frontend/kfc-react-app/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_ENV=production
```

## Troubleshooting

### Issue: Port Already in Use

**Error:**
```
Error response from daemon: driver failed programming external connectivity on endpoint
```

**Solution:**

Option 1 - Change port in docker-compose.yml:
```yaml
ports:
  - "8081:8080"  # Use 8081 instead of 8080
```

Option 2 - Stop conflicting service:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8080
kill -9 <PID>
```

### Issue: MongoDB Connection Refused

**Error:**
```
ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Check MongoDB is running:
   ```bash
   docker-compose ps mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Verify connection string uses service name:
   ```
   mongodb://admin:admin123456@mongodb:27017/...
   ```

### Issue: Backend Connection Timeout

**Error:**
```
MongooseError: Cannot connect to MongoDB
```

**Solution:**
1. Ensure MongoDB is healthy:
   ```bash
   docker-compose logs mongodb
   ```

2. Rebuild services:
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```

### Issue: Frontend Cannot Reach Backend

**Error:**
```
Failed to fetch http://localhost:8080/...
```

**Solution:**
1. Verify backend is running:
   ```bash
   curl http://localhost:8080/api/product
   ```

2. Check REACT_APP_BACKEND_URL in frontend .env

3. View frontend logs:
   ```bash
   docker-compose logs frontend
   ```

### Issue: Containers Not Starting

**Solution:**
1. Check logs:
   ```bash
   docker-compose logs
   ```

2. Rebuild images:
   ```bash
   docker-compose build --no-cache
   ```

3. Start again:
   ```bash
   docker-compose up -d
   ```

## Performance Optimization

### Memory Limits

Add to services in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Database Persistence

Data is stored in Docker volumes:
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect dramatic-road-5348_mongodb_data
```

## Production Considerations

### Change Default Credentials

1. Update MongoDB credentials in docker-compose.yml:
   ```yaml
   MONGO_INITDB_ROOT_USERNAME: your_username
   MONGO_INITDB_ROOT_PASSWORD: your_strong_password
   ```

2. Update Backend DB_URL:
   ```
   mongodb://your_username:your_strong_password@mongodb:27017/...
   ```

### Use Environment Files

Create `.env.production`:
```env
MONGO_ROOT_USERNAME=prodadmin
MONGO_ROOT_PASSWORD=strong_password_here
FRONTEND_URL=https://yourdomain.com
```

Load with:
```bash
docker-compose --env-file .env.production up -d
```

### Add Reverse Proxy (Nginx)

Add to docker-compose.yml:
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/nginx/ssl
  depends_on:
    - backend
    - frontend
  networks:
    - kfc-network
```

### Enable Docker Logging

```yaml
services:
  backend:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

## Backup and Restore

### Backup MongoDB Data

```bash
docker-compose exec mongodb mongodump --username admin --password admin123456 --out /data/db/backup
```

### Restore MongoDB Data

```bash
docker-compose exec mongodb mongorestore --username admin --password admin123456 /data/db/backup
```

## Monitoring

### Check Resource Usage

```bash
docker stats
```

### View Container Details

```bash
docker-compose ps -a
```

### Inspect Service Network

```bash
docker network inspect dramatic-road-5348_kfc-network
```

## Development Workflow

### Hot Reload

Frontend and Backend have volume mounts for development:
```yaml
volumes:
  - ./Backend:/app          # Hot reload backend
  - /app/node_modules       # Preserve node_modules
```

Changes are automatically detected and reloaded.

### Debug Container

```bash
# Start shell in container
docker-compose exec backend sh

# Run commands inside
# npm test
# npm run lint
```

## Deployment to Cloud

### Azure Container Instances

```bash
# Tag images
docker tag kfc-backend:latest your-registry.azurecr.io/kfc-backend:latest

# Push to registry
docker push your-registry.azurecr.io/kfc-backend:latest

# Deploy with ACI
az container create --resource-group mygroup --name kfc-app \
  --image your-registry.azurecr.io/kfc-backend:latest
```

### AWS ECS

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com

docker tag kfc-backend:latest your-account.dkr.ecr.us-east-1.amazonaws.com/kfc-backend:latest

docker push your-account.dkr.ecr.us-east-1.amazonaws.com/kfc-backend:latest
```

### Docker Swarm

```bash
docker swarm init
docker stack deploy -c docker-compose.yml kfc-app
```

### Kubernetes

```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml

# Deploy
kubectl apply -f *.yaml
```

## Cleanup

### Remove All Containers and Images

```bash
# Stop all containers
docker-compose down

# Remove images
docker rmi kfc-backend kfc-frontend mongo:7.0-alpine

# Remove volumes
docker volume prune

# Remove networks
docker network prune
```

### Remove Dangling Images

```bash
docker image prune -a
```

## Reference

### Docker Compose Files
- Main: `docker-compose.yml`
- Backend Dockerfile: `Backend/Dockerfile`
- Frontend Dockerfile: `Frontend/kfc-react-app/Dockerfile`

### Network Diagram

```
┌─────────────────────────────────────┐
│       Docker Compose Network        │
│        (kfc-network bridge)         │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Frontend │  │ Backend  │        │
│  │  Port    │  │  Port    │        │
│  │  3000    │  │  8080    │        │
│  └────┬─────┘  └────┬─────┘        │
│       │             │              │
│       └──────┬──────┘              │
│              │                     │
│         ┌────▼─────┐               │
│         │ MongoDB  │               │
│         │ Port     │               │
│         │ 27017    │               │
│         └──────────┘               │
│                                     │
└─────────────────────────────────────┘
```

---

**Last Updated:** May 3, 2026
**Docker Compose Version:** 3.8
**MongoDB Version:** 7.0
**Node.js Version:** 20 LTS
