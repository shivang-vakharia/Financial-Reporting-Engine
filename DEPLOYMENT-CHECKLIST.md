# Production Deployment Checklist

Use this checklist before deploying to production.

## 1. Security & Authentication

- [ ] Generate strong JWT_SECRET: `openssl rand -base64 32`
- [ ] Update `JWT_SECRET` in `.env.production`
- [ ] Set `NODE_ENV=production` in environment
- [ ] Update `WEB_ORIGIN` to your production domain
- [ ] Enable HTTPS/TLS on your web server
- [ ] Configure CORS for production domain only
- [ ] Review helmet security headers configuration
- [ ] Test rate limiting on auth endpoints
- [ ] Verify input validation on all endpoints
- [ ] Audit file upload restrictions
- [ ] Enable database SSL/TLS connections (if applicable)
- [ ] Set strong database passwords
- [ ] Disable debug mode (`NODE_ENV !== 'production'`)

## 2. Database Setup

- [ ] Create production database
- [ ] Create database user with least privileges
- [ ] Test database connection string
- [ ] Set up automated backups
- [ ] Test backup recovery procedure
- [ ] Enable audit logging (if applicable)
- [ ] Configure connection pooling
- [ ] Set up replication (if needed)
- [ ] Monitor query performance

## 3. File System & Storage

- [ ] Create directories for uploads, generated, storage
- [ ] Set proper permissions on directories (755)
- [ ] Configure disk space monitoring
- [ ] Set up cleanup policy for old files
- [ ] Plan for storage scaling
- [ ] Test file upload functionality
- [ ] Verify file download functionality
- [ ] Test virus scanning (if applicable)

## 4. Monitoring & Logging

- [ ] Configure application logging
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure health checks
- [ ] Set up performance monitoring
- [ ] Configure uptime monitoring
- [ ] Set up alerts for errors/anomalies
- [ ] Configure log rotation
- [ ] Test monitoring alerts
- [ ] Review default log retention

## 5. Performance

- [ ] Run load testing
- [ ] Optimize database queries
- [ ] Enable caching where appropriate
- [ ] Configure CDN for static assets
- [ ] Test gzip compression
- [ ] Review web server configuration
- [ ] Optimize image assets
- [ ] Test with production-like data volume

## 6. Infrastructure

- [ ] Ensure sufficient disk space (minimum 50GB recommended)
- [ ] Allocate sufficient RAM (minimum 2GB recommended)
- [ ] Configure backup storage
- [ ] Set up automated restart on failure
- [ ] Test failover procedures (if applicable)
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up SSL certificate management
- [ ] Enable firewall rules
- [ ] Document infrastructure setup

## 7. Deployment Process

- [ ] Document deployment steps
- [ ] Create rollback procedure
- [ ] Set up deployment automation (if desired)
- [ ] Test zero-downtime deployment (if applicable)
- [ ] Prepare deployment communication
- [ ] Schedule maintenance window
- [ ] Notify stakeholders of deployment
- [ ] Create incident response plan

## 8. Testing

- [ ] Run all automated tests: `npm run test`
- [ ] Perform smoke tests in production environment
- [ ] Test all user workflows
- [ ] Test file upload with large files
- [ ] Test report generation
- [ ] Test authentication/authorization
- [ ] Test error handling
- [ ] Verify browser compatibility
- [ ] Mobile testing (if applicable)

## 9. Documentation

- [ ] Update API documentation
- [ ] Document environment variables
- [ ] Create user guide
- [ ] Document troubleshooting procedures
- [ ] Document backup/restore procedures
- [ ] Create disaster recovery plan
- [ ] Document security procedures
- [ ] Create runbook for common issues

## 10. Post-Deployment

- [ ] Monitor error rates and logs
- [ ] Verify all features working correctly
- [ ] Test user sign-ups and login
- [ ] Verify file uploads working
- [ ] Verify report generation working
- [ ] Check database performance
- [ ] Verify backup scheduled and running
- [ ] Review logs for any warnings
- [ ] Get user feedback
- [ ] Document any issues/learnings

## Environment Variables

Ensure all of these are configured:

```
PORT=4000
NODE_ENV=production
JWT_SECRET=<random-secure-string>
WEB_ORIGIN=https://yourdomain.com
STORAGE_DRIVER=memory
LOG_LEVEL=info
CORS_CREDENTIALS=true
SESSION_TIMEOUT=28800
UPLOAD_SIZE_LIMIT=52428800
```

Optional PostgreSQL:
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Deployment Commands

**Docker Deployment:**
```bash
docker build -t fre:latest .
docker-compose up -d
```

**Manual Deployment:**
```bash
npm ci
npm run test
npm run build
npm start
```

## Monitoring Commands

```bash
# Check health
curl http://localhost:4000/health

# View logs (Docker)
docker-compose logs -f api

# Check memory usage
docker stats fre-api

# View disk usage
df -h apps/api/uploads
df -h apps/api/storage
df -h apps/api/generated
```

## Rollback Commands

```bash
# Docker rollback
docker-compose down
docker image rm fre:latest
# Restore from backup
tar -xzf backup-storage-*.tar.gz
docker-compose up -d
```

## Support Contacts

- DevOps: [contact info]
- Database Admin: [contact info]
- Application Owner: [contact info]

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Verified By:** _______________
**Rollback Plan Reviewed:** _______________
