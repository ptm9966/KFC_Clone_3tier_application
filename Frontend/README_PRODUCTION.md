# KFC React Frontend Application

A modern, responsive React application for the KFC food ordering system. Built with React 18, Redux, and Chakra UI.

## 📋 Requirements

- **Node.js**: 20.x LTS (or higher)
- **npm**: 10.x (or higher)
- **Browser**: Latest versions of Chrome, Firefox, Safari, or Edge

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> Note: `--legacy-peer-deps` is used due to `react-store-badge` compatibility. This will be removed in future updates.

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_ENV=development
REACT_APP_API_TIMEOUT=30000
```

### 3. Development Server

```bash
npm start
```

- Opens at: `http://localhost:3000`
- Auto-reloads on file changes
- Shows lint errors in console

### 4. Production Build

```bash
npm run build
```

- Optimized build in `build/` folder
- Ready for deployment
- Minified and bundled assets

### 5. Serve Production Build Locally

```bash
npm run serve
```

Or run production build:

```bash
npm run prod
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 3000 |
| `npm run dev` | Alias for npm start |
| `npm run build` | Create production build |
| `npm run serve` | Build and serve production version locally |
| `npm run prod` | Serve existing build on port 3000 |
| `npm test` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint on src/ folder |
| `npm run analyze` | Analyze bundle size |
| `npm run eject` | Eject from Create React App (irreversible!) |

## 🛠 Tech Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI library |
| react-router-dom | ^6.20.0 | Client-side routing |
| redux | ^4.2.1 | State management |
| react-redux | ^8.1.3 | React-Redux bindings |
| axios | ^1.6.5 | HTTP client |

### UI & Styling

| Package | Version | Purpose |
|---------|---------|---------|
| @chakra-ui/react | ^2.8.2 | Component library |
| bootstrap | ^5.3.2 | CSS framework |
| react-bootstrap | ^2.10.0 | Bootstrap React components |
| styled-components | ^6.1.1 | CSS-in-JS styling |
| framer-motion | ^10.16.16 | Animation library |

### Additional Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| react-slick | ^0.30.2 | Carousel component |
| react-scroll | ^1.9.0 | Smooth scrolling |
| react-icons | ^4.12.0 | Icon library |
| aos | ^2.3.4 | Animate on scroll |
| serve | ^14.2.0 | Static file server |

### Development Dependencies

- react-scripts: ^5.0.1 (Build tools)
- @testing-library/react: ^14.1.2 (Testing)
- ESLint & Prettier (Code quality)

## 📁 Project Structure

```
Frontend/kfc-react-app/
├── public/
│   ├── index.html          # HTML template
│   ├── manifest.json       # PWA manifest
│   └── robots.txt         # SEO robots file
├── src/
│   ├── Components/         # React components
│   │   ├── Admin/         # Admin components
│   │   ├── home/          # Home page
│   │   ├── navbar/        # Navigation
│   │   ├── MenuPageComponents/ # Menu items
│   │   └── ...
│   ├── Pages/             # Page components
│   ├── Redux/             # State management
│   │   ├── store.js       # Redux store
│   │   ├── Auth/          # Auth slice
│   │   └── Cart/          # Cart slice
│   ├── utils/             # Helper functions
│   ├── App.js             # Main app component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── .env.example           # Environment template
├── .nvmrc                 # Node version (NVM)
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
└── README.md             # This file
```

## 🔧 Environment Variables

### Required Variables

```env
# Backend API URL (with protocol)
REACT_APP_BACKEND_URL=http://localhost:8080

# Optional: Environment identifier
REACT_APP_ENV=development

# Optional: API timeout in milliseconds
REACT_APP_API_TIMEOUT=30000
```

### Usage in Code

```javascript
// Access environment variables
const apiUrl = process.env.REACT_APP_BACKEND_URL;
const environment = process.env.REACT_APP_ENV;
const timeout = process.env.REACT_APP_API_TIMEOUT || 30000;
```

## 🔌 API Integration

### Axios Configuration

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 30000;

const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Endpoints

All endpoints are available at the backend on port 8080:

- **Auth**: `/auth/login`, `/auth/signup`, `/auth/singleuser`
- **Products**: `/api/product`, `/api/product/:id`
- **Cart**: `/api/cart`, `/api/cart/:id`

See [Backend README](../Backend/README.md) for complete API documentation.

## 🎨 Styling

### Using Chakra UI

```javascript
import { Box, Button, Text } from '@chakra-ui/react';

