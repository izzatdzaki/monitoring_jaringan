# 📘 DOKUMENTASI SISTEM MONITORING TRAFFIC MIKROTIK

## Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Persiapan Mikrotik](#persiapan-mikrotik)
4. [Instalasi & Setup](#instalasi--setup)
5. [Struktur Project](#struktur-project)
6. [API Endpoints](#api-endpoints)
7. [Konfigurasi Environment](#konfigurasi-environment)
8. [Menjalankan Aplikasi](#menjalankan-aplikasi)
9. [Troubleshooting](#troubleshooting)
10. [Best Practice](#best-practice)

---

## Pengenalan

Sistem monitoring ini menggunakan **Next.js (App Router)** untuk menampilkan traffic Mikrotik RouterOS secara **real-time** dengan visualisasi grafik menggunakan Chart.js.

### Teknologi yang Digunakan
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Grafik**: Chart.js dengan React ChartJS-2
- **Koneksi Mikrotik**: REST API HTTP (port 8728/8729)

---

## Arsitektur Sistem

```
┌─────────────────────┐
│ Mikrotik RouterOS   │
│ REST API :8728      │
└──────────┬──────────┘
           │ HTTP Request
           ▼
┌─────────────────────────────────────────┐
│      Next.js Server                     │
│  ┌─────────────────────────────────┐   │
│  │ /api/mikrotik/traffic/[iface]   │   │
│  │ /api/mikrotik/interfaces         │   │
│  └─────────────────────────────────┘   │
└──────────┬──────────────────────────────┘
           │ JSON Response
           ▼
┌─────────────────────────────────────────┐
│      Browser (Client)                   │
│  ┌─────────────────────────────────┐   │
│  │ Dashboard Page                  │   │
│  │ Real-time Chart                 │   │
│  │ Interface Selector              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Persiapan Mikrotik

### 1. Aktifkan REST API / HTTP API

Login ke Mikrotik via Winbox atau SSH:

```bash
/ip service enable api
/ip service enable api-ssl
```

Default ports:
- API: **8728** (plaintext)
- API-SSL: **8729** (encrypted)

### 2. Buat User untuk Monitoring

```bash
/user group add name=monitoring policy=read,api,test,winbox
/user add name=monitoring password=123456 group=monitoring
```

### 3. (Optional) Setup Firewall untuk Remote Access

Jika akses dari server terpisah:

```bash
/ip firewall filter add chain=input src-address=IP_SERVER protocol=tcp dst-port=8728 action=accept
```

---

## Instalasi & Setup

### 1. Clone / Download Project

```bash
cd c:\laragon\www\monitoring_jaringan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Edit `.env.local`:

```env
MT_HOST=192.168.88.1
MT_USER=monitoring
MT_PASS=123456
MT_PORT=8728
```

Sesuaikan dengan konfigurasi Mikrotik Anda.

### 4. Run Development Server

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

---

## Struktur Project

```
monitoring_jaringan/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard page
│   │   └── api/
│   │       └── mikrotik/
│   │           ├── traffic/
│   │           │   └── [iface]/
│   │           │       └── route.ts # Traffic API
│   │           └── interfaces/
│   │               └── route.ts     # List interfaces API
│   ├── lib/
│   │   └── mikrotik.ts             # Mikrotik API client
│   └── components/
│       └── TrafficChart.tsx        # Chart component
├── public/                          # Static files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local                       # Environment variables
└── .env.example                     # Environment template
```

---

## API Endpoints

### 1. Get Traffic Data

**Endpoint:**
```
GET /api/mikrotik/traffic/[iface]
```

**Contoh:**
```
GET /api/mikrotik/traffic/ether1
```

**Response:**
```json
{
  "interface": "ether1",
  "rx": 1250000,
  "tx": 950000,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

**Parameter:**
- `iface` (required): Nama interface (contoh: ether1, ether2, bridge1)

---

### 2. Get Interface List

**Endpoint:**
```
GET /api/mikrotik/interfaces
```

**Response:**
```json
{
  "interfaces": ["ether1", "ether2", "bridge1", "wlan1"],
  "count": 4
}
```

---

## Konfigurasi Environment

File `.env.local` (disesuaikan dengan Mikrotik Anda):

```env
# Mikrotik RouterOS Configuration
MT_HOST=192.168.88.1          # IP Address Mikrotik
MT_USER=monitoring             # Username (user yang dibuat di Mikrotik)
MT_PASS=123456                # Password
MT_PORT=8728                  # Port API (default: 8728)
```

---

## Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Akses: http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

### Lint Check

```bash
npm run lint
```

---

## Features

✅ **Real-time Monitoring**
- Update setiap 1 detik
- Data langsung dari Mikrotik

✅ **Multi-Interface Support**
- Monitor multiple interfaces
- Switch interface dengan mudah

✅ **Beautiful Dashboard**
- Dark theme
- Responsive design
- Tailwind CSS

✅ **Interactive Chart**
- Upload (TX) & Download (RX) graph
- 30 data points history
- Smooth animations

✅ **Environment Variables**
- Secure configuration
- Easy to deploy

---

## Troubleshooting

### 1. Error: Cannot connect to Mikrotik

**Penyebab:**
- REST API belum diaktifkan di Mikrotik
- IP/Port tidak sesuai
- Username/Password salah

**Solusi:**
```bash
# Di Mikrotik:
/ip service print    # Cek apakah API/api-ssl enabled
/ip service enable api
/ip service enable api-ssl
```

---

### 2. Error: 401 Unauthorized

**Penyebab:**
- Username atau password salah

**Solusi:**
```bash
# Di Mikrotik, verify user:
/user print
# Atau buat user baru:
/user add name=monitoring password=123456 group=full
```

---

### 3. Chart tidak update

**Penyebab:**
- API endpoint belum running
- Fetch interval terlalu pendek
- Browser cache

**Solusi:**
```bash
# Restart Next.js:
npm run dev

# Atau clear cache di browser (Ctrl+Shift+Delete)
```

---

### 4. Interface tidak muncul di dropdown

**Penyebab:**
- GET /api/mikrotik/interfaces gagal

**Solusi:**
- Dashboard akan fallback ke default interfaces: ether1, ether2, ether3
- Edit dashboard/page.tsx untuk custom interface

---

## Best Practice

### 1. Security
- Gunakan user terpisah untuk monitoring (bukan admin)
- Gunakan API-SSL (port 8729) untuk production
- Implementasikan rate limiting

```typescript
// Contoh rate limit middleware
const rateLimit = new Map();

export function checkRateLimit(key: string, limit: number = 100) {
  const now = Date.now();
  const requests = rateLimit.get(key) || [];
  const recent = requests.filter((time) => now - time < 60000);

  if (recent.length >= limit) return false;
  rateLimit.set(key, [...recent, now]);
  return true;
}
```

### 2. Performance
- Cache traffic data selama 1-2 detik
- Limit jumlah interface yang dimonitor
- Gunakan polling interval 1-5 detik

### 3. Deployment
- Gunakan environment variables untuk setiap environment
- Setup reverse proxy (Nginx)
- Monitor uptime dengan tool seperti PM2

```bash
# Install PM2
npm install -g pm2

# Start dengan PM2
pm2 start npm -- start --name "monitoring"
pm2 save
pm2 startup
```

### 4. Database (Optional)
Untuk menyimpan historical data:

```typescript
// Contoh dengan Prisma
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function saveTraffic(iface: string, rx: number, tx: number) {
  await prisma.traffic.create({
    data: {
      interface: iface,
      rx,
      tx,
      timestamp: new Date(),
    },
  });
}
```

---

## Next Steps

1. ✅ Setup Mikrotik
2. ✅ Install project
3. ✅ Configure .env.local
4. ✅ Run `npm run dev`
5. ✅ Akses http://localhost:3000

Untuk development lebih lanjut:
- Tambahkan authentication
- Setup database untuk history
- Create API untuk export data
- Tambah alert system
- Setup Docker untuk deployment

---

## Support

Jika ada masalah atau pertanyaan:
1. Cek logs di terminal Next.js
2. Verify koneksi Mikrotik
3. Cek format environment variables
4. Clear cache browser

---

**Last Updated:** 17 November 2024
**Version:** 1.0.0
