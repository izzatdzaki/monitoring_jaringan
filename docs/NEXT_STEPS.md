# 🎯 Next Steps Guide

Panduan langkah demi langkah untuk mulai menggunakan sistem monitoring Anda.

---

## 🚀 Getting Started (Mulai Sekarang)

### Step 1: Start Development Server

```bash
# Navigate to project
cd c:\laragon\www\monitoring_jaringan

# Start dev server
npm run dev
```

Expected output:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Environments: .env.local
```

### Step 2: Open in Browser

Visit: **http://localhost:3000**

You should see:
- ✅ Homepage with navigation
- ✅ Links to Dashboard, Devices, Admin
- ✅ System is running!

### Step 3: Test Dashboard

```
URL: http://localhost:3000/dashboard
Expected:
- Real-time chart showing RX/TX
- Interface selector dropdown
- Statistics footer
- Updates every 1 second
```

**If chart shows data: ✅ SUCCESS! Mikrotik connected**
**If chart empty: See Troubleshooting below**

---

## ⚙️ Configuration (Setup Real Mikrotik)

### Check Your Mikrotik API

**Via SSH:**
```bash
ssh admin@192.168.88.1

# Inside Mikrotik terminal:
/ip service
print

# Look for "api" - should show:
# name=api port=8728 address=0.0.0.0 disabled=no
```

**Via Winbox:**
1. Open Winbox → Connect to 192.168.88.1
2. Go to: System → Services
3. Find "api" → Should show port 8728, disabled=no

### Verify Credentials

Your Mikrotik user should exist:

```bash
# Via SSH:
/user
print

# Look for user named "monitoring"
# If not exist, create:
/user add name=monitoring password=123456 group=full
```

### Update .env.local

```bash
# Open .env.local
cat c:\laragon\www\monitoring_jaringan\.env.local

# Should show:
MT_HOST=192.168.88.1
MT_USER=monitoring
MT_PASS=123456
MT_PORT=8728
ADMIN_PASSWORD=admin123

# If wrong, edit it:
# Edit the file in VS Code or use:
```

### Test Connection

```bash
# Test from command line:
curl -u monitoring:123456 http://192.168.88.1:8728/rest/interface

# If working: Shows JSON list of interfaces
# If error: Check Mikrotik API setup
```

---

## 📱 Explore Features

### Feature 1: Real-Time Dashboard

**URL:** http://localhost:3000/dashboard

**What to do:**
1. Open page
2. Select different interfaces from dropdown
3. Watch chart update in real-time
4. See statistics at bottom

**What you see:**
- Blue line = Download (RX)
- Red line = Upload (TX)
- Updates every 1 second
- Last 30 seconds of data

---

### Feature 2: Network Devices

**URL:** http://localhost:3000/devices

**What to do:**
1. Open page
2. See all devices connected to network
3. Click device to see details
4. Watch real-time bandwidth updates

**What you see:**
- List of all PCs/devices
- Status (online/offline)
- Current speeds
- Total data used
- MAC addresses
- Filter by interface

---

### Feature 3: Device Detail

**URL:** http://localhost:3000/devices/192.168.1.100

**Replace 192.168.1.100 with actual PC IP**

**What you see:**
- Device information
- Real-time upload/download
- Total data consumption
- **Applications accessed** (requires Layer7 setup)
- Connection status

---

### Feature 4: Admin Panel

**URL:** http://localhost:3000/admin

**Login:**
- Password: `admin123` (from .env.local)

**What you can do:**
1. See all IP addresses that accessed the system
2. See what pages/APIs they accessed
3. Filter by IP, path, or HTTP method
4. View statistics (total access, unique IPs, etc.)
5. Search and analyze logs

**Use case:**
```
"Siapa saja yang akses halaman device?"
→ Filter by path: "/devices"
→ See list of IPs that accessed it
```

---

## 🔧 Layer7 DPI Setup (Optional but Recommended)

### What is Layer7 DPI?

Layer7 DPI allows you to detect **which websites/applications** each PC is accessing:
- Facebook, YouTube, WhatsApp, Instagram usage tracking
- Gaming, Streaming detection
- Per-PC application breakdown

### Setup Steps

**Step 1: SSH to Mikrotik**

```bash
ssh admin@192.168.88.1
```

**Step 2: Create Layer7 Protocols**

Copy and paste into Mikrotik terminal:

```
/ip firewall layer7-protocol
add name=facebook protocol=".*facebook\.com.*"
add name=youtube protocol=".*youtube\.com.*"
add name=whatsapp protocol=".*whatsapp\.com.*"
add name=instagram protocol=".*instagram\.com.*"
add name=tiktok protocol=".*tiktok\.com.*"
add name=telegram protocol=".*telegram\.org.*"
add name=gaming protocol=".*steam\.com.*|.*epicgames\.com.*"
add name=streaming protocol=".*netflix\.com.*"
```

**Step 3: Create Mangle Rules**

```
/ip firewall mangle
add chain=forward action=mark-connection \
    new-connection-mark=facebook \
    protocol=tcp layer7-protocol=facebook

