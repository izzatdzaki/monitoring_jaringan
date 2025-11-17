# 🔍 Device & Application Monitoring Guide

Panduan lengkap untuk monitoring **semua PC client** dan **aplikasi/website yang mereka akses**.

---

## 📌 Overview

Fitur baru dalam sistem monitoring:

✅ **Device Monitoring**
- Lihat semua device di network (PC, Server, dll)
- Status online/offline real-time
- Traffic per device (upload/download)
- Total data usage

✅ **Application Tracking**
- Lihat website apa saja yang dibuka
- Track social media usage
- Monitor gaming, streaming
- Custom application detection

✅ **Network Topology**
- Visualisasi topologi jaringan
- Device grouping per interface (port)
- Connection status monitoring

---

## 🌐 Network Topology

```
Internet (Telkomsel & Biznet)
        ↓
   MIKROTIK
   ├─ PORT 1: Telkomsel ISP
   ├─ PORT 2: Biznet ISP
   ├─ PORT 3: Server (192.168.1.10)
   ├─ PORT 4: Switch 16 Port
   │   ├─ PC 1 (192.168.1.100) - Accounting
   │   ├─ PC 2 (192.168.1.101) - HR
   │   ├─ PC 3 (192.168.1.102) - Marketing
   │   ├─ ... PC 4-16
   └─ PORT 5: PC IT (192.168.1.200)
```

---

## 🚀 Akses Halaman Device Monitoring

### URL
```
http://localhost:3000/devices
```

### Fitur Halaman

1. **Device List**
   - Lihat semua device yang terhubung
   - Status online/offline (dengan indikator warna)
   - Download/Upload speed real-time
   - Total data usage

2. **Filter by Interface**
   - Filter device per port Mikrotik
   - Lihat hanya PC di switch (ether4)
   - Lihat hanya PC IT (ether5)

3. **Quick Details**
   - IP Address
   - MAC Address
   - Hostname
   - Current bandwidth

---

## 🔎 Device Detail Monitoring

### URL
```
http://localhost:3000/devices/192.168.1.100
```

### Informasi Per Device

1. **Status**
   - Online/Offline
   - Last seen
   - First seen
   - Current connections

2. **Traffic**
   - Current download speed
   - Current upload speed
   - Total download
   - Total upload

3. **Applications Accessed**
   - Facebook
   - YouTube
   - WhatsApp
   - Instagram
   - Gaming
   - Streaming
   - Custom websites

---

## ⚙️ Setup Layer7 DPI di Mikrotik

Untuk tracking website/aplikasi yang dibuka, setup Layer7 firewall:

### Langkah 1: SSH ke Mikrotik

```bash
ssh admin@192.168.88.1
```

Atau gunakan **Winbox** (GUI tool)

### Langkah 2: Create Layer7 Protocols

```
/ip firewall layer7-protocol
add name=facebook protocol="http.*facebook.com|https.*facebook.com"
add name=youtube protocol="http.*youtube.com|https.*youtube.com"  
add name=whatsapp protocol="http.*whatsapp.com|https.*whatsapp.com"
add name=instagram protocol="http.*instagram.com|https.*instagram.com"
add name=telegram protocol="http.*telegram.org|https.*telegram.org"
add name=tiktok protocol="http.*tiktok.com|https.*tiktok.com"
add name=twitter protocol="http.*twitter.com|https.*twitter.com"
add name=linkedin protocol="http.*linkedin.com|https.*linkedin.com"
add name=reddit protocol="http.*reddit.com|https.*reddit.com"
add name=gaming protocol="http.*steam.com|https.*steam.com|http.*epicgames.com"
add name=streaming protocol="http.*netflix.com|https.*netflix.com"
```

### Langkah 3: Create Mangle Rules

```
/ip firewall mangle
add chain=forward action=mark-connection \
    new-connection-mark=facebook-conn \
    protocol=tcp layer7-protocol=facebook

add chain=forward action=mark-connection \
    new-connection-mark=youtube-conn \
    protocol=tcp layer7-protocol=youtube

# ... repeat untuk aplikasi lainnya
```

### Langkah 4: Create Simple Queues untuk Tracking

```
/queue simple
add name="Device-192.168.1.100" target=192.168.1.100/32
add name="Device-192.168.1.101" target=192.168.1.101/32
# ... repeat untuk semua device
```

---

## 📊 API Endpoints

### 1. Get All Connected Devices

```
GET /api/devices?action=devices
```

Response:
```json
{
  "devices": [
    {
      "id": "PC-1",
      "ip": "192.168.1.100",
      "mac": "00:11:22:33:44:01",
      "hostname": "PC-Accounting",
      "interface": "ether4",
      "uploadSpeed": 0.5,
      "downloadSpeed": 1.2,
      "totalUp": 120000000,
      "totalDown": 2500000000,
      "isOnline": true
    }
  ],
  "count": 18,
  "timestamp": "2024-11-17T10:30:00Z"
}
```

### 2. Get Device Detail

```
GET /api/devices?action=device-detail&ip=192.168.1.100
```

