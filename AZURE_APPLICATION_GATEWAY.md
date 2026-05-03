# Azure Application Gateway Setup for KFC React Application

## Overview

Azure Application Gateway is a layer-7 (Application Layer) load balancer that can route traffic based on URL paths, hostnames, and HTTP headers. This guide explains how to use it for your full-stack KFC application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet Users                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │   Azure Application Gateway            │
        │   - SSL/TLS Termination                │
        │   - URL-based routing                  │
        │   - Request/Response rewrites          │
        │   - WAF Protection                     │
        └────────────┬──────────────┬────────────┘
                     │              │
        ┌────────────▼──┐   ┌──────▼──────────┐
        │  Frontend VM  │   │  Backend VM     │
        │ (React App)   │   │ (Node.js Server)│
        │ Port 3000     │   │ Port 8080       │
        └───────────────┘   └─────────────────┘
```

## Components Needed

### 1. **Azure Virtual Network (VNet)**
- Host your VMs and Application Gateway
- Provides network isolation and security

### 2. **Azure VMs**
- **Frontend VM**: Running React application (port 3000)
- **Backend VM**: Running Node.js/Express server (port 8080)

### 3. **Azure Application Gateway**
- Routes requests based on URL paths
- Handles SSL/TLS encryption
- Load balances between backend pools

### 4. **Azure Storage Account** (Optional)
- Store application logs and backups

## Application Gateway Configuration

### Step 1: Create Application Gateway Resource

**In Azure Portal:**
1. Create new resource → "Application Gateway"
2. **Basics:**
   - Name: `kfc-app-gateway`
   - Tier: Standard v2
   - Enable autoscaling: Yes (2-10 instances)

3. **Frontends:**
   - Create public IP address
   - Add HTTPS listener (if using SSL certificate)

### Step 2: Configure Backend Pools

#### Pool 1: Frontend Pool
```
Name: frontend-pool
Target Type: Virtual Machine
Targets: Frontend VM (private IP)
Port: 3000
Protocol: HTTP
```

#### Pool 2: Backend API Pool
```
Name: backend-pool
Target Type: Virtual Machine
Targets: Backend VM (private IP)
Port: 8080
Protocol: HTTP
```

### Step 3: Create HTTP Settings

#### For Frontend
```
Name: frontend-http-settings
Protocol: HTTP
Port: 3000
Cookie-based affinity: Disabled
Host override: Use backend target's FQDN
```

#### For Backend
```
Name: backend-http-settings
Protocol: HTTP
Port: 8080
Cookie-based affinity: Disabled
Host override: Leave empty or use backend FQDN
```

### Step 4: Configure URL Path-Based Routing Rules

**Rule 1: Frontend Route**
```
Rule Name: frontend-rule
Listener: 
  - Name: frontend-listener
  - Protocol: HTTPS (or HTTP)
  - Port: 443 (or 80)
  - Hostname: example.com

