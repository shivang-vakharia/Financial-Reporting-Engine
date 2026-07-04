# Quick Start Deployment Guide

Get your Financial Reporting Engine running in production in minutes.

## 🚀 5-Minute Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose installed
- 2GB RAM minimum
- 10GB disk space

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivang-vakharia/Financial-Reporting-Engine.git
   cd Financial-Reporting-Engine
   ```

2. **Create environment file**
   ```bash
   cp .env.production .env
   ```

3. **Update environment variables**
   ```bash
   # Edit .env with your values
   vi .env
   
   # Minimum changes needed:
   # - JWT_SECRET: Generate with: openssl rand -base64 32
   # - WEB_ORIGIN: Set to your production domain
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Verify it's running**
   ```bash
   curl http://localhost:4000/health
   # Expected response: {"ok":true,"service":"financial-reporting-engine-api"}
   ```

6. **Access the application**
   ```
   Open in browser: http://localhost:4000
   ```

✅ Done! Your application is running.

---

## 🖥️ Manual Deployment (VPS/Cloud)

### Prerequisites
- Node.js 18+ installed
- npm 9+ installed
- Linux/Mac/Windows with terminal access

### Steps

1. **Setup**
   ```bash
   git clone https://github.com/shivang-vakharia/Financial-Reporting-Engine.git
   cd Financial-Reporting-Engine
   npm ci
   ```

2. **Configure**
   ```bash
   cp .env.production .env
   vi .env  # Edit with your values
   ```

3. **Build**
   ```bash
   npm run build
   npm run test
   npm run validate-env
   ```

4. **Create directories**
   ```bash
   mkdir -p apps/api/{uploads,generated,storage}
   chmod 755 apps/api/{uploads,generated,storage}
   ```

5. **Start with PM2 (recommended)**
   ```bash
   npm install -g pm2
   npm start  # Or: pm2 start "npm start" --name fre
   pm2 save
   pm2 startup
   ```

6. **Verify**
   ```bash
   curl http://localhost:4000/health
   ```

---

## 📋 Environment Variables

**Required:**
- `JWT_SECRET` - Secure random string (min 32 chars)
- `WEB_ORIGIN` - Your production domain
- `NODE_ENV` - Set to "production"

**Optional:**
- `DATABASE_URL` - PostgreSQL connection string (for production database)
- `STORAGE_DRIVER` - "memory" (default) or "postgresql"
- `PORT` - Default: 4000

**Example:**
```
JWT_SECRET=your-secure-random-string-here
WEB_ORIGIN=https://reporting.example.com
NODE_ENV=production
PORT=4000
STORAGE_DRIVER=memory
LOG_LEVEL=info
```

---

## 🔐 Security Best Practices

1. **Generate Strong JWT Secret**
   ```bash
   openssl rand -base64 32
   ```

2. **Use HTTPS**
   - Configure reverse proxy (nginx/Apache) with SSL
   - Redirect HTTP to HTTPS

3. **Set Strong Database Password**
   ```bash
   openssl rand -base64 24
   ```

4. **Update CORS Origin**
   - Set `WEB_ORIGIN` to your actual domain
   - Never use wildcards or localhost in production

5. **Backup Strategy**
   ```bash
   # Backup storage daily
   tar -czf backup-$(date +%Y%m%d).tar.gz apps/api/storage/
   ```

---

## 📊 Monitoring

### Health Check
```bash
# Check if API is running
curl http://localhost:4000/health
```

### Docker Logs
```bash
# View application logs
docker-compose logs -f api

# Check CPU/Memory usage
docker stats fre-api
```

### Disk Space
```bash
# Monitor storage usage
df -h apps/api/uploads
df -h apps/api/generated
du -sh apps/api/storage/
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 4000
lsof -i :4000

# Kill the process (if needed)
kill -9 <PID>
```

### High Memory Usage
```bash
# Restart the application
docker-compose restart api
# Or: pm2 restart fre
```

### Storage Full
```bash
# Check disk usage
df -h /

# Clean old files if needed
# Only safe to delete in apps/api/generated/ older than X days
```

### Database Connection Error
```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

---

## 📚 Additional Resources

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Deployment Checklist**: See `DEPLOYMENT-CHECKLIST.md`
- **API Documentation**: See `README.md`

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs api`
2. Verify environment: `npm run validate-env`
3. Review checklist: `DEPLOYMENT-CHECKLIST.md`
4. Create GitHub issue with error details

---

## 📈 Next Steps After Deployment

- [ ] Configure monitoring and alerts
- [ ] Set up automated backups
- [ ] Enable HTTPS/SSL
- [ ] Configure DNS
- [ ] Test user workflows
- [ ] Set up log aggregation
- [ ] Document your setup
- [ ] Train team on operations

---

**Last Updated**: 2024
**Version**: 1.0.0
