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

## API Management + Application Gateway Flow

If you want to put Azure API Management (APIM) in front of this architecture, the request flow becomes:

```text
Client
  |
  v
Azure API Management
  - Auth / policies / throttling / subscription validation
  |
  v
Azure Application Gateway
  - Public listener
  - Host and path-based routing
  |
  +----------------------+
  |                      |
  v                      v
Frontend App Service   Backend App Service
```

### How the re-routing happens

1. The client calls an APIM endpoint such as:
   - https://apim.yourdomain.com/api/product

2. APIM receives the request and applies policies such as:
   - API key validation
   - JWT validation
   - rate limiting
   - request logging

3. APIM forwards the request to the Application Gateway backend URL, for example:
   - https://appgw.yourdomain.com/api/product

4. The Application Gateway listener matches the host and path and re-routes the request to the correct backend pool:
   - /api/* -> api-backendpool
   - /* -> web-backendpool

5. The backend App Service receives the request and responds normally.

### Example APIM backend configuration

In APIM, set the backend URL to the Application Gateway public endpoint:

```text
Backend URL: https://appgw.yourdomain.com
```

Then configure the API operation to call:

```text
/api/product
```

### Recommended routing rules

- Frontend route:
  - Path: /* -> web-backendpool
- Backend route:
  - Path: /api/* -> api-backendpool
- Auth route:
  - Path: /auth/* -> api-backendpool

### Important note

APIM and Application Gateway are complementary:
- APIM handles API governance, security, and policy enforcement.
- Application Gateway handles Layer 7 routing, TLS termination, and path-based forwarding.

So the request is not directly sent to the App Service from the client. Instead, it flows through APIM first, then the Application Gateway, and finally reaches the right App Service.

## Application Gateway Front-End, APIM in the Backend Tier

A more secure pattern is to place Azure Application Gateway in front of the public entry point and keep Azure API Management (APIM) as the internal API gateway tier behind it.

```text
Internet Users
  |
  v
Azure Application Gateway
  - Public listener
  - TLS termination
  - Path-based routing
  |
  v
Azure API Management
  - Policy enforcement
  - Authentication
  - Rate limiting
  |
  v
Backend App Services / APIs
```

### Recommended design

- Application Gateway handles public ingress and routing.
- APIM handles API governance, throttling, and security policies.
- Backend App Services remain private or partially private behind the APIM layer.

### VNet Integration Steps

#### 1. Create or use a VNet
Create a VNet with separate subnets for:

- Application Gateway subnet
- APIM subnet
- App Service integration subnet
- Optional private endpoint subnet

Example subnet names:
- `appgw-subnet`
- `apim-subnet`
- `appsvc-integration-subnet`
- `priv-endpoints-subnet`

#### 2. Enable VNet integration for App Services
For the frontend and backend App Services:

1. Open the App Service in the Azure portal.
2. Go to Networking.
3. Enable VNet integration.
4. Select the integration subnet created for App Service outbound traffic.

This allows the App Services to reach private resources inside the VNet.

#### 3. Deploy APIM inside the VNet
Create or configure APIM with VNet integration:

1. Go to APIM > Network.
2. Select VNet injection or VNet integration based on your APIM tier.
3. Attach APIM to the `apim-subnet`.
4. Ensure the APIM instance can reach the backend App Services over HTTPS.

#### 4. Configure Application Gateway backend target
In Application Gateway:

1. Create a backend pool for APIM.
2. Set the target to the APIM private FQDN or private IP address.
3. Use HTTPS settings for the backend health probe and HTTP settings.
4. Configure routing rules so public traffic is forwarded to APIM.

#### 5. Configure private DNS
If APIM and backend services are private, add DNS entries for internal resolution:

- Create a private DNS zone for `privatelink.azure-api.net` if using private endpoints.
- Add records for APIM private endpoints.
- Ensure App Gateway and APIM can resolve the private hostnames correctly.

#### 6. Apply NSG rules
Use NSGs to allow only required traffic:

- Allow inbound HTTPS from the Application Gateway subnet to APIM.
- Allow outbound HTTPS from APIM to backend App Services.
- Allow required health and management traffic only.

#### 7. Validate the private path
After configuration, test the flow:

1. Call the public Application Gateway endpoint.
2. Confirm the request reaches APIM.
3. Confirm APIM forwards the request to the correct backend service.
4. Check that the backend is reachable only through the private network path.

## WAF (Optional)

Enable WAF on the Application Gateway for:

- SQL injection protection
- XSS protection
- Bot blocking
- Rate limiting

## Summary

This design uses Azure Application Gateway as the public entry point for a KFC application deployed on App Service. The gateway routes:

- frontend traffic to the React frontend App Service
- API traffic to the Node.js backend App Service

This pattern is ideal when you want centralized TLS, routing, and security without managin

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

########################################3

