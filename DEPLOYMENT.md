# Deployment Guide for Financial Reporting Engine

## Overview

The Financial Reporting Engine is a full-stack application with:
- **Frontend**: React + Vite (serves as SPA)
- **Backend**: Node.js + Express API
- **Storage**: In-memory with file persistence (development) or PostgreSQL (production)

## Pre-Deployment Checklist

- [ ] Review and update all environment variables in `.env.production`
- [ ] Set strong `JWT_SECRET` (use `openssl rand -base64 32` to generate)
- [ ] Update `WEB_ORIGIN` to your production domain
- [ ] Verify all dependencies are installed: `npm ci`
- [ ] Run tests: `npm run test`
- [ ] Build both web and API: `npm run build`
- [ ] Test production build locally: `npm run start:prod`
- [ ] Review security configuration
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for storage

## Deployment Options

### Option 1: Docker (Recommended)

#### Build Docker Image

```bash
# Build the Docker image
docker build -t fre:latest .

# Or use docker-compose for easier setup
docker-compose up -d
```

#### Docker Configuration

The `docker-compose.yml` includes:
- API service on port 4000
- Volume mounts for persistent data (storage, uploads, generated)
- Health checks
- Automatic restart policy
- Optional PostgreSQL database (commented out)

#### Environment Variables

Create a `.env` file in the project root for docker-compose:

```
JWT_SECRET=your-secure-random-secret
WEB_ORIGIN=https://yourdomain.com
STORAGE_DRIVER=memory
DATABASE_URL=postgresql://user:password@postgres:5432/fre
```

#### Running with Docker

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Backup data
docker cp fre-api:/app/apps/api/storage ./backup-storage
```

### Option 2: Manual Deployment (VPS/Cloud Instance)

#### System Requirements

- Node.js 18.x or later
- npm 9.x or later
- Optional: PostgreSQL 12+ for production database
- Minimum 2GB RAM
- 10GB disk space (adjust based on file uploads)

#### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivang-vakharia/Financial-Reporting-Engine.git
   cd Financial-Reporting-Engine
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment**
   ```bash
   cp .env.production .env
   # Edit .env with your production values
   vi .env
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Create required directories**
   ```bash
   mkdir -p apps/api/uploads apps/api/generated apps/api/storage
   chmod 755 apps/api/uploads apps/api/generated apps/api/storage
   ```

6. **Start the application**
   ```bash
   npm start
   ```

   Or with process manager (recommended):
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name fre
   pm2 save
   pm2 startup
   ```

### Option 3: Kubernetes Deployment

Create a `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fre-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: fre-api
  template:
    metadata:
      labels:
        app: fre-api
    spec:
      containers:
      - name: fre-api
        image: fre:latest
        ports:
        - containerPort: 4000
        env:
        - name: PORT
          value: "4000"
        - name: NODE_ENV
          value: "production"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: fre-secrets
              key: jwt-secret
        - name: WEB_ORIGIN
          value: "https://yourdomain.com"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        volumeMounts:
        - name: storage
          mountPath: /app/apps/api/storage
        - name: uploads
          mountPath: /app/apps/api/uploads
        - name: generated
          mountPath: /app/apps/api/generated
      volumes:
      - name: storage
        persistentVolumeClaim:
          claimName: fre-storage
      - name: uploads
        persistentVolumeClaim:
          claimName: fre-uploads
      - name: generated
        persistentVolumeClaim:
          claimName: fre-generated
---
apiVersion: v1
kind: Service
metadata:
  name: fre-api
spec:
  selector:
    app: fre-api
  ports:
  - protocol: TCP
    port: 4000
    targetPort: 4000
  type: LoadBalancer
```

Deploy:
```bash
kubectl create secret generic fre-secrets --from-literal=jwt-secret=$(openssl rand -base64 32)
kubectl apply -f k8s/deployment.yaml
```

## Production Security Recommendations

### 1. CORS Configuration
- Update `WEB_ORIGIN` to your domain only
- Never use `*` in production

### 2. JWT Security
- Generate strong secret: `openssl rand -base64 32`
- Rotate keys periodically
- Use RS256 (asymmetric) for better security

### 3. Rate Limiting
Add rate limiting middleware for production:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});

app.use('/api/', limiter);
```

