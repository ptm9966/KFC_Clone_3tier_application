#!/bin/bash

# KFC Clone Kubernetes Status Check Script
# This script checks the status of all deployed components

set -e

echo "📊 KFC Clone Kubernetes Status Check"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check namespace
echo "🔍 Checking Namespace..."
if kubectl get namespace dev &> /dev/null; then
    print_status "Namespace 'dev' exists"
else
    print_error "Namespace 'dev' does not exist"
    echo "Run: kubectl apply -f namespace.yaml"
    exit 1
fi

# Check pods
echo ""
echo "🔍 Checking Pods..."
kubectl get pods -n dev --no-headers | while read -r line; do
    pod_name=$(echo "$line" | awk '{print $1}')
    status=$(echo "$line" | awk '{print $3}')
    ready=$(echo "$line" | awk '{print $2}')

    case $status in
        "Running")
            if [[ $ready == "1/1" ]] || [[ $ready == "2/2" ]]; then
                print_status "Pod $pod_name: $status ($ready)"
            else
                print_warning "Pod $pod_name: $status ($ready) - Not fully ready"
            fi
            ;;
        "Pending")
            print_warning "Pod $pod_name: $status - Waiting for resources"
            ;;
        "CrashLoopBackOff"|"Error")
            print_error "Pod $pod_name: $status - Check logs"
            ;;
        *)
            print_info "Pod $pod_name: $status ($ready)"
            ;;
    esac
done

# Check services
echo ""
echo "🔍 Checking Services..."
kubectl get services -n dev --no-headers | while read -r line; do
    svc_name=$(echo "$line" | awk '{print $1}')
    type=$(echo "$line" | awk '{print $2}')
    cluster_ip=$(echo "$line" | awk '{print $3}')
    ports=$(echo "$line" | awk '{print $5}')

    print_status "Service $svc_name: $type ($ports)"
done

# Check ingress
echo ""
echo "🔍 Checking Ingress..."
if kubectl get ingress kfc-ingress -n dev &> /dev/null; then
    ingress_info=$(kubectl get ingress kfc-ingress -n dev -o jsonpath='{.spec.rules[0].host}')
    print_status "Ingress configured for: $ingress_info"
else
    print_warning "Ingress not found"
fi

# Check persistent volumes
echo ""
echo "🔍 Checking Persistent Volumes..."
kubectl get pvc -n dev --no-headers | while read -r line; do
    pvc_name=$(echo "$line" | awk '{print $1}')
    status=$(echo "$line" | awk '{print $2}')
    capacity=$(echo "$line" | awk '{print $4}')

    if [[ $status == "Bound" ]]; then
        print_status "PVC $pvc_name: $status ($capacity)"
    else
        print_warning "PVC $pvc_name: $status"
    fi
done

# Health checks
echo ""
echo "🔍 Running Health Checks..."

# Check MongoDB connectivity (from backend pod)
echo "   Testing MongoDB connectivity..."
if kubectl get pods -n dev -l app=kfc-backend -o jsonpath='{.items[0].metadata.name}' &> /dev/null; then
    backend_pod=$(kubectl get pods -n dev -l app=kfc-backend -o jsonpath='{.items[0].metadata.name}')
    if kubectl exec $backend_pod -n dev -- curl -f http://kfc-mongodb:27017 &> /dev/null; then
        print_status "MongoDB connectivity: OK"
    else
        print_warning "MongoDB connectivity: Failed"
    fi
else
    print_warning "Backend pod not found - cannot test MongoDB connectivity"
fi

# Check API endpoints
echo "   Testing API endpoints..."
if kubectl get pods -n dev -l app=kfc-backend -o jsonpath='{.items[0].metadata.name}' &> /dev/null; then
    backend_pod=$(kubectl get pods -n dev -l app=kfc-backend -o jsonpath='{.items[0].metadata.name}')

    # Test API docs
    if kubectl exec $backend_pod -n dev -- curl -f http://localhost:8080/api-docs &> /dev/null; then
        print_status "API Docs endpoint: OK"
    else
        print_warning "API Docs endpoint: Failed"
    fi

    # Test products endpoint
    if kubectl exec $backend_pod -n dev -- curl -f http://localhost:8080/api/product &> /dev/null; then
        print_status "Products API endpoint: OK"
    else
        print_warning "Products API endpoint: Failed"
    fi
else
    print_warning "Backend pod not found - cannot test API endpoints"
fi

# Summary
echo ""
echo "📋 Summary"
echo "=========="

total_pods=$(kubectl get pods -n dev --no-headers | wc -l)
running_pods=$(kubectl get pods -n dev --no-headers | grep Running | wc -l)
ready_pods=$(kubectl get pods -n dev --no-headers | grep "1/1\|2/2" | wc -l)

echo "Pods: $running_pods/$total_pods running, $ready_pods fully ready"

services_count=$(kubectl get services -n dev --no-headers | wc -l)
echo "Services: $services_count configured"

if kubectl get ingress kfc-ingress -n dev &> /dev/null; then
    echo "Ingress: Configured"
else
    echo "Ingress: Not configured"
fi

echo ""
if [[ $running_pods -eq $total_pods ]] && [[ $ready_pods -eq $total_pods ]]; then
    print_status "All components are running and ready!"
    echo ""
    print_info "Application URLs:"
    if kubectl get ingress kfc-ingress -n dev &> /dev/null; then
        host=$(kubectl get ingress kfc-ingress -n dev -o jsonpath='{.spec.rules[0].host}')
        echo "  Frontend: http://$host"
        echo "  API: http://$host/api"
        echo "  API Docs: http://$host/api-docs"
    fi
else
    print_warning "Some components are not ready. Check the details above."
fi