add chain=forward action=mark-connection \
    new-connection-mark=youtube \
    protocol=tcp layer7-protocol=youtube

add chain=forward action=mark-connection \
    new-connection-mark=whatsapp \
    protocol=tcp layer7-protocol=whatsapp

# Repeat for other protocols...
```

**Step 4: Verify**

```bash
# In Mikrotik terminal:
/ip firewall layer7-protocol
print

# Should show all protocols you added

/ip firewall mangle
print

# Should show all mangle rules
```

**Step 5: Test**

1. Have a PC browse Facebook
2. In Mikrotik: `/ip firewall mangle print stats`
3. Check if traffic being marked
4. In UI: Refresh `/devices/[PC-IP]`
5. Should see "Facebook" in applications list

---

## 📊 Daily Operations

### Morning: Check System Health

```bash
# Open Dashboard
http://localhost:3000/dashboard

# Verify:
- RX/TX normal?
- No unusual spikes?
- All devices online?
```

### During Day: Monitor Activity

```bash
# Open Devices
http://localhost:3000/devices

# Check:
- Who's downloading what?
- Unusual bandwidth usage?
- Any offline devices?
```

### Track Specific Device

```bash
# Click device IP
http://localhost:3000/devices/192.168.1.100

# See:
- What they're accessing
- Their bandwidth
- Applications used
```

### Evening: Review Logs

```bash
# Open Admin Panel
http://localhost:3000/admin

# Login with admin password
# Review:
- Who accessed system?
- What did they check?
- Any suspicious activity?
```

---

## 📈 Common Tasks

### Task 1: "Find bandwidth hog (PC paling boros)"

```
1. Go to: /devices
2. Sort by "Total Down" (highest)
3. Top PC is the bandwidth user
4. Click to see what app/website used
```

### Task 2: "Check what PC 1 is accessing"

```
1. Go to: /devices
2. Find PC 1 IP (e.g., 192.168.1.100)
3. Click on it
4. See applications in list
```

### Task 3: "See all access logs from today"

```
1. Go to: /admin
2. Login with admin password
3. Scroll through logs
4. Or filter by date/IP
```

### Task 4: "Real-time monitor interface ether4"

```
1. Go to: /dashboard
2. Select "ether4" from dropdown
3. Watch chart update
4. See live RX/TX
```

### Task 5: "Block specific website (future)"

```
1. Check Layer7 rules setup
2. Create firewall drop rule
3. Device can't access blocked site
(Feature ready to implement)
```

---

## 🆘 Quick Troubleshooting

### Dashboard shows empty chart

**Cause:** Mikrotik not connected

**Fix:**
```bash
# 1. Check .env.local
cat .env.local

# 2. Verify Mikrotik API enabled
# In Mikrotik: /ip service print

# 3. Test connectivity
ping 192.168.88.1

# 4. Restart dev server
npm run dev
```

### Device list shows 0 devices

**Cause:** No ARP entries

**Fix:**
```bash
# From Mikrotik, ping some devices:
ping 192.168.1.100
ping 192.168.1.101

# Then refresh UI
# Devices should appear
```

### Admin password not working

**Cause:** Wrong password

**Fix:**
```bash
# Check .env.local
cat .env.local | grep ADMIN_PASSWORD

# Should see: ADMIN_PASSWORD=admin123
# If different, use that password

# Or change it:
# Edit .env.local
# Save and restart: npm run dev
```

### Applications not showing

**Cause:** Layer7 DPI not setup

**Fix:**
```bash
# In Mikrotik terminal:
/ip firewall layer7-protocol print