### 4. Security Headers
Add Helmet middleware:

```javascript
import helmet from 'helmet';
app.use(helmet());
```

### 5. Input Validation
- Validate all file uploads (type, size, content)
- Sanitize user inputs
- Use parameterized queries for database

### 6. Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups
- Principle of least privilege for database users

### 7. Monitoring & Logging
- Log all authentication attempts
- Monitor error rates
- Set up alerts for anomalies
- Keep audit trail of file uploads

## Database Setup (PostgreSQL)

### Create Database

```bash
sudo -u postgres psql

CREATE DATABASE financial_reporting_engine;
CREATE USER fre_user WITH PASSWORD 'secure_password';
ALTER ROLE fre_user SET client_encoding TO 'utf8';
ALTER ROLE fre_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE fre_user SET default_transaction_deferrable TO on;
ALTER ROLE fre_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE financial_reporting_engine TO fre_user;
```

### Update Connection String

```
DATABASE_URL=postgresql://fre_user:secure_password@localhost:5432/financial_reporting_engine
```

## Health Checks

The application exposes a health check endpoint:

```bash
curl http://localhost:4000/health
# Response: {"ok":true,"service":"financial-reporting-engine-api"}
```

## Backup Strategy

### File Backup

```bash
# Backup storage directory
tar -czf backup-storage-$(date +%Y%m%d).tar.gz apps/api/storage/

# Backup uploads
tar -czf backup-uploads-$(date +%Y%m%d).tar.gz apps/api/uploads/

# Backup generated reports
tar -czf backup-generated-$(date +%Y%m%d).tar.gz apps/api/generated/
```

### Database Backup (PostgreSQL)

```bash
# Create backup
pg_dump -U fre_user financial_reporting_engine > backup-$(date +%Y%m%d).sql

# Restore backup
psql -U fre_user financial_reporting_engine < backup-*.sql
```

### Automated Backups

Schedule with cron (Linux/Mac):

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## Monitoring

### Key Metrics to Monitor

- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Disk usage (uploads, storage, generated)
- Memory usage
- Authentication failures
- File upload volume

### Example Monitoring Setup with Prometheus

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fre-api'
    static_configs:
      - targets: ['localhost:4000']
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### High Memory Usage

- Check for memory leaks in logs
- Restart the application
- Increase server resources

### Storage Issues

- Monitor disk space
- Clean up old generated reports
- Archive old uploads

### Database Connection Errors

- Verify DATABASE_URL is correct
- Check database is running
- Verify credentials and permissions
- Check network connectivity

## Rollback Procedure

1. Keep previous version backed up
2. Document current state
3. Restore from backup:
   ```bash
   docker-compose down
   docker image rm fre:latest
   # Restore storage from backup
   tar -xzf backup-storage-*.tar.gz
   docker-compose up -d
   ```

## Updating to New Version

1. Pull latest changes: `git pull origin main`
2. Run tests: `npm run test`
3. Build: `npm run build`
4. Stop current deployment
5. Backup current state
6. Deploy new version
7. Verify health checks
8. Monitor logs for errors

## Performance Optimization

### Frontend
- Assets are minified by Vite
- Enable gzip compression in web server
- Use CDN for static assets

### Backend
- Enable connection pooling for database
- Use caching for frequently accessed data
- Implement pagination for large datasets
- Use indexes on database queries

### Infrastructure
- Use reverse proxy (nginx/Apache) with caching
- Enable gzip compression
- Use HTTP/2
- Enable browser caching headers

## Support & Maintenance

For issues or questions:
- Check application logs
- Review troubleshooting section
- Create GitHub issue with:
  - Error message and stack trace
  - Environment details (OS, Node version, etc.)
  - Steps to reproduce
  - Recent changes (if applicable)

## Additional Resources

- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
