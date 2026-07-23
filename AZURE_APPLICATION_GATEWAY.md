# Azure Application Gateway Setup for KFC App Service Deployment

## Overview

Azure Application Gateway is a layer-7 load balancer that can sit in front of your KFC frontend and backend applications hosted on Azure App Service. It provides public ingress, SSL termination, path-based routing, and optional WAF protection.

## Target Architecture

```text
Internet Users
      |
      v
Azure Application Gateway
  - Public IP
  - HTTPS listener
  - Path-based routing
  - Optional WAF
      |
      +------------------------+
      |                        |
      v                        v
Frontend App Service      Backend App Service
(kfc-frontend)            (kfc-backend)
```

## Recommended Setup

### 1. Create the App Services

1. Create an Azure App Service Plan using Linux.
2. Create two Web Apps:
   - kfc-frontend
   - kfc-backend
3. Deploy the React frontend and the Node.js/Express backend separately.

### 2. Configure Backend Settings

---- For the backend App Service, add these application settings: ----

- PORT: 8080
- DB_URL: your Azure Cosmos DB MongoDB connection string
- FRONTEND_URL: your frontend App Service URL

----  For the frontend App Service, set:----

- REACT_APP_BACKEND_URL: your Application Gateway public URL or "" 
- REACT_APP_BACKEND_URL=""  This will use same routing domain or ip adress so that we can pass trafic through app gateway


## Application Gateway Configuration

### Step 1: Create the Application Gateway

In the Azure portal:

1. Create a new Application Gateway resource.
2. Choose Standard v2.
3. Create or attach a public IP address.
4. Place it in a VNet that can reach the App Services.

### Step 2: Create Backend Pools

Create two backend pools:

- Frontend pool
  - Name : web-backendpool
  - Target type: app-service
  - Target: kfc-frontend App Service

- Backend pool
  - Name : api-backendpool
  - Target type: app-service
  - Target: kfc-backend App Service

If your portal does not expose a direct App Service target type, use the App Service FQDN as the backend target.

### Step 3: Create HTTP Settings
If your backend is Azure App Service, it supports HTTP, but many App Services are configured with "HTTPS Only" enabled.

If HTTPS Only = On:

❌ Application Gateway cannot communicate with the App Service over HTTP.
You must use HTTPS for the backend settings.

If HTTPS Only = Off:

✅ Application Gateway can use HTTP to connect to the App Service.

#### Frontend HTTP Settings
- Name: web-http-settings
- Protocol: HTTPS
- Port: 443
- Cookie-based affinity: Disabled
- Override with new host name : yes
- Pick host name from backend targer
- Host override: Leave empty unless you need a specific host header

#### Backend HTTP Settings
- Name: api-http-settings
- Protocol: HTTPS
- Port: 443
- Cookie-based affinity: Disabled
- Override with new host name : yes
- Pick host name from backend targer
- Host override: Leave empty unless you need a specific host header

### Step 4: Listeners creation
we can only craete one listener for one port number for basic

we can create multiple listerners for one portnumener for multisite and pass hostname

#### Listner type: BASIC 
In basic routing we can use direct IP adresss of gateway .

Listner_name =
frontend_ip =
protocol =
port =
Listener type: Basic


we use : http://20.235.36.181  we can access using this 

#### Listner rule type : Multisite

we need to pass Host Name like : bikkam.online 

Listner_name =
frontend_ip =
protocol =
port =
Listener type: multisite
host_type = single/multiple
Host_name : bikkam.online


### Rules creation 

rules combines listner and backend pool to make routing possible

rule_name = web_http_routing
priorty = 

Lister section : select listener -- which frontend whic port number it recives request

Backend Target : we need add backend taget and pathbasesd routing

#### Option A: Single Domain with Path-Based Routing

Use one public listener and route traffic like this:

- Path: /* -> frontend pool
- Path: /api/* -> backend pool
- path: /auth/* -> backend

Example:
- https://yourdomain.com/ -> frontend App Service
- https://yourdomain.com/api/product -> backend App Service

#### Option B: Separate Hostnames

Use two listeners:

- app.yourdomain.com -> frontend pool
- api.yourdomain.com -> backend pool

## Recommended URL Routing

If the frontend calls the API through the gateway, use:

- REACT_APP_BACKEND_URL=https://yourdomain.com/api

This allows the browser to reach the backend through the Application Gateway rather than directly calling the App Service endpoint.

## Health Probes

### Frontend Probe
- Protocol: HTTP
- Host: kfc-frontend.azurewebsites.net
- Port: 80
- Path: /

### Backend Probe
- Protocol: HTTP
- Host: kfc-backend.azurewebsites.net
- Port: 80
- Path: /api/product

## SSL/TLS Configuration

1. Create an HTTPS listener on the Application Gateway.
2. Upload your SSL certificate.
3. Enable HTTPS redirect from HTTP to HTTPS.
4. Configure the frontend and backend App Services to work behind the gateway using the public hostnames.

## Optional Rewrite Rules

If your backend expects requests without the /api prefix, add a rewrite rule:

- Match: /api/(.*)
- Rewrite to: /$1

## CORS Configuration

If the frontend is served from the Application Gateway hostname and the backend is reached through /api, update the backend CORS policy to allow the gateway domain.

Example:

```javascript
const cors = require("cors");

app.use(cors({
  origin: ["https://yourdomain.com"],
  credentials: true
}));
```

## WAF (Optional)

Enable WAF on the Application Gateway for:

- SQL injection protection
- XSS protection
- Bot blocking
- Rate limiting

## Private Access and VNet Integration

If you want the App Services to be private by default:

1. Enable VNet integration on both App Services.
2. Add private endpoints if required.
3. Ensure the Application Gateway can reach the App Services over the VNet.

Important note:
- The frontend React app runs in the browser, so it should not call a private backend directly.
- Use the Application Gateway public endpoint for frontend-to-backend API traffic.

## DNS Configuration

Point your custom domain to the Application Gateway public IP:

- Type: A record
- Name: @ or www
- Value: Application Gateway public IP

## Summary

This design uses Azure Application Gateway as the public entry point for a KFC application deployed on App Service. The gateway routes:

- frontend traffic to the React frontend App Service
- API traffic to the Node.js backend App Service

This pattern is ideal when you want centralized TLS, routing, and security without managing VMs.

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
