# Voice Agent Platform Deployment Guide

## 1. Introduction

This guide provides step-by-step instructions for deploying the Voice Agent Platform in various environments. It covers local development, staging, and production deployments with best practices for scalability, security, and reliability.

## 2. Prerequisites

### 2.1 System Requirements

```yaml
minimum_requirements:
  cpu: 4 cores
  memory: 8 GB RAM
  storage: 50 GB SSD
  network: 100 Mbps
  
recommended_requirements:
  cpu: 8 cores
  memory: 16 GB RAM
  storage: 200 GB SSD
  network: 1 Gbps
```

### 2.2 Software Dependencies

```bash
# Required software
node: 20.x LTS
npm: 10.x
docker: 24.x
docker-compose: 2.x
postgresql: 15.x
redis: 7.x
nginx: 1.24.x

# Cloud CLI tools (based on provider)
aws-cli: 2.x
gcloud: latest
azure-cli: 2.x
```

### 2.3 Access Requirements

- Domain name with DNS control
- SSL certificates (or ability to generate via Let's Encrypt)
- Cloud provider account with appropriate permissions
- Container registry access
- Monitoring service accounts

## 3. Local Development Setup

### 3.1 Clone and Setup

```bash
# Clone the repository
git clone https://github.com/voiceagent/platform.git
cd platform

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3.2 Database Setup

```bash
# Start PostgreSQL and Redis using Docker
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

### 3.3 Start Development Server

```bash
# Start all services
npm run dev

# Or start services individually
npm run dev:web      # Dashboard on http://localhost:3000
npm run dev:api      # API on http://localhost:3001
npm run dev:realtime # WebSocket on ws://localhost:3002
```

### 3.4 Development Tools

```bash
# Database GUI
npm run studio     # Opens Prisma Studio

# API Documentation
npm run docs       # Opens API docs on http://localhost:3003

# Testing
npm run test       # Run unit tests
npm run test:e2e   # Run E2E tests
```

## 4. Docker Deployment

### 4.1 Build Docker Images

```dockerfile
# Dockerfile.web
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build images
docker build -f Dockerfile.web -t voice-agent-web:latest .
docker build -f Dockerfile.api -t voice-agent-api:latest .
docker build -f Dockerfile.realtime -t voice-agent-realtime:latest .

# Tag for registry
docker tag voice-agent-web:latest registry.example.com/voice-agent-web:latest
docker push registry.example.com/voice-agent-web:latest
```

### 4.2 Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  web:
    image: voice-agent-web:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  api:
    image: voice-agent-api:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  realtime:
    image: voice-agent-realtime:latest
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - REDIS_URL=${REDIS_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=voiceagent
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api
      - realtime
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## 5. Kubernetes Deployment

### 5.1 Namespace and ConfigMap

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: voice-agent

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: voice-agent-config
  namespace: voice-agent
data:
  NODE_ENV: "production"
  API_URL: "https://api.voiceagent.com"
  WS_URL: "wss://rt.voiceagent.com"
```

### 5.2 Deployments

```yaml
# k8s/deployment-web.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voice-agent-web
  namespace: voice-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: voice-agent-web
  template:
    metadata:
      labels:
        app: voice-agent-web
    spec:
      containers:
      - name: web
        image: registry.example.com/voice-agent-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: voice-agent-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: voice-agent-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 5.3 Services

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: voice-agent-web
  namespace: voice-agent
spec:
  selector:
    app: voice-agent-web
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: voice-agent-api
  namespace: voice-agent
spec:
  selector:
    app: voice-agent-api
  ports:
  - port: 80
    targetPort: 3001
  type: ClusterIP

---
apiVersion: v1
kind: Service
metadata:
  name: voice-agent-realtime
  namespace: voice-agent
spec:
  selector:
    app: voice-agent-realtime
  ports:
  - port: 80
    targetPort: 3002
  type: ClusterIP
```

### 5.4 Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: voice-agent-ingress
  namespace: voice-agent
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/websocket-services: "voice-agent-realtime"
spec:
  tls:
  - hosts:
    - app.voiceagent.com
    - api.voiceagent.com
    - rt.voiceagent.com
    secretName: voice-agent-tls
  rules:
  - host: app.voiceagent.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: voice-agent-web
            port:
              number: 80
  - host: api.voiceagent.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: voice-agent-api
            port:
              number: 80
  - host: rt.voiceagent.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: voice-agent-realtime
            port:
              number: 80
```

### 5.5 Horizontal Pod Autoscaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: voice-agent-web-hpa
  namespace: voice-agent
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: voice-agent-web
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 6. Cloud Provider Deployments

### 6.1 AWS Deployment

#### ECS with Fargate

```typescript
// infrastructure/aws/ecs.ts
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

export class VoiceAgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC
    const vpc = new ec2.Vpc(this, 'VoiceAgentVPC', {
      maxAzs: 3,
      natGateways: 2
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'VoiceAgentCluster', {
      vpc,
      containerInsights: true
    });

    // Web Service
    const webService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'WebService', {
      cluster,
      cpu: 1024,
      memoryLimitMiB: 2048,
      desiredCount: 3,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('voice-agent-web:latest'),
        environment: {
          NODE_ENV: 'production'
        }
      }
    });

    // Auto Scaling
    const scaling = webService.service.autoScaleTaskCount({
      maxCapacity: 20,
      minCapacity: 3
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70
    });

    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 80
    });
  }
}
```

#### RDS Setup

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier voice-agent-db \
  --db-instance-class db.r6g.xlarge \
  --engine postgres \
  --engine-version 15.4 \
  --master-username admin \
  --master-user-password $DB_PASSWORD \
  --allocated-storage 100 \
  --storage-encrypted \
  --multi-az \
  --backup-retention-period 7
```

### 6.2 Google Cloud Deployment

#### Cloud Run Deployment

```yaml
# cloudrun/service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: voice-agent-web
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "3"
        autoscaling.knative.dev/maxScale: "100"
    spec:
      containers:
      - image: gcr.io/PROJECT_ID/voice-agent-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
```

```bash
# Deploy to Cloud Run
gcloud run deploy voice-agent-web \
  --image gcr.io/PROJECT_ID/voice-agent-web:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 3 \
  --max-instances 100 \
  --memory 2Gi \
  --cpu 2
```

### 6.3 Azure Deployment

#### Container Instances

```bash
# Create resource group
az group create --name voice-agent-rg --location eastus

# Create container registry
az acr create --resource-group voice-agent-rg \
  --name voiceagentregistry --sku Premium

# Deploy to Container Instances
az container create \
  --resource-group voice-agent-rg \
  --name voice-agent-web \
  --image voiceagentregistry.azurecr.io/voice-agent-web:latest \
  --cpu 2 --memory 4 \
  --ports 3000 \
  --dns-name-label voice-agent-web \
  --environment-variables NODE_ENV=production
```

## 7. Database Deployment

### 7.1 PostgreSQL Setup

```sql
-- Create database and user
CREATE DATABASE voiceagent;
CREATE USER voiceagent_app WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE voiceagent TO voiceagent_app;

-- Enable required extensions
\c voiceagent
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Performance tuning
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET max_connections = '200';
```

### 7.2 Database Migrations

```bash
# Run migrations
npm run db:migrate:deploy

# Rollback if needed
npm run db:migrate:rollback

# Generate migration
npm run db:migrate:create -- --name add_user_preferences
```

### 7.3 Backup Strategy

```bash
# Automated backup script
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="voiceagent"

# Backup database
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -b -v -f "$BACKUP_DIR/backup_$DATE.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/backup_$DATE.dump" s3://voice-agent-backups/postgres/

# Clean up old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete
```

## 8. Load Balancing & CDN

### 8.1 Nginx Configuration

```nginx
# nginx.conf
upstream web_backend {
    least_conn;
    server web1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server web2:3000 weight=1 max_fails=3 fail_timeout=30s;
    server web3:3000 weight=1 max_fails=3 fail_timeout=30s;
}

upstream api_backend {
    least_conn;
    server api1:3001 weight=1 max_fails=3 fail_timeout=30s;
    server api2:3001 weight=1 max_fails=3 fail_timeout=30s;
}

upstream realtime_backend {
    ip_hash;  # Sticky sessions for WebSocket
    server rt1:3002;
    server rt2:3002;
}

server {
    listen 443 ssl http2;
    server_name app.voiceagent.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://web_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name rt.voiceagent.com;

    location / {
        proxy_pass http://realtime_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

### 8.2 Cloudflare Configuration

```javascript
// Cloudflare Worker for edge caching
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    const cache = caches.default
    let response = await cache.match(request)
    
    if (!response) {
      response = await fetch(request)
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'public, max-age=31536000')
      
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      })
      
      event.waitUntil(cache.put(request, response.clone()))
    }
    
    return response
  }
  
  // Pass through dynamic requests
  return fetch(request)
}
```

## 9. Monitoring & Logging

### 9.1 Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'voice-agent-web'
    static_configs:
      - targets: ['web1:9090', 'web2:9090', 'web3:9090']
        labels:
          service: 'web'
          
  - job_name: 'voice-agent-api'
    static_configs:
      - targets: ['api1:9091', 'api2:9091']
        labels:
          service: 'api'
          
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']
        
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 9.2 Grafana Dashboards

```json
{
  "dashboard": {
    "title": "Voice Agent Platform",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Active Sessions",
        "targets": [
          {
            "expr": "voice_agent_active_sessions"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

### 9.3 Log Aggregation

```yaml
# fluentd/fluent.conf
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<filter app.**>
  @type parser
  key_name log
  <parse>
    @type json
  </parse>
</filter>

<match app.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name voice-agent
  type_name logs
  <buffer>
    @type file
    path /var/log/fluentd-buffers/elasticsearch.buffer
    flush_mode interval
    flush_interval 10s
  </buffer>
</match>
```

## 10. Security Hardening

### 10.1 SSL/TLS Configuration

```bash
# Generate SSL certificates with Let's Encrypt
certbot certonly --standalone \
  -d app.voiceagent.com \
  -d api.voiceagent.com \
  -d rt.voiceagent.com \
  --email admin@voiceagent.com \
  --agree-tos \
  --no-eff-email

# Auto-renewal cron job
echo "0 0 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### 10.2 Firewall Rules

```bash
# UFW configuration
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (restrict to specific IPs)
ufw allow from 10.0.0.0/8 to any port 22

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow internal communication
ufw allow from 172.16.0.0/12

# Enable firewall
ufw --force enable
```

### 10.3 Security Headers

```javascript
// middleware/security.js
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
}
```

## 11. Deployment Checklist

### 11.1 Pre-Deployment

- [ ] Code review completed
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Database migrations prepared
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured

### 11.2 Deployment Steps

1. **Backup current state**
   ```bash
   ./scripts/backup-production.sh
   ```

2. **Deploy database migrations**
   ```bash
   npm run db:migrate:deploy
   ```

3. **Deploy application**
   ```bash
   ./scripts/deploy.sh --environment production --version $VERSION
   ```

4. **Verify deployment**
   ```bash
   ./scripts/health-check.sh
   ```

5. **Monitor metrics**
   - Check error rates
   - Monitor response times
   - Verify resource usage

### 11.3 Post-Deployment

- [ ] Smoke tests passing
- [ ] No increase in error rates
- [ ] Performance metrics normal
- [ ] All services healthy
- [ ] User reports monitored
- [ ] Rollback tested (if needed)

## 12. Troubleshooting

### 12.1 Common Issues

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Analyze heap dump
node --inspect app.js
chrome://inspect

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" node app.js
```

#### Database Connection Issues
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < current_timestamp - interval '1 hour';
```

#### WebSocket Connection Drops
```javascript
// Add reconnection logic
const reconnectInterval = 5000;
let ws;

function connect() {
  ws = new WebSocket(wsUrl);
  
  ws.onclose = () => {
    setTimeout(connect, reconnectInterval);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    ws.close();
  };
}
```

### 12.2 Performance Optimization

```bash
# Enable Node.js clustering
pm2 start app.js -i max

# Optimize Docker images
docker image prune -a
docker system prune -a

# Database query optimization
EXPLAIN ANALYZE SELECT * FROM conversations WHERE ...;
```

## 13. Maintenance

### 13.1 Regular Tasks

```yaml
daily:
  - Check system health
  - Review error logs
  - Monitor disk space
  - Verify backups

weekly:
  - Security updates
  - Performance review
  - Capacity planning
  - Cost optimization

monthly:
  - Full system backup
  - Disaster recovery test
  - Security audit
  - Documentation update
```

### 13.2 Update Procedures

```bash
# Update dependencies
npm update
npm audit fix

# Update Docker base images
docker pull node:20-alpine
docker build --no-cache -t voice-agent-web:latest .

# Update Kubernetes
kubectl set image deployment/voice-agent-web \
  web=voice-agent-web:new-version \
  --record
```

## 14. Conclusion

This deployment guide provides comprehensive instructions for deploying the Voice Agent Platform in various environments. Always test deployments in staging before production, maintain proper backups, and monitor system health continuously. For additional support, consult the platform documentation or contact the DevOps team. 