export function MyComponent() {
  return (
    <Box p={4}>
      <Text>Hello World</Text>
      <Button colorScheme="blue">Click me</Button>
    </Box>
  );
}
```

### Using Bootstrap

```javascript
import { Container, Row, Col, Button } from 'react-bootstrap';

export function MyComponent() {
  return (
    <Container>
      <Row>
        <Col>Hello World</Col>
      </Row>
      <Button variant="primary">Click me</Button>
    </Container>
  );
}
```

### Using Styled Components

```javascript
import styled from 'styled-components';

const Container = styled.div`
  padding: 1rem;
  background-color: #f0f0f0;
`;

export function MyComponent() {
  return <Container>Hello World</Container>;
}
```

## 🧪 Testing

### Run Tests

```bash
npm test
```

- Interactive watch mode
- Auto-reruns on file changes
- Press 'a' to run all tests

### Run Tests with Coverage

```bash
npm run test:coverage
```

- Generates coverage report
- Shows line, branch, and function coverage

## 📦 Build & Deployment

### Build for Production

```bash
npm run build
```

**Output:**
- `build/` folder contains optimized production files
- Ready to deploy to any static hosting

### Deployment Options

#### Option 1: Azure Static Web Apps
```bash
npm run build
# Upload build/ folder to Azure
```

#### Option 2: Netlify
```bash
npm run build
# Deploy build/ folder via Netlify CLI or web interface
```

#### Option 3: Docker
Create `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "prod"]
```

Build & run:
```bash
docker build -t kfc-frontend .
docker run -p 3000:3000 kfc-frontend
```

#### Option 4: Traditional Hosting
```bash
npm run build
# FTP/SSH upload build/ folder contents to server
```

## 🔒 Security Best Practices

### Environment Variables
- ✅ Store sensitive data in `.env` files
- ✅ Never commit `.env` to git
- ✅ Use `.env.example` for documentation

### API Security
- ✅ Validate all user input
- ✅ Use HTTPS in production
- ✅ Store tokens securely (httpOnly cookies)
- ✅ Implement CORS properly

### Code Security
- ✅ Keep dependencies updated
- ✅ Run security audits: `npm audit`
- ✅ Use CSP headers in production
- ✅ Sanitize HTML content

## 🐛 Troubleshooting

### Issue: Module not found error

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start
```

### Issue: Port 3000 already in use

**Solution (Windows):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill process
taskkill /PID <PID> /F
```

**Solution (Mac/Linux):**
```bash
lsof -i :3000
kill -9 <PID>
```

### Issue: CORS errors

**Solution:** Ensure backend has proper CORS configuration:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue: API calls fail in production

**Solution:** Update `.env` for production:
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

### Issue: Build size too large

**Solution:** Analyze bundle:
```bash
npm run analyze
```

Then optimize:
- Code splitting
- Lazy loading components
- Remove unused dependencies

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Redux Documentation](https://redux.js.org)
- [Chakra UI Documentation](https://chakra-ui.com)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [Create React App Documentation](https://create-react-app.dev)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/AmazingFeature`
2. Commit changes: `git commit -m 'Add AmazingFeature'`
3. Push to branch: `git push origin feature/AmazingFeature`
4. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend README
3. Check backend logs
4. Verify environment configuration

## ⚠️ Breaking Changes

### From v0.1.0 to v1.0.0

- Updated Node.js requirement to 20.x
- Updated all dependencies to latest stable versions
- Added `.env.example` for configuration
- Added production build serve capability
- Better error handling and logging

---

**Last Updated:** May 2, 2026
**Node Version:** 20.x LTS
**npm Version:** 10.x
