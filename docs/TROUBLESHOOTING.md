# 🔧 Troubleshooting Guide

Panduan lengkap untuk mengatasi masalah common di sistem monitoring.

---

## 🚨 Quick Diagnosis

### Symptom: "Server tidak bisa connect ke Mikrotik"

**Diagnosis:**
```
1. Test: curl http://192.168.88.1:8728/rest/interface
2. Check: Firewall Mikrotik allow port 8728?
3. Check: API service enabled di Mikrotik?
4. Check: .env credentials correct?
```

**Solution:**
```bash
# Di Mikrotik Winbox/SSH:
/ip service
set api port=8728
set api-ssl port=8729

# Check API running:
/ip service print

# Test dari laptop:
curl --user admin:password http://192.168.88.1:8728/rest/interface
```

### Symptom: "Device list kosong / 0 devices found"

**Diagnosis:**
```
1. API working? (/api/devices return data?)
2. ARP table di Mikrotik ada entry?
3. Device punya IP static?
4. Device connected ke network?
```

**Solution:**
```
# Di Mikrotik:
/ip arp print   # Lihat berapa entry ARP?

# Kalau kosong:
- Ping dari Mikrotik ke device: ping 192.168.1.100
- Repeat untuk beberapa device
- Check cable/port switch

# Di UI:
- Buka F12 → Network → Check /api/devices response
- Copy response dan lihat struktur data
```

### Symptom: "Application data tidak muncul (semuanya 0)"

**Diagnosis:**
```
1. Layer7 DPI sudah di-setup?
2. Firewall rules sudah dibuat?
3. Traffic terdeteksi?
```

**Solution:**
```
# Di Mikrotik (setup Layer7):
/ip firewall layer7-protocol
print   # Lihat ada berapa protocol?

# Kalau kosong, add dulu:
add name=facebook protocol=".*facebook\.com.*"
add name=youtube protocol=".*youtube\.com.*"

# Verify:
/ip firewall mangle
print   # Lihat mangle rules?

# Kalau kosong, add ditto:
add chain=forward action=mark-connection \
    new-connection-mark=facebook-conn \
    protocol=tcp layer7-protocol=facebook
```

### Symptom: "Admin panel tidak bisa login"

**Diagnosis:**
```
1. Password di .env correct?
2. Submit button bekerja?
3. Browser console ada error?
```

**Solution:**
```
# Check .env.local:
cat .env.local | grep ADMIN_PASSWORD

# Test API:
curl "http://localhost:3000/api/admin/access-logs?adminPassword=admin123&action=stats"

# If 401: Password salah
# If 500: Server error (lihat logs)

# Reset password:
1. Edit .env.local
2. Change ADMIN_PASSWORD value
3. npm run dev (restart)
```

---

## 📊 Dashboard Issues

### Chart tidak muncul / kosong

**Cause:** API tidak return data, atau data format salah

**Fix:**
```
1. Check browser console (F12 → Console)
2. Look for error message
3. Test API directly:
   curl http://localhost:3000/api/mikrotik/traffic/ether1
4. Should return: {"interface": "ether1", "rx": 1000, "tx": 2000, ...}
```

### Chart tidak update / stuck

**Cause:** Polling berhenti, atau error dalam fetch

**Fix:**
```javascript
// Manual test di console:
fetch('/api/mikrotik/traffic/ether1')
  .then(r => r.json())
  .then(d => console.log(d))

// If error: check Mikrotik connection
// If works: refresh page
```

### Interface dropdown tidak bisa di-select

**Cause:** JavaScript error, atau interface list kosong

**Fix:**
```
1. Refresh page
2. Check /api/mikrotik/interfaces response
3. Should return: {"interfaces": ["ether1", "ether2", ...]}
4. If empty: Mikrotik API not working
```

---

## 📱 Device Monitoring Issues

### Device list menunjukkan "0 devices"

**Solution:**
```
Step 1: Verify ARP table di Mikrotik
  ssh admin@192.168.88.1
  /ip arp print

Step 2: Jika empty, trigger ARP discovery
  # Ping dari Mikrotik ke range clients:
  ping 192.168.1.100
  ping 192.168.1.101
  ping 192.168.1.102
  
Step 3: Tunggu 10 detik, lihat /ip arp print lagi

Step 4: Verify UI dapat data:
  curl http://localhost:3000/api/devices?action=devices
```

### Device status selalu offline

**Cause:** ARP table tidak update, atau device ARP entry aging

