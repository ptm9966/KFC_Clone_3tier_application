# KFC Clone - Kubernetes Deployment (Development)

This directory contains Kubernetes manifests for deploying the KFC Clone application in a development environment.

## 📁 File Structure

```
.k8s/dev/
├── namespace.yaml          # Kubernetes namespace definition
├── configmap.yaml          # ConfigMaps and Secrets for configuration
├── mongodb-deployment.yaml # MongoDB deployment, service, and PVCs
├── backend-deployment.yaml # Backend (Node.js) deployment and service
├── frontend-deployment.yaml # Frontend (React) deployment and service
├── ingress.yaml           # Ingress and Network Policy
├── deploy.sh             # Automated deployment script
└── README.md             # This file
```

## 🚀 Quick Deployment

### Prerequisites

1. **Kubernetes Cluster**: A running Kubernetes cluster (Minikube, Docker Desktop, EKS, etc.)
2. **kubectl**: Configured to connect to your cluster
3. **Docker Images**: Build and push the application images:
   ```bash
   # Build backend image
   cd Backend
   docker build -t kfc-backend:latest .

   # Build frontend image
   cd Frontend
   docker build -t kfc-frontend:latest .

   # Push to registry (if using external registry)
   docker tag kfc-backend:latest your-registry/kfc-backend:latest
   docker tag kfc-frontend:latest your-registry/kfc-frontend:latest
   docker push your-registry/kfc-backend:latest
   docker push your-registry/kfc-frontend:latest
   ```

### Automated Deployment

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Manual Deployment

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Deploy configuration
kubectl apply -f configmap.yaml

# 3. Deploy MongoDB
kubectl apply -f mongodb-deployment.yaml

# 4. Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=kfc-mongodb -n dev --timeout=300s

# 5. Deploy Backend
kubectl apply -f backend-deployment.yaml

# 6. Wait for Backend to be ready
kubectl wait --for=condition=ready pod -l app=kfc-backend -n dev --timeout=300s

# 7. Deploy Frontend
kubectl apply -f frontend-deployment.yaml

# 8. Deploy Ingress
kubectl apply -f ingress.yaml
```

## 🔧 Configuration

### Environment Variables

The application uses ConfigMaps and Secrets for configuration:

- **ConfigMap (`kfc-config`)**: Contains non-sensitive configuration
- **Secret (`kfc-secrets`)**: Contains sensitive data like database credentials

### Database Credentials

Update the secret values in `configmap.yaml`:

```yaml
data:
  MONGO_INITDB_ROOT_USERNAME: <base64-encoded-username>
  MONGO_INITDB_ROOT_PASSWORD: <base64-encoded-password>
  MONGO_INITDB_DATABASE: <base64-encoded-database-name>
```

To encode values:
```bash
echo -n "admin" | base64
echo -n "admin123456" | base64
echo -n "kfc-database" | base64
```

### Ingress Configuration

Update the ingress host in `ingress.yaml`:

```yaml
spec:
  rules:
  - host: your-domain.com  # Change this to your domain
```

Add to your hosts file:
```bash
# Linux/Mac
echo "127.0.0.1 your-domain.com" >> /etc/hosts

# Windows
# Add "127.0.0.1 your-domain.com" to C:\Windows\System32\drivers\etc\hosts
```

## 📊 Services Overview

| Service | Internal URL | External URL | Description |
|---------|-------------|--------------|-------------|
| Frontend | `kfc-frontend:80` | `http://your-domain.com` | React application |
| Backend | `kfc-backend:8080` | `http://your-domain.com/api` | Node.js API server |
| MongoDB | `kfc-mongodb:27017` | N/A | MongoDB database |
| API Docs | N/A | `http://your-domain.com/api-docs` | Swagger documentation |

## 🔍 Monitoring & Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n dev
kubectl describe pod <pod-name> -n dev
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/kfc-backend -n dev

# Frontend logs
kubectl logs -f deployment/kfc-frontend -n dev

# MongoDB logs
kubectl logs -f deployment/kfc-mongodb -n dev
```

### Check Services
```bash
kubectl get services -n dev
kubectl get ingress -n dev
```

### Debug Network Issues
```bash
# Test internal connectivity
kubectl exec -it deployment/kfc-backend -n dev -- curl kfc-mongodb:27017

# Port forward for local testing
kubectl port-forward svc/kfc-backend 8080:8080 -n dev
```

## 🔄 Scaling

### Scale Backend
```bash
kubectl scale deployment kfc-backend --replicas=3 -n dev
```

### Scale Frontend
```bash
kubectl scale deployment kfc-frontend --replicas=5 -n dev
```

## 🧹 Cleanup

### Remove All Resources
```bash
kubectl delete namespace dev
```

### Remove Specific Resources
```bash
kubectl delete -f ingress.yaml
kubectl delete -f frontend-deployment.yaml
kubectl delete -f backend-deployment.yaml
kubectl delete -f mongodb-deployment.yaml
kubectl delete -f configmap.yaml
kubectl delete -f namespace.yaml
```

## 🔒 Security Considerations

1. **Secrets**: Use Kubernetes secrets for sensitive data
2. **Network Policies**: Restrict pod-to-pod communication
3. **RBAC**: Implement Role-Based Access Control
4. **TLS**: Enable SSL/TLS for production deployments
5. **Image Security**: Scan images for vulnerabilities

## 🚀 Production Deployment

For production deployment, consider:

1. **External Registry**: Use a proper container registry
2. **Persistent Storage**: Use cloud-managed storage (EBS, EFS, etc.)
3. **Load Balancer**: Use cloud load balancers instead of ingress
4. **Monitoring**: Implement proper monitoring and logging
5. **Backup**: Set up database backups
6. **CI/CD**: Implement automated deployment pipelines

## 📞 Support

For issues with this deployment:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Check Kubernetes cluster resources and permissions
4. Review pod logs for application-specific errors

## 📝 Notes

- MongoDB data persists across pod restarts via PVC
- Application automatically initializes with sample products
- Health checks ensure services are ready before routing traffic
- Network policies provide basic security isolation