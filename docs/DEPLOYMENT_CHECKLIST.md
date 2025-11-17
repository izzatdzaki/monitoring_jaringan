# ✅ Deployment Checklist

Comprehensive checklist untuk memastikan sistem siap production dan berjalan optimal.

---

## 🎯 Pre-Deployment Checklist (Before Going Live)

### ✅ Code & Build

- [ ] All TypeScript files compile without errors
  ```bash
  npm run build
  ```
  
- [ ] No console errors in development
  ```bash
  npm run dev    # Check browser console F12
  ```

- [ ] ESLint passes
  ```bash
  npm run lint
  ```

- [ ] Production build succeeds
  ```bash
  npm run build   # Should show "✓ Compiled successfully"
  ```

- [ ] All pages accessible
  - [ ] / (home)
  - [ ] /dashboard
  - [ ] /devices
  - [ ] /devices/[IP]
  - [ ] /admin

- [ ] All APIs respond correctly
  - [ ] GET /api/mikrotik/traffic/ether1
  - [ ] GET /api/mikrotik/interfaces
  - [ ] GET /api/devices
  - [ ] GET /api/admin/access-logs

---

### ✅ Environment Configuration

- [ ] `.env.local` is properly configured
  ```env
  MT_HOST=192.168.88.1       # ✓ Real Mikrotik IP
  MT_USER=monitoring          # ✓ Created in Mikrotik
  MT_PASS=123456              # ✓ Secure password
  MT_PORT=8728                # ✓ API port enabled
  ADMIN_PASSWORD=admin123     # ✓ Admin password set
  ```

- [ ] `.env.local` is NOT committed to git
  - [ ] Check `.gitignore` includes `.env.local`
  - [ ] Verify: `git status` doesn't show `.env.local`

- [ ] All environment variables have values
  - [ ] No empty variables
  - [ ] No placeholder values (like "YOUR_PASSWORD")

- [ ] Sensitive data is not in code
  - [ ] No passwords in source files
  - [ ] No API keys in comments
  - [ ] No credentials in git history

---

### ✅ Mikrotik Configuration

- [ ] Mikrotik API is enabled
  ```
  /ip service
  set api disabled=no port=8728
  print   # Verify: api should show "disabled=no"
  ```

- [ ] API user created with permissions
  ```
  /user print   # Verify: "monitoring" user exists
  /user group print   # Verify: group with API permission exists
  ```

- [ ] Firewall allows API port
  ```
  /ip firewall filter
  print   # Rule allowing port 8728 should exist
  ```

- [ ] Network connectivity verified
  - [ ] Can ping Mikrotik from server: `ping 192.168.88.1`
  - [ ] Can SSH to Mikrotik: `ssh admin@192.168.88.1`
  - [ ] Can curl API: `curl http://192.168.88.1:8728/rest/interface`

- [ ] Interfaces are properly named
  ```
  /interface print   # Verify all interfaces exist
  ```

- [ ] ARP is enabled for device discovery
  ```
  /ip arp
  print   # Should show connected devices
  ```

- [ ] Layer7 DPI is setup (if using app tracking)
  ```
  /ip firewall layer7-protocol print   # Should show protocols
  /ip firewall mangle print            # Should show rules
  ```

---

### ✅ Security

- [ ] HTTPS is configured (production)
  - [ ] SSL certificate installed
  - [ ] Redirect HTTP to HTTPS
  - [ ] No mixed content warnings

- [ ] Admin password is strong
  - [ ] At least 12 characters
  - [ ] Mix of letters, numbers, symbols
  - [ ] Not dictionary words
  - [ ] Not shared/written down

- [ ] Database credentials are secure (if using DB)
  - [ ] Not in code
  - [ ] Not in logs
  - [ ] Encrypted connection

- [ ] API endpoints are protected
  - [ ] Authentication required
  - [ ] Rate limiting enabled (if applicable)
  - [ ] CORS configured properly

- [ ] Logs don't expose sensitive data
  - [ ] No passwords in logs
  - [ ] No API keys in logs
  - [ ] No PII in logs

---

### ✅ Performance & Resources

- [ ] Production build is optimized
  ```bash
  npm run build
  # Check: .next folder size reasonable (~50MB)
  ```

- [ ] Memory usage is acceptable
  - [ ] Development: < 200MB
  - [ ] Production: < 500MB
  - [ ] No memory leaks after 24h

- [ ] CPU usage is acceptable
  - [ ] Idle: < 5%
  - [ ] Under load: < 50%

- [ ] Disk space is sufficient
  - [ ] `/next` folder: ~50MB
  - [ ] Logs directory: ~100MB available
  - [ ] Database (if used): ~500MB available

- [ ] Network bandwidth is adequate
  - [ ] API polling: ~100KB/min
  - [ ] Chart updates: smooth
  - [ ] No timeout errors

---

### ✅ Monitoring & Logging

- [ ] Logging is configured
  - [ ] Errors are logged
  - [ ] Access is logged
  - [ ] Performance is monitored

- [ ] Error tracking is setup
  - [ ] Error notifications enabled
  - [ ] Error logs are stored
  - [ ] Stack traces are captured

