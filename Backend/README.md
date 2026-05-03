# Backend - Node.js Application

KFC React App Backend API built with Express.js and MongoDB.

## Prerequisites

- **Node.js**: Version 14.x or higher (16.x LTS recommended)
- **npm**: Version 6.x or higher
- **MongoDB**: Local or cloud instance (MongoDB Atlas)

## Installation

1. **Navigate to Backend folder**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the Backend folder with the following credentials:

```env
# Port Configuration
PORT=8080

# Database Configuration - MongoDB Connection String
DB_URL=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority

# Or for local MongoDB:
# DB_URL=mongodb://localhost:27017/kfc-database

# Frontend URL (for CORS configuration)
FRONTEND_URL=http://localhost:3000
```

### Environment Variables Explanation:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `DB_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

## Database Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Create a database user with username and password
5. Get the connection string
6. Add your IP to whitelist
7. Use the connection string in `DB_URL` in `.env`

**Connection String Format:**
```
mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
```

### Option 2: Local MongoDB

1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use connection string:
   ```
   mongodb://localhost:27017/kfc-database
   ```

## Starting the Application

### Development Mode (with auto-reload)

```bash
npm install -g nodemon  # Install nodemon globally (one time)
nodemon index.js
```

Or add to package.json scripts and run:
```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start and you should see:
```
Connection secure
Listening at http://localhost:8080
```

## API Endpoints

### Authentication Routes
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration

### Product Routes
- `GET /api/products` - Get all products
- `POST /api/products` - Add product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart Routes
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart

## CORS Configuration

The application is configured to accept requests from the frontend. To enable cross-origin requests:

1. Update the `cors()` configuration in `index.js` if needed:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || "http://localhost:3000",
     credentials: true
   }));
   ```

2. Ensure `FRONTEND_URL` is set in `.env` file

## Troubleshooting

### Connection Error to Database
- **Issue**: "Connection Error" message
- **Solution**: 
  - Verify MongoDB is running
  - Check `DB_URL` credentials are correct
  - Ensure IP is whitelisted in MongoDB Atlas
  - Check internet connection for cloud MongoDB

### Port Already in Use
- **Issue**: Error: listen EADDRINUSE: address already in use :::8080
- **Solution**:
  ```bash
  # Kill the process using the port (Windows)
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F
  
  # Or use a different port
  PORT=3001 npm start
  ```

### Module Not Found
- **Issue**: Cannot find module error
- **Solution**: Run `npm install` to install all dependencies

## Project Structure

```
Backend/
├── config/
│   └── db.js              # MongoDB connection configuration
├── features/
│   ├── cart/              # Cart routes and models
│   ├── product/           # Product routes and models
│   └── user/              # User routes and models
├── index.js               # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables (create this file)
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Frontend Integration

To connect the frontend (React app running on `http://localhost:3000`) to this backend:

1. Set `REACT_APP_API_URL` in frontend `.env`:
   ```
   REACT_APP_API_URL=http://localhost:8080
   ```

2. Use API endpoints in React components:
   ```javascript
   const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(userData)
   });
   ```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB object modeling
- **cors**: Enable cross-origin requests
- **dotenv**: Environment variable management
- **nodemon**: Development server with auto-reload

## Notes

- Never commit `.env` file (contains sensitive credentials)
- Ensure `.gitignore` includes `.env`
- Use strong passwords for database users
- Keep MongoDB credentials secure

## Support

For issues or questions, refer to:
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