Response:
```json
{
  "id": "PC-1",
  "ip": "192.168.1.100",
  "hostname": "PC-Accounting",
  "downloadSpeed": 1.2,
  "uploadSpeed": 0.5,
  "applications": [
    {
      "name": "Facebook",
      "dataUsed": 250000000,
      "accessCount": 45,
      "lastAccess": "2024-11-17T10:29:00Z"
    },
    {
      "name": "YouTube",
      "dataUsed": 1200000000,
      "accessCount": 120,
      "lastAccess": "2024-11-17T10:30:00Z"
    }
  ]
}
```

### 3. Get Application Statistics

```
GET /api/devices?action=applications
```

Response:
```json
{
  "facebook": {
    "dataUsed": 4200000000,
    "devices": 15,
    "percentage": 25
  },
  "youtube": {
    "dataUsed": 8500000000,
    "devices": 12,
    "percentage": 50
  }
}
```

---

## 📈 Use Cases

### 1. Track PC Client Activity
```
"Apa yang sedang dilakukan PC 1 (Accounting)?"
- Currently downloading 1.2 Mbps
- Spent 2.5GB today
- Mostly YouTube (1.2GB) dan Facebook (250MB)
```

### 2. Identify Bandwidth Hogs
```
"Device mana yang paling banyak menggunakan bandwidth?"
- Server: 12GB (paling besar)
- PC-Marketing: 3.2GB
- PC-Accounting: 2.5GB
```

### 3. Enforce Policy
```
"PC mana saja yang akses YouTube?"
- 12 PCs mengakses YouTube
- Total usage: 8.5GB hari ini
- Bisa di-block jika perlu
```

### 4. Troubleshooting
```
"Kenapa jaringan lambat?"
- Check device dengan traffic tertinggi
- Identify aplikasi yang boros bandwidth
- Monitor queue status
```

---

## 🔐 Security & Privacy

### Considerations
- 🔒 Encryption: HTTPS untuk admin panel
- 👤 Authentication: Setiap akses perlu admin password
- 📊 Data: Logs tersimpan in-memory (bisa dipindah ke DB)
- ⚠️ Transparency: Beritahu user jika ada monitoring

### Legal Compliance
- ✅ Dokumentasikan monitoring policy
- ✅ Inform employees tentang tracking
- ✅ Follow company policy & laws
- ✅ Use for legitimate business purposes only

---

## 🛠️ Advanced Configuration

### Custom Layer7 Patterns

Tambah custom pattern untuk website spesifik:

```
/ip firewall layer7-protocol
add name=ecommerce protocol="http.*shopee.co.id|https.*shopee.co.id"
add name=banking protocol="https.*bank\.bri\.co\.id"
add name=news protocol="https.*detik\.com|https.*kompas\.com"
```

### Per-Device Bandwidth Limiting

```
/queue simple
add name="PC-Marketing" target=192.168.1.102/32 max-limit=10M/10M
add name="PC-Streaming" target=192.168.1.103/32 max-limit=5M/2M
```

### Traffic Alerts

Script untuk alert jika PC exceed quota:

```
/system script
add name=check-bandwidth script={
  /queue simple
  :foreach item in=[find] do={
    :if ([get $item total-bytes] > 5000000000) do={
      /tool send-email to=admin@company.com \
        subject="Device $[get $item name] exceeded 5GB" \
        body="$[get $item name] has used over 5GB today"
    }
  }
}
```

---

## 📱 Dashboard Components

### 1. Network Topology Graph
- Visual representation of network
- Device status indicators
- Real-time connection count

### 2. Traffic Timeline
- Historical data per device
- Peak usage times
- Trend analysis

### 3. Application Usage Chart
- Pie chart: aplikasi distribution
- Bar chart: per-device comparison
- Time-series graph

### 4. Alerts & Notifications
- Unusual activity detection
- Quota exceeded warning
- Connection issues alert

---

## 🚀 Future Enhancements

- [ ] Real-time graph visualization
- [ ] Historical data storage (database)
- [ ] Automated reports (daily/weekly/monthly)
- [ ] Email alerts for violations
- [ ] Bandwidth quota per device
- [ ] Content filtering integration
- [ ] VPN detection
- [ ] User behavior analytics
- [ ] Mobile app for monitoring
- [ ] Multi-protocol support (DNS, VPN, P2P)

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [ADMIN_PANEL.md](ADMIN_PANEL.md) - Admin access logs
- [API.md](API.md) - API documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

---

## 🔧 Troubleshooting

### Device list kosong

**Solution:**
1. Verify Mikrotik API enabled
2. Check ARP table: `/ip arp print`
3. Ping device dari Mikrotik: `ping 192.168.1.100`

### Application data tidak muncul

**Solution:**
1. Layer7 DPI belum di-setup
2. Traffic belum terdeteksi (cold start)
3. Protocol patterns mungkin perlu tuning

### Performance slow

**Solution:**
1. Kurangi polling interval
2. Limit jumlah device yang di-monitor
3. Cache device list

---

**Last Updated:** 17 November 2024
**Version:** 1.0.0
**Status:** Production Ready