- [ ] Uptime monitoring is configured
  - [ ] Health check endpoint exists
  - [ ] Monitoring tool configured
  - [ ] Alerts are setup

- [ ] Performance monitoring is enabled
  - [ ] Response times tracked
  - [ ] API latency monitored
  - [ ] Resource usage tracked

---

### ✅ Backup & Disaster Recovery

- [ ] Backups are scheduled
  - [ ] Daily backups enabled
  - [ ] Backup location verified
  - [ ] Restore tested

- [ ] Database backups (if applicable)
  - [ ] Automated backups
  - [ ] Backup retention policy
  - [ ] Restore plan documented

- [ ] Configuration backups
  - [ ] `.env` backed up securely
  - [ ] Mikrotik config backed up
  - [ ] Recovery procedure documented

---

## 🚀 Deployment Steps

### Step 1: Prepare Server

```bash
# 1. SSH to server
ssh user@production-server

# 2. Navigate to project directory
cd /var/www/monitoring

# 3. Clone or pull latest code
git clone https://github.com/yourrepo/monitoring.git
# or
git pull origin master

# 4. Install dependencies
npm install --production

# 5. Build application
npm run build

# 6. Verify build
ls -la .next/   # Should show files
```

### Step 2: Configure Environment

```bash
# 1. Create .env.local
nano .env.local

# 2. Add production values
cat > .env.local << EOF
MT_HOST=192.168.88.1
MT_USER=monitoring
MT_PASS=your_secure_password
MT_PORT=8728
ADMIN_PASSWORD=your_admin_password
NODE_ENV=production
EOF

# 3. Secure permissions
chmod 600 .env.local

# 4. Verify
cat .env.local   # Check values
```

### Step 3: Setup Process Manager

**Option A: PM2 (Recommended)**

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'monitoring',
    script: '.next/standalone/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# 3. Start with PM2
pm2 start ecosystem.config.js

# 4. Setup auto-restart on reboot
pm2 startup
pm2 save

# 5. Check status
pm2 status
pm2 logs
```

**Option B: Systemd (Linux)**

```bash
# 1. Create service file
sudo nano /etc/systemd/system/monitoring.service

# Content:
[Unit]
Description=Monitoring Jaringan
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/monitoring
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=append:/var/log/monitoring/out.log
StandardError=append:/var/log/monitoring/error.log
Environment="PORT=3000"
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target

# 2. Enable service
sudo systemctl enable monitoring.service

# 3. Start service
sudo systemctl start monitoring.service

# 4. Check status
sudo systemctl status monitoring.service
```

### Step 4: Setup Reverse Proxy

**Option A: Nginx**

```nginx
upstream monitoring {
    server localhost:3000;
}

