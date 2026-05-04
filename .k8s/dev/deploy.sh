#!/bin/bash

# KFC Clone Kubernetes Deployment Script for Development Environment
# This script deploys the entire KFC Clone application to Kubernetes

set -e

echo "🚀 Starting KFC Clone Kubernetes Deployment (Development)"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    echo "Please install kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check if connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Not connected to a Kubernetes cluster"
    echo "Please configure kubectl to connect to your cluster"
    exit 1
fi

echo "📋 Deployment Steps:"
echo "1. Create namespace"
echo "2. Deploy ConfigMaps and Secrets"
echo "3. Deploy MongoDB"
echo "4. Deploy Backend"
echo "5. Deploy Frontend"
echo "6. Deploy Ingress"
echo ""

# Create namespace
echo "1. Creating namespace..."
kubectl apply -f namespace.yaml
print_status "Namespace created"

# Deploy ConfigMaps and Secrets
echo "2. Deploying ConfigMaps and Secrets..."
kubectl apply -f configmap.yaml
print_status "ConfigMaps and Secrets deployed"

# Deploy MongoDB
echo "3. Deploying MongoDB..."
kubectl apply -f mongodb-deployment.yaml
print_status "MongoDB deployment initiated"

# Wait for MongoDB to be ready
echo "   Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=kfc-mongodb -n dev --timeout=300s
print_status "MongoDB is ready"

# Deploy Backend
echo "4. Deploying Backend..."
kubectl apply -f backend-deployment.yaml
print_status "Backend deployment initiated"

# Wait for Backend to be ready
echo "   Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=kfc-backend -n dev --timeout=300s
print_status "Backend is ready"

# Deploy Frontend
echo "5. Deploying Frontend..."
kubectl apply -f frontend-deployment.yaml
print_status "Frontend deployment initiated"

# Wait for Frontend to be ready
echo "   Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=kfc-frontend -n dev --timeout=300s
print_status "Frontend is ready"

# Deploy Ingress
echo "6. Deploying Ingress..."
kubectl apply -f ingress.yaml
print_status "Ingress deployed"

echo ""
echo "🎉 Deployment Complete!"
echo "===================="
echo ""
echo "📊 Service Status:"
kubectl get pods -n dev
echo ""
kubectl get services -n dev
echo ""
kubectl get ingress -n dev
echo ""

# Get ingress IP/hostname
INGRESS_HOST=$(kubectl get ingress kfc-ingress -n dev -o jsonpath='{.spec.rules[0].host}')
echo "🌐 Application URLs:"
echo "   Frontend: http://$INGRESS_HOST"
echo "   Backend API: http://$INGRESS_HOST/api"
echo "   API Docs: http://$INGRESS_HOST/api-docs"
echo ""

print_warning "Note: Add '$INGRESS_HOST' to your hosts file pointing to your ingress IP"
print_warning "Example: 127.0.0.1 kfc.local"

echo ""
echo "🔍 Useful Commands:"
echo "   View logs: kubectl logs -f deployment/kfc-backend -n dev"
echo "   Scale backend: kubectl scale deployment kfc-backend --replicas=3 -n dev"
echo "   Delete all: kubectl delete namespace dev"
echo ""

print_status "KFC Clone application deployed successfully!"