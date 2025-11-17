# 🎯 Quick Reference Guide

Panduan cepat untuk menggunakan sistem monitoring Mikrotik.

---

## 🏠 Halaman Utama

| Halaman | URL | Fungsi |
|---------|-----|--------|
| **Dashboard** | `/dashboard` | Real-time traffic monitoring per interface |
| **Device List** | `/devices` | Lihat semua device di network |
| **Device Detail** | `/devices/192.168.1.100` | Monitoring per device + aplikasi |
| **Admin Panel** | `/admin` | Access logs + statistics |
| **Home** | `/` | Landing page |

---

## 📊 Dashboard (/dashboard)

### Cara Menggunakan
1. **Pilih Interface** - Dropdown di atas untuk select port (ether1-5)
2. **Lihat Chart** - RX/TX real-time dengan update setiap 1 detik
3. **Baca Stats** - Di footer: current speed, total data, uptime

### Shortcut
```
Ether1: ISP Telkomsel    → Port 1
Ether2: ISP Biznet       → Port 2
Ether3: Server           → Port 3
Ether4: Switch 16 Port   → Port 4 (CLIENT PCs)
Ether5: PC IT            → Port 5
```

---

## 📱 Device List (/devices)

### Fitur Utama
- **View All**: Lihat 16+ device di network
- **Filter by Port**: `ether4` untuk melihat hanya PC di switch
- **Sort by Data**: Urutkan by upload/download usage
- **Click Device**: Lihat detail aplikasi yang dibuka

### Contoh Quick Check

**Pertanyaan**: "PC mana saja yang sedang online?"
**Jawab**: Buka `/devices` → Lihat kolom "Status" yang warna hijau

**Pertanyaan**: "Siapa yang paling banyak download?"
**Jawab**: Buka `/devices` → Sort by "Total Down" → Lihat yang tertinggi

---

## 🔎 Device Detail (/devices/[IP])

### Info yang Ditampilkan

```
PC-Accounting (192.168.1.100)
├─ Status: Online
├─ MAC: 00:11:22:33:44:01
├─ Current Speed: ↓1.2Mb ↑0.5Mb
├─ Today's Usage: ↓2.5GB ↑150MB
└─ Applications:
   ├─ YouTube: 1.2GB (48%)
   ├─ Facebook: 250MB (10%)
   ├─ WhatsApp: 100MB (4%)
   └─ Others: 950MB (38%)
```

### Copy-Paste IPs untuk Cek
```
192.168.1.100  → PC Accounting
192.168.1.101  → PC HR
192.168.1.102  → PC Marketing
192.168.1.103  → PC Operation
... dst
```

---

## 🔐 Admin Panel (/admin)

### Login
```
Password: (check di .env atau .env.local)
```

### Actions

#### 1. View Statistics
```
✓ Total Access     = Berapa kali semua orang akses?
✓ Unique IPs       = Berapa device yang mengakses?
✓ GET vs POST      = Request type breakdown
✓ Last Access      = Kapan kali terakhir ada aktivitas?
```

#### 2. Filter Logs
```
By IP:   "192.168.1.100"      → Lihat hanya akses dari PC itu
By Path: "/devices"            → Lihat hanya yang buka halaman device
By Method: "POST"              → Lihat hanya yang kirim data
```

#### 3. Track User Activity
```
Contoh Skenario:
"Siapa saja yang akses admin panel hari ini?"
→ Filter by path: "/admin"
→ Lihat list IP + timestamp

"Device mana saja yang akses API devices?"
→ Filter by path: "/api/devices"
→ Bisa cek berapa device yang pernah connect
```

---

## 🎨 Color Coding

### HTTP Methods
- 🔵 **GET** (Biru) = Request data (harmless)
- 🟢 **POST** (Hijau) = Submit/send data (caution)

### Device Status
- 🟢 **Online** (Hijau) = Device sedang terhubung
- ⚫ **Offline** (Abu-abu) = Device tidak terhubung
- 🟡 **Idle** (Kuning) = Device connected tapi tidak ada traffic

### Application Categories
- 📱 **Social Media** = Facebook, Instagram, Twitter, LinkedIn
- 🎵 **Streaming** = YouTube, Netflix, Spotify
- 💬 **Chat** = WhatsApp, Telegram
- 🎮 **Gaming** = Steam, Epic Games
- 📺 **Video Call** = Zoom, Teams, Google Meet

---

## ⚡ Common Tasks

### Task 1: Check PC mana yang sedang aktif
```
1. Buka /devices
2. Sort by "Download Speed" (descending)
3. Device dengan speed > 0.1 Mbps = sedang aktif
```

