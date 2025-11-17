# 🔐 Admin Panel & Access Logs Documentation

Panduan penggunaan Admin Panel untuk monitoring IP address dan access logs.

---

## 📌 Overview

Admin Panel menyediakan fitur monitoring untuk:
- ✅ Melihat semua IP address yang mengakses dashboard
- ✅ Tracking halaman apa saja yang diakses
- ✅ Melihat user agent & method (GET/POST)
- ✅ Filter logs berdasarkan IP atau path
- ✅ Statistik akses real-time
- ✅ Lihat waktu akses (timestamp)

---

## 🚀 Akses Admin Panel

### URL
```
http://localhost:3000/admin
```

### Login
1. Buka http://localhost:3000/admin
2. Masukkan password: `admin123` (default)
3. Click "Login"

---

## 🔑 Mengubah Admin Password

Edit file `.env.local`:

```env
# Ganti dengan password yang kuat
ADMIN_PASSWORD=MyStrongPassword123
NEXT_PUBLIC_ADMIN_PASSWORD=MyStrongPassword123
```

Restart server:
```bash
npm run dev
```

⚠️ **PENTING**: Gunakan password yang kuat di production!

---

## 📊 Fitur Admin Panel

### 1. Statistics Dashboard

Menampilkan:
- **Total Access** - Total jumlah request/akses
- **Unique IPs** - Jumlah unique IP address yang akses
- **GET Requests** - Jumlah GET requests
- **POST Requests** - Jumlah POST requests
- **Last Access** - Waktu akses terakhir

Contoh:
```
Total Access: 1,234
Unique IPs: 42
GET Requests: 1,100
POST Requests: 134
Last Access: 10:30:45
```

### 2. Filter Logs

Filter logs berdasarkan:

#### Filter by IP
```
IP: 192.168.1.100
```
Akan menampilkan semua akses dari IP tersebut.

#### Filter by Path
```
Path: /api/mikrotik
```
Akan menampilkan akses ke endpoint yang mengandung `/api/mikrotik`.

#### Kombinasi Filter
Bisa menggunakan kedua filter sekaligus.

### 3. Access Logs Table

Tabel menampilkan:

| Kolom | Deskripsi |
|-------|-----------|
| Timestamp | Waktu akses (format local time) |
| IP Address | IP address yang mengakses |
| Method | HTTP Method (GET/POST/etc) |
| Path | URL path yang diakses |
| User Agent | Browser/client information |

Warna badge Method:
- 🔵 **GET** - Blue badge
- 🟢 **POST** - Green badge
- ⚪ **Other** - Gray badge

---

## 🔧 Konfigurasi

### Environment Variables

Di `.env.local`:

```env
# Required untuk Admin Panel
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

### Variabel Penjelasan

| Variabel | Tujuan | Contoh |
|----------|--------|--------|
| ADMIN_PASSWORD | Password untuk login (server-side) | admin123 |
| NEXT_PUBLIC_ADMIN_PASSWORD | Password untuk API auth | admin123 |

⚠️ **Note**: Keduanya harus sama saat ini.

---

## 📈 API Endpoints

### Get All Access Logs

```
GET /api/admin/access-logs?adminPassword=admin123&limit=50&offset=0
```

Response:
```json
{
  "logs": [
    {
      "id": "1234567890-abc123",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "path": "/dashboard",
      "method": "GET",
      "timestamp": "2024-11-17T10:30:45.123Z"
    }
  ],
  "total": 1234
}
```

### Get Statistics

```
GET /api/admin/access-logs?action=stats&adminPassword=admin123
```

Response:
```json
{
  "totalAccess": 1234,
  "uniqueIPs": 42,
  "methodCount": {
    "GET": 1100,
    "POST": 134
  },
  "pathCount": {
    "/dashboard": 800,
    "/api/mikrotik/traffic/ether1": 400,
    "/api/mikrotik/interfaces": 34
  },
  "ipCount": {
    "192.168.1.100": 150,
    "192.168.1.101": 120
  },
  "lastAccess": "2024-11-17T10:30:45.123Z"
}
```

### Get Unique IPs

```
GET /api/admin/access-logs?action=unique-ips&adminPassword=admin123
```

Response:
```json
{
  "ips": ["192.168.1.100", "192.168.1.101", "192.168.1.102"]
}
```

### Filter Logs

```
GET /api/admin/access-logs?action=filter&ip=192.168.1.100&adminPassword=admin123
```

Parameters:
- `ip` - Filter by IP address (optional)
- `path` - Filter by path (optional)
- `method` - Filter by HTTP method (optional)
- `limit` - Jumlah logs (default: 100)
- `offset` - Starting position (default: 0)

---

## 🔐 Security

### Password Protection
- Admin password harus diisi di `.env.local`
- Password dikirim melalui query parameter (use HTTPS in production!)
- Logs hanya bisa diakses dengan password yang benar

### Best Practices (Production)

1. **Gunakan HTTPS**
   ```nginx
   # Nginx config
   listen 443 ssl http2;
   ssl_certificate ...;
   ssl_certificate_key ...;
   ```

2. **Ubah Default Password**
   ```env
   ADMIN_PASSWORD=Very$tr0ng!P@ssw0rd2024
   NEXT_PUBLIC_ADMIN_PASSWORD=Very$tr0ng!P@ssw0rd2024
   ```

3. **Restrict Access by IP**
   ```nginx
   # Only allow from office network
   allow 203.0.113.0/24;
   deny all;
   ```

4. **Rate Limiting**
   Implementasikan rate limit untuk API endpoint.

5. **Audit Logs**
   Log semua admin access untuk audit trail.

---

## 📝 Tracking Logic

Middleware secara otomatis tracking setiap request:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const ip = getClientIP(request)
  const userAgent = request.headers.get("user-agent")
  const path = request.nextUrl.pathname
  const method = request.method
  
  // Log access
  logAccess(ip, path, method, userAgent)
  
  return NextResponse.next()
}
```

