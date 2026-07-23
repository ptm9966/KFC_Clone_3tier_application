# Local Setup Guide

This guide explains how to run the frontend and backend locally and connect them to MongoDB.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB running locally or in Docker

## Option 1: Run MongoDB locally

If MongoDB is already installed on your machine, start it with:

```powershell
mongod --dbpath C:\data\db
```

Then verify the connection:

```powershell
mongosh mongodb://127.0.0.1:27017
```

## Option 2: Run MongoDB in Docker

If you prefer Docker for MongoDB:

```powershell
docker run -d --name local-mongo -p 27017:27017 mongo:7
```

## Backend setup

1. Open the backend folder:

```powershell
cd Backend
```

2. Install dependencies:

```powershell
npm install
```

3. Create a file named `.env` in the Backend folder with:

```env
PORT=8080
DB_URL=mongodb://localhost:27017/kfc-database
ALLOWED_ORIGINS=http://localhost:3000
```

> `ALLOWED_ORIGINS` is the frontend origin allowed by the backend for CORS. Use the exact frontend URL, including the protocol and port, such as `http://localhost:3000`.

4. Start the backend server:

```powershell
npm start
```

5. Open the API docs in your browser:

```text
http://localhost:8080/api-docs
```

## Frontend setup

1. Open the frontend folder:

```powershell
cd Frontend
```

2. Install dependencies:

```powershell
npm install --legacy-peer-deps
```

3. Create a file named `.env` in the Frontend folder with:

```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_ENV=development
```

4. Start the frontend app:

```powershell
npm start
```

5. Open the app in your browser:

```text
http://localhost:3000
```

## Verify the full flow

- Backend API: http://localhost:8080
- API docs: http://localhost:8080/api-docs
- Frontend: http://localhost:3000

## Troubleshooting

- If the backend cannot connect to MongoDB, confirm that the MongoDB service is running and that the `DB_URL` value is correct.
- If the frontend cannot reach the backend, make sure `REACT_APP_BACKEND_URL` points to `http://localhost:8080`.
- If you see a CORS error in the browser, make sure `ALLOWED_ORIGINS` in the Backend `.env` matches the frontend origin exactly (for example `http://localhost:3000`).
- If a port is already in use, stop the conflicting process or change the port in the relevant `.env` file.
- For frontend dependency issues, rerun the install command with `--legacy-peer-deps`.