### Task 2: Track apa yang dibuka oleh satu PC
```
1. Buka /devices
2. Click PC yang ingin di-track
3. Lihat "Applications Accessed" section
4. Scroll untuk lihat detail per app
```

### Task 3: Find bandwidth hog (PC yang paling boros)
```
1. Buka /devices
2. Sort by "Total Down" (descending)
3. Lihat PC dengan total tertinggi
4. Click untuk lihat aplikasi apa yang dimainkan
```

### Task 4: Check real-time traffic per interface
```
1. Buka /dashboard
2. Pilih interface di dropdown
3. Lihat real-time RX/TX di chart
4. Update otomatis setiap 1 detik
```

### Task 5: Generate access report
```
1. Buka /admin
2. Login dengan password
3. Export or screenshot logs
4. Atau: Filter → Copy data → Paste ke Excel
```

---

## 🔧 API Quick Reference

### Get Device List
```bash
curl "http://localhost:3000/api/devices?action=devices"
```

### Get Device Detail (includes apps)
```bash
curl "http://localhost:3000/api/devices?action=device-detail&ip=192.168.1.100"
```

### Get Admin Logs (requires password)
```bash
curl "http://localhost:3000/api/admin/access-logs?adminPassword=admin123&action=stats"
```

### Get Unique IPs
```bash
curl "http://localhost:3000/api/admin/access-logs?adminPassword=admin123&action=unique-ips"
```

---

## 📋 Daily Checklist

- [ ] Check dashboard RX/TX normal?
- [ ] Lihat ada device offline?
- [ ] Review access logs untuk suspicious activity
- [ ] Check top bandwidth users
- [ ] Monitor specific application usage
- [ ] Generate daily report jika perlu

---

## 🚨 Alert Thresholds (Recommended)

| Metric | Warning | Critical |
|--------|---------|----------|
| Device Speed | > 50 Mbps | > 100 Mbps |
| Daily Usage | > 10GB | > 50GB |
| Connected Devices | > 20 | > 30 |
| YouTube % | > 40% | > 70% |
| API Response | > 500ms | > 1000ms |

---

## 🔄 Polling Intervals

| Feature | Update Frequency | Notes |
|---------|-----------------|-------|
| Dashboard Chart | 1 second | Real-time |
| Device List | 3 seconds | ~18 devices |
| Device Detail | 2 seconds | Per-IP |
| Admin Logs | 5 seconds | Auto-refresh |

---

## 🗝️ Keyboard Shortcuts (Future)

```
Ctrl+D          → Open Dashboard
Ctrl+L          → Open Device List
Ctrl+A          → Open Admin Panel
Ctrl+R          → Refresh current page
Ctrl+E          → Export data
```

---

## 📞 Troubleshooting Quick Fix

### Halaman blank / kosong?
```
1. Reload page (F5)
2. Check browser console (F12 → Console)
3. Verify Mikrotik koneksi: /api/mikrotik/interfaces
4. Check server status: npm run dev running?
```

### Data tidak update?
```
1. Wait 3-5 seconds (polling delay)
2. Trigger device activity (ping, browse)
3. Reload page
4. Check server logs
```

### Admin panel not login?
```
1. Check .env.local password
2. Try: admin123 (default)
3. Check capslock
4. F12 → Network tab → lihat response
```

### Specific device offline?
```
1. Check IP di /devices
2. Ping device dari Mikrotik: ping 192.168.1.100
3. Check ARP table: /ip arp print in Mikrotik
4. Device mungkin perlu restart
```

---

## 💡 Pro Tips

1. **Bookmark Pages**
   ```
   http://localhost:3000/devices
   http://localhost:3000/dashboard?iface=ether4
   http://localhost:3000/admin
   ```

2. **Create Dashboard Filters**
   ```
   Save filter: "Switch Devices" = /devices?interface=ether4
   Save filter: "High Bandwidth" = /devices?sort=download-desc
   ```

3. **Automate Reports**
   ```
   Schedule: /api/admin/access-logs daily export
   Result: Email summary ke management
   ```

4. **Monitor Trends**
   ```
   Track: Daily bandwidth usage per device
   Pattern: Identify peak hours
   Action: Plan capacity accordingly
   ```

5. **Set Alarms**
   ```
   Alert: IF device total > 50GB THEN notify
   Alert: IF unusual app usage THEN investigate
   Alert: IF multiple offline devices THEN check network
   ```

---

## 📚 Context Menu (Admin Reference)

**Untuk each device di list:**
- View Details → Buka device detail page
- View Logs → Filter logs by that IP
- Block Device → (future feature)
- Set Bandwidth Limit → (future feature)

---

**Version:** 1.0.0  
**Last Updated:** 17 November 2024  
**For:** System Administrators
