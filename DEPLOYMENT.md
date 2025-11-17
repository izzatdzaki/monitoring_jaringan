# 🚀 Deployment Guide

Panduan lengkap untuk deploy aplikasi monitoring ke production.

---

## Deployment Options

1. [Vercel (Recommended)](#vercel-recommended)
2. [Docker](#docker)
3. [PM2 (Standalone)](#pm2-standalone)
4. [Nginx + PM2](#nginx--pm2)

---

## Vercel (Recommended)

Vercel adalah platform terbaik untuk Next.js.

### 1. Create Vercel Account

- Buka https://vercel.com
- Sign up dengan GitHub/GitLab/Bitbucket

### 2. Connect Repository

```bash
# Pastikan project sudah di Git
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Import ke Vercel

1. Login ke Vercel
2. Click **New Project**
3. Select repository
4. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Environment Variables**: 
     - `MT_HOST` = `192.168.88.1`
     - `MT_USER` = `monitoring`
     - `MT_PASS` = `secret_password`
     - `MT_PORT` = `8728`
5. Click **Deploy**

### 4. Auto-Deploy

Setiap push ke `main` branch akan automatic deploy.

---

## Docker

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Save as: `Dockerfile`

### 2. Create .dockerignore

```
node_modules
.next
.git
.gitignore
README.md
.env.local
```

### 3. Build & Run

```bash
# Build image
docker build -t monitoring-mikrotik .

# Run container
docker run -p 3000:3000 \
  -e MT_HOST=192.168.88.1 \
  -e MT_USER=monitoring \
  -e MT_PASS=123456 \
  -e MT_PORT=8728 \
  monitoring-mikrotik
```

### 4. Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MT_HOST=192.168.88.1
      - MT_USER=monitoring
      - MT_PASS=123456
      - MT_PORT=8728
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

---

## PM2 (Standalone)

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Build Aplikasi

```bash
npm run build
```

### 3. Create PM2 Config

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'monitoring-mikrotik',
      script: 'npm',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        MT_HOST: '192.168.88.1',
        MT_USER: 'monitoring',
        MT_PASS: '123456',
        MT_PORT: '8728'
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', '.next', 'logs'],
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
};
```

### 4. Start dengan PM2

```bash
# Start
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs monitoring-mikrotik

# Restart
pm2 restart monitoring-mikrotik

# Stop
pm2 stop monitoring-mikrotik

# Delete
pm2 delete monitoring-mikrotik
```

### 5. Setup Auto-Startup

```bash
# Generate startup script
pm2 startup

# Save current PM2 processes
pm2 save

# List saved processes
pm2 dump
```

---

## Nginx + PM2

Production setup dengan Nginx sebagai reverse proxy.

### 1. Install Nginx

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nginx

# CentOS
sudo yum install nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/monitoring`:

```nginx
upstream nextjs_app {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name monitoring.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name monitoring.example.com;

    # SSL Certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/monitoring.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monitoring.example.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # Proxy settings
    location / {
        proxy_pass http://nextjs_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certbot -d monitoring.example.com
```

### 5. Run with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Monitoring & Maintenance

### 1. Monitor Application

```bash
# Check logs
pm2 logs monitoring-mikrotik

# Monitor resources
pm2 monit

# Check uptime
pm2 show monitoring-mikrotik
```

### 2. Auto-Restart on Error

Already configured dalam `ecosystem.config.js`:
```javascript
autorestart: true,
max_restarts: 10,
min_uptime: '10s'
```

### 3. Log Rotation

Install `pm2-logrotate`:
```bash
pm2 install pm2-logrotate
```

### 4. Health Check

```bash
# Check if app is running
curl http://localhost:3000

# Check API endpoint
curl http://localhost:3000/api/mikrotik/interfaces
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] `.env.local` file is NOT in Git
- [ ] Mikrotik API accessible from server
- [ ] Build tested locally: `npm run build`
- [ ] No console errors: `npm run lint`
- [ ] SSL certificate installed (for HTTPS)
- [ ] Nginx reverse proxy configured
- [ ] PM2 auto-startup enabled
- [ ] Logs location configured
- [ ] Backup strategy defined
- [ ] Monitoring/alerting setup

---

## Backup Strategy

```bash
# Backup daily
0 2 * * * tar -czf /backups/monitoring-$(date +\%Y\%m\%d).tar.gz /app

# Keep last 30 days
find /backups -name "monitoring-*.tar.gz" -mtime +30 -delete
```

---

## Troubleshooting

### App won't start

```bash
pm2 logs monitoring-mikrotik
# Check error messages

# Restart
pm2 restart monitoring-mikrotik
```

### High memory usage

```javascript
// In ecosystem.config.js
max_memory_restart: '300M'  // Reduce if needed
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

**Next Steps:**
1. Choose deployment option
2. Follow setup steps
3. Test thoroughly
4. Monitor production
5. Setup alerts/notifications