**Fix:**
```
# Di Mikrotik:
/ip arp
set [find] comment="permanent" dynamic=no

# Atau setup ARP discovery:
/ip neighbor discovery
set enabled=yes

# Check aging time:
/ip arp settings
print   # lihat aging time (default: 30 min)

# Reduce jika perlu lebih update:
set timeout=10m
```

### Specific device tidak muncul di list

**Cause:** Device tidak have ARP entry (belum pernah communicate)

**Fix:**
```
# From Mikrotik, ping device:
ping 192.168.1.105

# From device, ping Mikrotik:
ping 192.168.88.1

# Check ARP:
/ip arp print numbers   # lihat masuk?

# Assign static ARP:
/ip arp
add address=192.168.1.105 mac-address=00:11:22:33:44:05
```

### Device traffic showing "0 Mbps"

**Cause:** Queue tidak exist, atau interface wrong

**Fix:**
```
# Verify queue exists di Mikrotik:
/queue simple
print

# If not exist, create:
add name="PC-Client" target=192.168.1.100/32 \
    dst-address=0.0.0.0/0

# Check interface mapping:
# ether4 should be switch port
# Verify cables connected
```

---

## 🔐 Admin Panel Issues

### Access logs tidak populate

**Cause:** Middleware tidak active, atau IP extraction salah

**Fix:**
```
1. Check middleware.ts exists
   ls src/middleware.ts

2. Verify middleware runs:
   - Do: Open page in browser
   - Check: /api/admin/access-logs return any data?

3. Test IP extraction:
   curl -H "X-Forwarded-For: 192.168.1.100" \
        http://localhost:3000/admin

4. Check server logs untuk IP yang di-extract
```

### Filter logs tidak bekerja

**Cause:** Query parameter format salah, atau API error

**Fix:**
```
# Correct format:
http://localhost:3000/api/admin/access-logs?adminPassword=admin123&ip=192.168.1.100&limit=50

# Test each:
curl "http://localhost:3000/api/admin/access-logs?adminPassword=admin123&action=stats"
curl "http://localhost:3000/api/admin/access-logs?adminPassword=admin123&action=unique-ips"
curl "http://localhost:3000/api/admin/access-logs?adminPassword=admin123&ip=192.168.1.100"
```

### Statistics showing incorrect numbers

**Cause:** In-memory logs cleared, atau multiple server instances

**Fix:**
```
# Make sure only 1 server running:
# Check: only npm run dev atau PORT=3000 npm start

# If restarted: logs reset (in-memory)
# Solution: Wait 5-10 minutes for logs to populate

# For persistent logs: use database (see docs)
```

---

## 🌐 Network & API Issues

### "Connection refused" error

**Cause:** Server not running, atau wrong port

**Fix:**
```bash
# Check if running:
netstat -an | findstr "3000"  # Windows
lsof -i :3000                  # Mac/Linux

# If not running:
cd c:\laragon\www\monitoring_jaringan
npm run dev

# Or specific port:
PORT=3000 npm start

# Verify:
curl http://localhost:3000/
# Should return HTML page
```

### "Port already in use" error

**Cause:** Previous process masih jalan

**Fix:**
```bash
# Find process on port 3000:
netstat -ano | findstr ":3000"
# Note the PID (last column)

# Kill process:
taskkill /PID 1234 /F   # replace 1234 with PID

# Or use different port:
PORT=3006 npm run dev
```

### API response 500 error

**Cause:** Server error, exception not caught

**Fix:**
```
1. Check server logs (terminal)
2. Look for error stack trace
3. Common causes:
   - Mikrotik API error
   - TypeScript compilation error
   - Missing .env variable
   
4. Fix and restart: npm run dev
```

### API response 400 (Bad Request)

**Cause:** Missing atau invalid query parameter

**Fix:**
```
# Check required params:
GET /api/mikrotik/traffic/[iface]   # need iface param
GET /api/devices?action=device-detail&ip=X.X.X.X  # need ip

# Verify format:
- IP: 192.168.1.100 (not 192.168.1.100/32)
- Interface: ether1 (not Ether1)
- Action: devices (not "get-devices")
```

---

## 💻 Performance Issues

### Page loading slow / lag

**Cause:** Too many devices, large dataset, slow query

**Fix:**
```
# Add pagination:
/api/devices?limit=10&offset=0

# Reduce polling:
// Change interval from 1s to 3s
setInterval(refetch, 3000);

# Optimize query:
- Cache device list (5 min TTL)
- Only fetch changed fields
- Use index untuk query
```

### Chart animation stuttering

**Cause:** Chart.js animation expensive