Path-based routing:
  - Path: /*
  - Backend pool: frontend-pool
  - HTTP settings: frontend-http-settings
```

**Rule 2: API Route**
```
Rule Name: api-rule
Listener: 
  - Name: api-listener
  - Protocol: HTTPS (or HTTP)
  - Port: 443 (or 80)
  - Hostname: api.example.com (or api/* path)

Path-based routing:
  - Path: /api/*
  - Backend pool: backend-pool
  - HTTP settings: backend-http-settings
```

### Step 5: Add Rewrite Rules (Optional but Recommended)

**Rewrite Rule: Remove /api prefix when forwarding to backend**
```
Rule Set Name: api-rewrite

Condition:
- Variable: http_request_uri
- Pattern: ^/api/(.*)
- Action: URL rewrite
- Rewrite URL: /{1}
```

This way:
- `example.com/api/product` → Backend receives `/product`
- `example.com/api/cart` → Backend receives `/cart`

## Detailed Routing Configuration

### Scenario 1: Single Domain with Path-Based Routing

**User requests:**
- `https://myapp.example.com/` → Routes to Frontend (React)
- `https://myapp.example.com/api/product` → Routes to Backend API

**Application Gateway Configuration:**
```
Listener: myapp.example.com:443 (HTTPS)

Path-based routing rules:
  ├─ Path: /api/*
  │  └─ Backend Pool: backend-pool
  │     HTTP Settings: backend-http-settings
  └─ Path: /*
     └─ Backend Pool: frontend-pool
        HTTP Settings: frontend-http-settings
```

### Scenario 2: Multiple Domains

**User requests:**
- `https://app.example.com/` → Routes to Frontend
- `https://api.example.com/` → Routes to Backend

**Application Gateway Configuration:**
```
Listener 1: app.example.com:443
  └─ Backend Pool: frontend-pool
  
Listener 2: api.example.com:443
  └─ Backend Pool: backend-pool
```

## SSL/TLS Configuration

### Step 1: Upload SSL Certificate

1. Go to Application Gateway → Listeners
2. Create HTTPS listener
3. Upload SSL certificate (.pfx or .pem)
4. Enable HTTPS redirect from HTTP

### Step 2: Backend HTTPS (Optional)

If backend also uses HTTPS:
```
HTTP Settings:
- Protocol: HTTPS
- Port: 443 (or 8443)
- Pick hostname from backend target
- Create custom probe to verify backend health
```

## Health Probes

### Frontend Health Probe
```
Name: frontend-probe
Protocol: HTTP
Host: <frontend-vm-ip>
Port: 3000
Path: /
Interval: 30 seconds
Timeout: 30 seconds
Healthy threshold: 2
Unhealthy threshold: 3
```

### Backend Health Probe
```
Name: backend-probe
Protocol: HTTP
Host: <backend-vm-ip>
Port: 8080
Path: /api/product (or any available endpoint)
Interval: 30 seconds
Timeout: 30 seconds
Healthy threshold: 2
Unhealthy threshold: 3
```

## CORS Configuration

### Update Backend Express Server

```javascript
// In Backend/index.js
const cors = require("cors");

app.use(cors({
  origin: ["https://myapp.example.com", "https://app.example.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

### Application Gateway Request/Response Headers

**Request Header Modification Rule:**
```
Rule Set: add-headers

Condition: Match all
Actions:
  - Add request header
    Name: X-Forwarded-For
    Value: {http_request_headers}
  - Add request header
    Name: X-Forwarded-Proto
    Value: https
```

## Frontend React Configuration

### Update API Base URL

**Create `.env` file in React app:**
```
REACT_APP_API_URL=https://myapp.example.com/api
```

Or if using different domain:
```
REACT_APP_API_URL=https://api.example.com
```

**Update API calls in React:**
```javascript
// utils/api.js or services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/product`);
  return response.json();
};

export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

## WAF (Web Application Firewall) - Optional

### Enable WAF on Application Gateway

1. **WAF Policy:**
   - Protection Mode: Detection or Prevention
   - Managed Rules: OWASP CRS (Core Rule Set)
   - Custom Rules: Add specific rules for your app

2. **Common Rules to Add:**
   ```
   - Block SQL Injection attempts
   - Block XSS attempts
   - Block malicious bots
   - Rate limiting per IP
   ```

3. **Example Custom Rule:**
   ```
   Name: block-suspicious-agents
   Priority: 1
   Rule Type: Geo-match
   Match Variables: RemoteAddr
   Operator: GeoMatch
   Values: [List of blocked countries]
   Action: Block
   ```

## Load Balancing & Auto-Scaling

### Auto-scale Backend Pool

```
Backend Pool: backend-pool
  ├─ Current VMs: 1
  ├─ Min instances: 1
  ├─ Max instances: 5
  └─ Scale based on:
     - CPU usage > 70%
     - Memory usage > 80%
```

### Round-robin Load Balancing

**HTTP Settings:**
```
Load balancing algorithm: Round robin
Connection Draining: 30 seconds
Session affinity: Disabled (or Enabled if needed)
```

## Monitoring & Logging

### Enable Diagnostics

1. **Application Gateway Logs:**
   - Access logs
   - Performance logs
   - Firewall logs (if WAF enabled)

2. **Log Destinations:**
   - Azure Storage Account
   - Log Analytics Workspace
   - Event Hub

3. **Alerts to Configure:**
   ```
   - Backend pool health status
   - CPU usage > 80%
   - Memory usage > 80%
   - Request count threshold exceeded
   - 5xx errors rate > 5%
   ```

### Sample Monitoring Query (KQL)
```kusto
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.NETWORK" and ResourceType == "APPLICATIONGATEWAYS"
| where httpStatus_d >= 500
| summarize Count=count() by httpStatus_d, clientIP_s
| sort by Count desc
```

## DNS Configuration

### Point Domain to Application Gateway

1. **Get Application Gateway Public IP:**
   ```
   In Azure Portal → Application Gateway → Overview → Public IP Address
   ```

2. **Update DNS Records:**
   ```
   Type: A (or CNAME)
   Name: myapp
   Value: <public-ip-address>
   TTL: 3600
   ```

3. **Example DNS Setup:**
   ```
   myapp.example.com      A    203.0.113.45
   api.example.com        A    203.0.113.45
   *.myapp.example.com    A    203.0.113.45
   ```

## Cost Estimation

| Component | Estimated Cost/Month |
|-----------|----------------------|
| Application Gateway (Standard v2) | $20-30 |
| Data processed | ~$0.60 per GB |
| New connections | ~$0.009 per connection |
| Application Gateway hours | ~$15-20 |
| **Total** | **$50-100** |

*Note: Costs vary by region and usage*

## Security Best Practices

### 1. Network Security
- Place VMs in private subnets
- Use Network Security Groups (NSGs)
- Enable DDoS Protection

### 2. Application Security
- Enable WAF with OWASP CRS
- Use HTTPS/SSL only
- Implement rate limiting
- Enable request logging

### 3. Access Control
- Use Azure AD for authentication
- Implement role-based access control (RBAC)
- Restrict backend access to Application Gateway only

### 4. Certificate Management
- Use Azure Key Vault for SSL certificates
- Auto-renew certificates before expiration
- Use strong cipher suites (TLS 1.2+)

## Troubleshooting Common Issues

### Issue 1: Backend Returns 502 Bad Gateway

**Causes:**
- Backend service not running
- Health probe failing
- Network connectivity issue

**Solutions:**
```
1. Verify backend VM is running
2. Check health probe settings
3. Verify Security Groups allow traffic
4. Check backend logs
```

### Issue 2: CORS Errors in Browser Console

**Cause:** Frontend and backend on different origins

**Solution:**
```javascript
// Backend CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue 3: SSL Certificate Errors

**Cause:** Certificate not properly configured

**Solution:**
```
1. Verify certificate is valid (not expired)
2. Ensure certificate includes all domains
3. Check certificate is in correct format
4. Verify backend SSL settings if HTTPS
```

### Issue 4: Request Timeout (504 Gateway Timeout)

**Cause:** Backend request takes too long

**Solution:**
```
Increase timeout in HTTP Settings:
  - Request timeout: 180 seconds (default)
  - Connection idle timeout: 60 seconds
```

## Migration Steps

### Phase 1: Preparation
1. Create VMs in Azure
2. Deploy frontend (React) on VM
3. Deploy backend (Node.js) on VM
4. Create Application Gateway

### Phase 2: Configuration
1. Configure backend pools
2. Set up HTTP settings
3. Create routing rules
4. Configure SSL/TLS
5. Set up health probes

### Phase 3: Testing
1. Test routing rules
2. Verify CORS configuration
3. Test SSL/TLS
4. Load testing

### Phase 4: Go Live
1. Update DNS to point to Application Gateway
2. Monitor metrics
3. Set up alerts
4. Gradually move traffic

## Monitoring Dashboard Example

**Create Azure Dashboard with:**
- Application Gateway health
- Backend pool status
- Request throughput
- Error rates
- Latency metrics
- Active connections

## Additional Resources

- [Azure Application Gateway Documentation](https://docs.microsoft.com/en-us/azure/application-gateway/)
- [URL-based Routing](https://docs.microsoft.com/en-us/azure/application-gateway/url-route-overview)
- [WAF Configuration](https://docs.microsoft.com/en-us/azure/web-application-firewall/)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)

## Summary

**Benefits of using Azure Application Gateway:**
✅ URL-based routing for multiple backends
✅ SSL/TLS termination
✅ Load balancing across instances
✅ WAF protection
✅ Auto-scaling support
✅ Health monitoring
✅ Request rewrites
✅ Multi-site hosting
✅ Managed service (no infrastructure management)

This setup provides a production-ready, scalable architecture for your KFC application!
