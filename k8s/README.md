# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying Flash USDT Sender to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster v1.25+
- kubectl configured
- Helm 3.x (optional)
- nginx ingress controller
- cert-manager (for TLS)

## Quick Deploy

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Create secrets (update values first!)
kubectl apply -f secrets.yaml

# Create config
kubectl apply -f configmap.yaml

# Deploy Redis
kubectl apply -f redis.yaml

# Deploy application
kubectl apply -f deployment-api.yaml
kubectl apply -f deployment-worker.yaml

# Create services
kubectl apply -f service.yaml

# Create ingress
kubectl apply -f ingress.yaml

# Setup autoscaling
kubectl apply -f hpa.yaml
kubectl apply -f pdb.yaml

# Setup RBAC
kubectl apply -f rbac.yaml

# Setup monitoring
kubectl apply -f monitoring.yaml
```

## Configuration

### Update Secrets

Before deploying, update `secrets.yaml` with production values:

```bash
# Generate strong secrets
openssl rand -base64 32  # for JWT_SECRET
openssl rand -base64 32  # for ENCRYPTION_KEY
```

### Environment Variables

Update `configmap.yaml` for your environment:

| Variable | Description |
|----------|-------------|
| NODE_ENV | Environment (production/staging) |
| API_BASE_URL | API endpoint URL |
| LOG_LEVEL | Logging level |

## Scaling

### Manual Scaling

```bash
# Scale API deployment
kubectl scale deployment flash-usdt-api -n flash-usdt --replicas=5

# Scale worker deployment
kubectl scale deployment flash-usdt-worker -n flash-usdt --replicas=3
```

### Auto-scaling

HPA is configured to scale based on CPU and memory usage:
- Min replicas: 3
- Max replicas: 10
- Scale on CPU > 70%
- Scale on Memory > 80%

## Monitoring

### Check Pod Status

```bash
kubectl get pods -n flash-usdt
kubectl logs -f deployment/flash-usdt-api -n flash-usdt
```

### Check Services

```bash
kubectl get services -n flash-usdt
kubectl get ingress -n flash-usdt
```

### Resource Usage

```bash
kubectl top pods -n flash-usdt
kubectl top nodes
```

## Troubleshooting

### View Logs

```bash
# API logs
kubectl logs -f deployment/flash-usdt-api -n flash-usdt

# Worker logs
kubectl logs -f deployment/flash-usdt-worker -n flash-usdt

# All pods
kubectl logs -l app=flash-usdt-sender -n flash-usdt
```

### Describe Resources

```bash
kubectl describe pod <pod-name> -n flash-usdt
kubectl describe deployment flash-usdt-api -n flash-usdt
```

### Execute Commands in Pod

```bash
kubectl exec -it <pod-name> -n flash-usdt -- /bin/sh
```

## Rollback

```bash
# View rollout history
kubectl rollout history deployment/flash-usdt-api -n flash-usdt

# Rollback to previous version
kubectl rollout undo deployment/flash-usdt-api -n flash-usdt

# Rollback to specific revision
kubectl rollout undo deployment/flash-usdt-api -n flash-usdt --to-revision=2
```

## Cleanup

```bash
# Delete all resources
kubectl delete namespace flash-usdt
```

## Production Checklist

- [ ] Update all secrets with strong values
- [ ] Configure TLS certificates
- [ ] Set up monitoring alerts
- [ ] Configure log aggregation
- [ ] Set resource limits appropriately
- [ ] Configure backup for persistent data
- [ ] Set up disaster recovery

## Support

- Telegram: https://t.me/FlashUSDTokens
- WhatsApp: +12052186093
- Email: support@flashusdtsender.xyz