server {
    listen 80;
    server_name monitoring.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monitoring.example.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/monitoring.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monitoring.example.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json;

    location / {
        proxy_pass http://monitoring;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Option B: Apache**

```apache
<VirtualHost *:80>
    ServerName monitoring.example.com
    Redirect permanent / https://monitoring.example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName monitoring.example.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/monitoring.example.com/cert.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/monitoring.example.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

### Step 5: Setup SSL Certificate

```bash
# Using Let's Encrypt (Certbot)
sudo certbot certonly --webroot -w /var/www/html \
    -d monitoring.example.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify
sudo certbot certificates
```

### Step 6: Verify Deployment

```bash
# 1. Check if running
ps aux | grep "node\|npm" | grep -v grep

# 2. Test endpoint
curl http://localhost:3000/
curl https://monitoring.example.com/

# 3. Check logs
pm2 logs                    # If using PM2
tail -f /var/log/syslog     # If using systemd

# 4. Monitor resources
top                         # CPU/Memory
df -h                       # Disk space
netstat -an | grep 3000     # Port status

# 5. Test API
curl https://monitoring.example.com/api/mikrotik/interfaces
```

---

## 📊 Post-Deployment Verification

### ✅ Functionality Tests

- [ ] **Homepage loads**
  - [ ] No 404 errors
  - [ ] Page renders correctly
  - [ ] All links work

- [ ] **Dashboard works**
  - [ ] Chart displays
  - [ ] Updates every 1 second
  - [ ] Interface selector works
  - [ ] Statistics show

- [ ] **Device list works**
  - [ ] Devices display
  - [ ] Filter works
  - [ ] Real-time updates
  - [ ] Device links work

- [ ] **Device detail works**
  - [ ] Device info displays
  - [ ] Applications show
  - [ ] Real-time speeds update
  - [ ] Go back works

- [ ] **Admin panel works**
  - [ ] Login page shows
  - [ ] Password authentication works
  - [ ] Logs display
  - [ ] Filtering works
  - [ ] Statistics accurate

- [ ] **APIs respond correctly**
  - [ ] Traffic endpoint returns data
  - [ ] Interfaces endpoint returns list
  - [ ] Devices endpoint returns devices
  - [ ] Admin logs endpoint requires auth

### ✅ Performance Tests

- [ ] **Page load time < 2 seconds**
  - [ ] Home: Measure with DevTools
  - [ ] Dashboard: Measure with DevTools
  - [ ] Check Network tab for bottlenecks

- [ ] **API response time < 500ms**
  - [ ] Traffic endpoint
  - [ ] Interfaces endpoint
  - [ ] Devices endpoint

- [ ] **Memory usage stable**
  - [ ] After 1 hour: same as initial
  - [ ] After 24 hours: no growth
  - [ ] Check: `ps aux | grep node`

- [ ] **CPU usage reasonable**
  - [ ] Idle: < 5%
  - [ ] Under load: < 30%
  - [ ] Check: `top`

### ✅ Security Tests

- [ ] **HTTPS working**
  - [ ] No mixed content warnings
  - [ ] Certificate valid
  - [ ] Redirect HTTP to HTTPS

- [ ] **Authentication working**
  - [ ] Can't access admin without password
  - [ ] Invalid password rejected
  - [ ] Valid password accepted

- [ ] **No sensitive data exposed**
  - [ ] DevTools: No passwords in requests
  - [ ] DevTools: No API keys visible
  - [ ] Logs: No credentials shown

- [ ] **CORS properly configured**
  - [ ] Cross-origin requests handled
  - [ ] Unnecessary CORS not allowed

### ✅ Monitoring Tests

- [ ] **Logs are being created**
  - [ ] Check log directory
  - [ ] Verify recent entries
  - [ ] Rotation working

- [ ] **Error tracking working**
  - [ ] Errors are logged
  - [ ] Can access error logs
  - [ ] Stack traces present

- [ ] **Health checks working**
  - [ ] Health endpoint responds
  - [ ] Monitoring tool sees status
  - [ ] Alerts configured

---

## 📈 Performance Baseline

Record these values for comparison:

| Metric | Value | Threshold |
|--------|-------|-----------|
| Page Load Time | _____ ms | < 2000 ms |
| API Response | _____ ms | < 500 ms |
| Memory Usage | _____ MB | < 500 MB |
| CPU Usage | _____ % | < 30 % |
| Uptime | _____ % | > 99.9 % |

---

## 🔄 Maintenance Schedule

### Daily
- [ ] Check uptime status
- [ ] Monitor error logs
- [ ] Verify disk space

### Weekly
- [ ] Review access logs
- [ ] Check performance metrics
- [ ] Update dependencies (if needed)

### Monthly
- [ ] Performance analysis
- [ ] Security audit
- [ ] Database maintenance
- [ ] Backup verification

### Quarterly
- [ ] Major version updates
- [ ] Security patches
- [ ] Disaster recovery test

---

## 🆘 Troubleshooting

### Application won't start

```bash
# 1. Check logs
pm2 logs                    # If PM2
journalctl -u monitoring    # If systemd

# 2. Verify .env.local
cat .env.local

# 3. Test build
npm run build

# 4. Clear cache
rm -rf .next

# 5. Reinstall
npm install --production
```

### High memory usage

```bash
# 1. Check process
ps aux | grep node

# 2. Check for leaks
# Look for growing memory over time

# 3. Solutions:
# - Restart application
# - Add memory limit
# - Profile with --inspect flag
```

### API not responding

```bash
# 1. Check Mikrotik connectivity
ping 192.168.88.1

# 2. Verify API enabled
# Check in Mikrotik: /ip service print

# 3. Check credentials in .env.local

# 4. Test directly
curl -u username:password http://192.168.88.1:8728/rest/interface
```

### Certificate errors

```bash
# 1. Check expiration
openssl x509 -in /etc/letsencrypt/live/example.com/cert.pem -noout -dates

# 2. Renew certificate
certbot renew

# 3. Reload web server
sudo systemctl reload nginx    # If Nginx
sudo systemctl reload apache2  # If Apache
```

---

## 📋 Rollback Plan

If deployment fails:

### Step 1: Identify Issue
```bash
# Check logs
pm2 logs
tail -f /var/log/syslog

# Check status
pm2 status
systemctl status monitoring
```

### Step 2: Rollback
```bash
# Stop application
pm2 stop monitoring
# or
sudo systemctl stop monitoring

# Go to previous version
git checkout previous-tag
npm install --production
npm run build

# Start again
pm2 start ecosystem.config.js
# or
sudo systemctl start monitoring
```

### Step 3: Verify Rollback
- [ ] Application starts
- [ ] All tests pass
- [ ] Services restored

---

## 📞 Support Contacts

- **Monitoring System Issues**: Check TROUBLESHOOTING.md
- **Mikrotik Issues**: Check MIKROTIK_SETUP.md
- **API Issues**: Check API.md
- **General Issues**: Check README.md

---

## ✅ Final Sign-Off

Before marking deployment complete:

- [ ] All checklist items completed
- [ ] All tests passed
- [ ] Performance baseline recorded
- [ ] Monitoring & alerts active
- [ ] Backup tested & working
- [ ] Rollback plan documented
- [ ] Team trained on operation
- [ ] Documentation updated

---

**Version:** 1.0.0
**Last Updated:** 17 November 2024
**Status:** Ready for Production

🎉 **Deployment Complete!**