# If empty: Need to add protocols
# Follow "Layer7 DPI Setup" above
```

---

## 🎓 Learning Path

### Level 1: Beginner (Today)
- [ ] Read QUICKSTART.md (5 min)
- [ ] Start dev server
- [ ] Access http://localhost:3000
- [ ] Explore dashboard
- [ ] Check devices list

### Level 2: Intermediate (This Week)
- [ ] Setup Layer7 DPI
- [ ] Test admin panel
- [ ] Filter access logs
- [ ] Try all features
- [ ] Read README.md

### Level 3: Advanced (This Month)
- [ ] Study ARCHITECTURE.md
- [ ] Understand API endpoints
- [ ] Plan customizations
- [ ] Deploy to production
- [ ] Setup monitoring

---

## 📚 Documentation Reference

| Need | Document | Read Time |
|------|----------|-----------|
| Quick start | QUICKSTART.md | 2 min |
| Overview | README.md | 10 min |
| Setup Mikrotik | MIKROTIK_SETUP.md | 10 min |
| Admin features | ADMIN_PANEL.md | 5 min |
| Device tracking | DEVICE_MONITORING.md | 6 min |
| Daily usage | QUICK_REFERENCE.md | 5 min |
| Issues | TROUBLESHOOTING.md | 8 min |
| API details | API.md | 10 min |
| Production | DEPLOYMENT.md | 20 min |

---

## ✅ Success Checklist

Mark these off as you complete them:

### Setup Phase
- [ ] npm run dev starts without errors
- [ ] http://localhost:3000 opens
- [ ] Dashboard displays without errors
- [ ] .env.local has Mikrotik credentials

### Verification Phase
- [ ] Dashboard chart shows data
- [ ] Device list shows devices
- [ ] Can click device for details
- [ ] Admin panel login works

### Configuration Phase
- [ ] Layer7 protocols added (optional)
- [ ] Admin password set
- [ ] All features tested
- [ ] Logs are being recorded

### Operations Phase
- [ ] Daily monitoring routine established
- [ ] Issues resolved with troubleshooting
- [ ] Team trained on usage
- [ ] Backup & recovery plan ready

---

## 🚀 Ready for Production?

When ready to deploy to production server:

**Follow DEPLOYMENT_CHECKLIST.md**

```bash
# Pre-flight checks
npm run build              # Verify build
npm start                  # Test production mode

# Then:
# 1. Setup reverse proxy (Nginx/Apache)
# 2. Configure SSL certificate
# 3. Setup process manager (PM2)
# 4. Enable monitoring & alerts
# 5. Configure backups
```

---

## 💬 Common Questions

### Q: Can I access from another computer?

**A:** Yes!
```
1. Find server IP: ipconfig (look for IPv4)
2. Access: http://[server-ip]:3000
3. For production: use domain name
```

### Q: How do I change admin password?

**A:** Edit `.env.local`
```
ADMIN_PASSWORD=mynewpassword
Restart: npm run dev
```

### Q: Can I add more interfaces?

**A:** Yes!
```
In Mikrotik, add more interfaces
They'll auto-appear in dropdown
```

### Q: How do I backup data?

**A:** See DEPLOYMENT_CHECKLIST.md
```
- .env.local backup
- Database backup (if using DB)
- Configuration backup
```

### Q: What if Mikrotik goes down?

**A:** UI shows fallback mock data
```
- Dashboard still functional
- Data won't be real
- Auto-reconnects when back up
```

---

## 📞 Support Resources

1. **Quick Help** → QUICK_REFERENCE.md
2. **Issues** → TROUBLESHOOTING.md
3. **Mikrotik Setup** → MIKROTIK_SETUP.md
4. **APIs** → API.md
5. **Full Docs** → README.md & INDEX.md

---

## 🎉 You're Ready!

Everything is set up and ready to go. The system is:
- ✅ Fully functional
- ✅ Production-ready
- ✅ Well-documented
- ✅ Easy to use
- ✅ Simple to maintain

### Start Now:

```bash
npm run dev
```

Then open: **http://localhost:3000** 🚀

---

## 📝 Quick Reference

**Most Used URLs:**
- Dashboard: `http://localhost:3000/dashboard`
- Devices: `http://localhost:3000/devices`
- Admin: `http://localhost:3000/admin`

**Most Used Commands:**
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production
```

**Important Passwords:**
- Mikrotik User: monitoring
- Mikrotik Password: (in .env.local → MT_PASS)
- Admin Password: (in .env.local → ADMIN_PASSWORD)

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 17 November 2024

🎊 **Happy monitoring! Enjoy the system! 🎊**
