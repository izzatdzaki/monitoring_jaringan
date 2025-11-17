# Konfigurasi Environment

Dokumentasi lengkap untuk konfigurasi environment variables.

## File: `.env.local`

Copy dari `.env.example` dan sesuaikan dengan konfigurasi Mikrotik Anda.

```bash
cp .env.example .env.local
```

## Variables

### `MT_HOST` (Required)
IP Address atau hostname Mikrotik RouterOS.

```env
MT_HOST=192.168.88.1
# atau
MT_HOST=mikrotik.example.com
```

### `MT_USER` (Required)
Username user monitoring di Mikrotik.

```env
MT_USER=monitoring
```

### `MT_PASS` (Required)
Password user monitoring.

```env
MT_PASS=123456
```

**Catatan:** Jangan gunakan karakter spesial yang perlu escape.

### `MT_PORT` (Optional)
Port API Mikrotik.

```env
MT_PORT=8728              # Default (plaintext)
# atau
MT_PORT=8729              # SSL/TLS
```

## Contoh Lengkap

### Local Development
```env
MT_HOST=192.168.88.1
MT_USER=monitoring
MT_PASS=123456
MT_PORT=8728
```

### Production (Remote)
```env
MT_HOST=monitor.example.com
MT_USER=monitoring
MT_PASS=SuperSecurePassword123!
MT_PORT=8729              # Gunakan SSL
```

### Docker
```env
MT_HOST=mikrotik-container
MT_USER=monitoring
MT_PASS=${MIKROTIK_PASS}  # From secrets
MT_PORT=8728
```

## Keamanan

⚠️ **JANGAN commit `.env.local` ke Git**

File `.gitignore` sudah di-set untuk ignore:
- `.env.local`
- `.env`
- `node_modules/`

---

**Tips:**
- Gunakan user terpisah untuk monitoring (bukan admin)
- Gunakan password yang kuat di production
- Rotate password secara berkala
- Gunakan SSL (port 8729) untuk production

