# KFC Clone 3-Tier Application

A fullstack restaurant clone with separate frontend, backend, and MongoDB services.

This repository supports running each component independently using its own Dockerfile, as well as a combined Docker Compose setup.

---

## Project Structure

- `Backend/` - Node.js + Express API
- `Frontend/` - React application served by Nginx
- `docker-compose.yml` - Optional multi-container orchestration
- `init-mongo.js` - MongoDB initialization script used by Docker Compose

---

## Requirements

- Docker installed and running
- Optional: Docker Compose installed for `docker compose` usage
- Optional: Node.js and npm if you want to run frontend/backend outside Docker

---

## 1) Run MongoDB as a separate Docker container

Create a dedicated Docker network so frontend, backend, and MongoDB can communicate:

```powershell
docker network create kfc-network
```

Run MongoDB in a container:

```powershell
docker run -d --name kfc-mongodb --network kfc-network \
  -p 27018:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123456 \
  -e MONGO_INITDB_DATABASE=kfc-database \
  -v mongodb_data:/data/db \
  -v mongodb_config:/data/configdb \
  mongo:7.0
```

> If you want to initialize the database with `init-mongo.js`, mount it into `/docker-entrypoint-initdb.d/`:
>
> ```powershell
> docker run -d --name kfc-mongodb --network kfc-network \
>   -p 27018:27017 \
>   -e MONGO_INITDB_ROOT_USERNAME=admin \
>   -e MONGO_INITDB_ROOT_PASSWORD=admin123456 \
>   -e MONGO_INITDB_DATABASE=kfc-database \
>   -v mongodb_data:/data/db \
>   -v mongodb_config:/data/configdb \
>   -v ${PWD}\init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro \
>   mongo:7.0
> ```

### MongoDB URLs

- External host port: `localhost:27018`
- Internal container hostname for Docker network: `kfc-mongodb`

---

## 2) Run Backend independently with Docker

Build the backend image:

```powershell
docker build -t kfc-backend ./Backend
```

Run the backend container on the same network:

```powershell
docker run -d --name kfc-backend --network kfc-network \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DB_URL="mongodb://admin:admin123456@kfc-mongodb:27017/kfc-database?authSource=admin" \
  -e FRONTEND_URL=http://localhost:3000 \
  kfc-backend
```

### Backend endpoints

- App port: `http://localhost:8080`
- Product API example: `http://localhost:8080/api/products`

---

## 3) Run Frontend independently with Docker

Build the React frontend image and pass the backend URL at build time:

```powershell
docker build --build-arg REACT_APP_BACKEND_URL=http://localhost:8080 -t kfc-frontend ./Frontend
```

Run the frontend container:

```powershell
docker run -d --name kfc-frontend --network kfc-network \
  -p 3000:80 \
  kfc-frontend
```

### Frontend URL

- App served at: `http://localhost:3000`

---

## 4) Use Docker Compose (optional)

If you prefer a single orchestration file, use the existing `docker-compose.yml` from the repository root.

```powershell
docker compose up --build
```

This starts:

- `mongodb` on `27018` mapped to `27017`
- `backend` on `8080`
- `frontend` on `3000`

---

## 5) Running without Docker

### Backend locally

```powershell
cd Backend
npm install
npm start
```

Use a local MongoDB connection string in `Backend/.env` like:

```env
PORT=8080
DB_URL=mongodb://localhost:27017/kfc-database
FRONTEND_URL=http://localhost:3000
```

### Frontend locally

```powershell
cd Frontend
npm install --legacy-peer-deps
npm start
```

Set the backend URL in `.env` if needed:

```env
REACT_APP_BACKEND_URL=http://localhost:8080
```

---

## 6) Notes and tips

- `Backend/Dockerfile` exposes port `8080`
- `Frontend/Dockerfile` builds the app and serves it with Nginx on port `80`
- `docker run` commands map container ports to host ports `8080` and `3000`
- Use the `kfc-network` Docker network so containers can resolve each other by name

---

## Useful commands

```powershell
# Stop and remove containers
docker rm -f kfc-frontend kfc-backend kfc-mongodb

# Remove the network
docker network rm kfc-network

# View running containers
docker ps
```

---

## Contact

For issues or questions, open a new issue in this repository.