### Excluded Paths
- `/_next/static` - Next.js static files
- `/_next/image` - Image optimization
- `/favicon.ico` - Favicon

---

## 🔄 Data Storage

### Current Implementation
- **Storage**: In-memory (RAM)
- **Capacity**: Last 1000 logs
- **Persistence**: Data hilang saat restart

### Future Improvements
Bisa diupgrade ke:
- Database (SQLite, PostgreSQL, MongoDB)
- Cloud storage (AWS S3, Google Cloud)
- Analytics service (Mixpanel, Segment)

### Upgrade ke Database

Contoh dengan SQLite:

```typescript
// lib/db.ts
import Database from 'better-sqlite3'

const db = new Database('logs.db')

export function logAccessDB(log: AccessLog) {
  db.prepare(`
    INSERT INTO access_logs (ip, path, method, userAgent, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(log.ip, log.path, log.method, log.userAgent, log.timestamp)
}
```

---

## 🛠️ Troubleshooting

### Admin Panel blank atau error

**Solution:**
1. Cek `.env.local` ada password
2. Restart server: `npm run dev`
3. Clear cache browser (Ctrl+Shift+Delete)

### Password tidak bekerja

**Solution:**
1. Verify password di `.env.local`
2. Pastikan NEXT_PUBLIC_ADMIN_PASSWORD sama dengan ADMIN_PASSWORD
3. Restart server

### Logs tidak muncul

**Solution:**
1. Pastikan middleware.ts ada di root `src/` folder
2. Coba akses halaman lain (refresh dashboard)
3. Check browser console untuk errors

### "Unauthorized" error

**Solution:**
1. Pastikan admin password benar
2. Check query parameter: `?adminPassword=xxx`
3. Verify environment variables loaded

---

## 📚 File Structure

```
src/
├── lib/
│   └── ip-tracker.ts              # IP tracking logic
├── app/
│   ├── admin/
│   │   └── page.tsx               # Admin panel UI
│   └── api/
│       └── admin/
│           └── access-logs/
│               └── route.ts        # API endpoint
├── middleware.ts                   # Request logging middleware
└── .env.local                      # Admin password
```

---

## 🎯 Use Cases

### 1. Monitor User Activity
```
Siapa saja yang akses dashboard?
Kapan mereka akses?
Dari IP mana?
```

### 2. Debug API Issues
```
API endpoint mana yang paling sering diakses?
Ada error dari IP mana?
Browser apa yang mengakses?
```

### 3. Security Monitoring
```
Ada unusual traffic pattern?
IP yang suspicious?
Access dari geographical location yang berbeda?
```

### 4. Performance Analysis
```
Halaman mana yang paling sering diakses?
Peak time kapan?
User agent apa yang paling banyak?
```

---

## 🚀 Next Features (Optional)

- [ ] Export logs ke CSV/PDF
- [ ] Real-time log streaming
- [ ] Geographic IP mapping
- [ ] Anomaly detection
- [ ] Alert system (email/SMS)
- [ ] Dashboard graph visualization
- [ ] Database persistence
- [ ] Multi-user admin accounts
- [ ] Audit trail untuk admin actions
- [ ] IP whitelist/blacklist

---

## 📞 Support

Jika ada masalah:
1. Check troubleshooting section
2. Verify environment variables
3. Check browser console for errors
4. Restart development server

---

**Last Updated:** 17 November 2024
**Version:** 1.0.0
**Status:** Production Ready