**Fix:**
```javascript
// In TrafficChart.tsx:
const options = {
  animation: false,  // Already disabled
  responsive: true,
  maintainAspectRatio: false
};

// If still slow, reduce data points:
const maxPoints = 20;  // was 30
```

### Memory usage growing

**Cause:** Access logs not cleared, memory leak

**Fix:**
```
# Check in-memory storage:
ip-tracker.ts: maximum 1000 logs

# If exceeding:
1. Logs auto-drop oldest entries
2. Or manually: /admin → clear logs

# For production: use database
```

---

## 🔍 Mikrotik-Specific Issues

### Can't connect to Mikrotik API

**Checklist:**
```
□ API service enabled?         → /ip service print
□ Port correct (8728)?          → /ip service set api port=8728
□ Firewall allows 8728?         → /ip firewall filter print
□ Username/password correct?    → /user print
□ IP accessible?                → Try: ping 192.168.88.1
□ SSL issues?                   → /ip service set api-ssl disabled=yes
```

**Test Command:**
```bash
curl --user admin:password \
  --insecure \
  http://192.168.88.1:8728/rest/interface/print
```

### Traffic data always 0

**Checklist:**
```
□ Interface exist?              → /interface print
□ Interface active?             → Check running column
□ ARP entry exist?              → /ip arp print
□ Device generate traffic?      → Ping or download from device
□ Queue rule exist?             → /queue simple print
```

### Layer7 DPI not working

**Checklist:**
```
□ Protocol added?               → /ip firewall layer7-protocol print
□ Mangle rule created?          → /ip firewall mangle print
□ Chain correct (forward)?      → Check chain column
□ Traffic matching?             → Use test device to browse
□ Check stats:                  → /ip firewall mangle print stats
```

**Test Traffic:**
```
1. Device: Open Facebook.com
2. Mikrotik: /ip firewall mangle print stats
3. Check: bytes column increasing?
4. If yes: DPI working
5. If no: Protocol pattern wrong
```

---

## 🐛 Browser Console Errors

### "Failed to fetch" error

```
Cause: CORS issue, atau server down
Fix: 
  1. Check Network tab (F12 → Network)
  2. Look at failed request
  3. Check server logs
  4. Verify API endpoint path
```

### "Cannot read property 'map' of undefined"

```
Cause: API return null instead of array
Fix:
  1. Add null check: data?.map || []
  2. Verify API response format
  3. Test: curl /api/devices
```

### "ChartJS is not defined"

```
Cause: Chart.js library not loaded
Fix:
  1. Check: npm list react-chartjs-2
  2. Reinstall: npm install react-chartjs-2 chart.js
  3. Restart: npm run dev
```

---

## 📋 Verification Checklist

### Before Deployment

- [ ] All pages load without error
- [ ] Dashboard chart updates every 1 second
- [ ] Device list shows all connected devices
- [ ] Device detail page loads and shows apps
- [ ] Admin panel login works
- [ ] Access logs populate (wait 1 min)
- [ ] Filtering works correctly
- [ ] API endpoints return proper format
- [ ] No console errors in F12
- [ ] Build succeeds: `npm run build`

### Daily Health Check

- [ ] Dashboard RX/TX normal?
- [ ] All devices online?
- [ ] No API errors?
- [ ] Access logs updating?
- [ ] Bandwidth usage reasonable?
- [ ] No performance issues?

### Weekly Maintenance

- [ ] Check for unusual access patterns
- [ ] Review device list for new additions
- [ ] Verify Layer7 DPI statistics
- [ ] Export logs for backup
- [ ] Check disk usage
- [ ] Review error logs

---

## 📞 Getting Help

### Collect Information

When reporting issue, provide:
```
1. Browser: Chrome/Firefox/Safari + version
2. OS: Windows 10/11, Mac, Linux
3. Steps to reproduce
4. Screenshot of error
5. Browser console (F12) output
6. Server logs output
7. Network tab (F12) request/response
8. .env configuration (passwords hidden)
```

### Check These Resources

1. Check [README.md](README.md) - Overview
2. Check [API.md](API.md) - API details
3. Check [ADMIN_PANEL.md](ADMIN_PANEL.md) - Admin features
4. Check [DEVICE_MONITORING.md](DEVICE_MONITORING.md) - Device features
5. Check logs in terminal: `npm run dev`

### Common Fixes (Try First)

```
99% solution:
1. npm run dev restart
2. Browser hard refresh (Ctrl+Shift+R)
3. .env.local check
4. Mikrotik reboot
5. Router power cycle
```

---

**Version:** 1.0.0  
**Last Updated:** 17 November 2024  
**Status:** Production Ready
