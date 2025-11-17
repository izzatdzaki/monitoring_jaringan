# Setup Mikrotik RouterOS untuk Monitoring

Panduan lengkap untuk mengkonfigurasi Mikrotik RouterOS agar dapat diakses oleh sistem monitoring.

## Daftar Isi
1. [Persiapan Awal](#persiapan-awal)
2. [Aktifkan API Service](#aktifkan-api-service)
3. [Buat User Monitoring](#buat-user-monitoring)
4. [Setup Firewall (Optional)](#setup-firewall-optional)
5. [Test Koneksi](#test-koneksi)
6. [Troubleshooting](#troubleshooting)

---

## Persiapan Awal

Anda membutuhkan akses admin ke Mikrotik. Gunakan salah satu cara:

### 1. Winbox (GUI)
- Download: https://mikrotik.com/download
- Login dengan username `admin`

### 2. SSH
```bash
ssh admin@192.168.88.1
# Default password: (empty)
```

### 3. Telnet (Tidak recommended)
```bash
telnet 192.168.88.1
```

---

## Aktifkan API Service

### Via Winbox
1. Buka **Winbox**
2. Login ke Mikrotik
3. Navigasi ke **IP → Services**
4. Cari **api** dan **api-ssl**
5. Klik untuk mengaktifkan (check box)
6. Sesuaikan port jika diperlukan (default: 8728 & 8729)

### Via Command Line (SSH/Telnet)

```bash
# Lihat status service
/ip service print

# Aktifkan API
/ip service enable api

# Aktifkan API SSL (recommended untuk production)
/ip service enable api-ssl

# Verifikasi
/ip service print
# Output:
# Flags: X - disabled, D - dynamic
#  #   NAME      PORT  ADDRESS       
#  0   telnet    23    0.0.0.0       
#  1   ftp       21    0.0.0.0       
#  2   www       80    0.0.0.0       
#  3   www-ssl   443   0.0.0.0       
#  4 E ssh       22    0.0.0.0       
#  5   api       8728  0.0.0.0       
#  6   api-ssl   8729  0.0.0.0       
```

---

## Buat User Monitoring

### Buat User Group (Recommended)

```bash
/user group add name=monitoring policy=read,api,test,winbox
```

Penjelasan policies:
- `read` - Bisa membaca konfigurasi
- `api` - Bisa menggunakan API
- `test` - Bisa menjalankan perintah test
- `winbox` - Bisa login via Winbox (optional)

### Buat User

```bash
/user add name=monitoring password=123456 group=monitoring disabled=no
```

### Verifikasi User

```bash
/user print
# Output:
# Flags: X - disabled, D - dynamic
#  #   NAME        GROUP      ADDRESS           LAST-ON
#  0   admin       full                         ...
#  1   monitoring  monitoring                   ...
```

### Test User Login

```bash
# Test dari command line
/user shell-access
# atau cek dari CLI
```

---

## Setup Firewall (Optional)

Jika Next.js Server berada di network berbeda, setup firewall untuk allow akses ke API.

### Allow dari Specific IP

```bash
# Ganti IP_SERVER dengan IP Next.js server Anda
/ip firewall filter add \
  chain=input \
  src-address=IP_SERVER \
  protocol=tcp \
  dst-port=8728 \
  action=accept \
  comment="Allow Monitoring API"
```

### Contoh

```bash
/ip firewall filter add \
  chain=input \
  src-address=192.168.1.100 \
  protocol=tcp \
  dst-port=8728 \
  action=accept \
  comment="Allow Monitoring Server"
```

### Verifikasi Rule

```bash
/ip firewall filter print
# Cari rule yang baru dibuat
```

### Remove Rule (jika perlu)

```bash
/ip firewall filter remove [nomor]
# Contoh:
/ip firewall filter remove 5
```

---

## Test Koneksi

### 1. Test dari Command Line (Linux/Mac)

```bash
# Test connectivity
curl -u monitoring:123456 http://192.168.88.1:8728/rest/interface

# Expected output:
# [{"name":"ether1","type":"ether"},{"name":"ether2","type":"ether"}...]
```

### 2. Test dari Postman

1. Buka Postman
2. Create new request
3. Method: `GET`
4. URL: `http://192.168.88.1:8728/rest/interface`
5. Tab **Authorization** → Type: `Basic Auth`
6. Username: `monitoring`
7. Password: `123456`
8. Send

### 3. Test dari Browser

```
http://192.168.88.1:8728/rest/interface
```

Browser akan minta username & password (Basic Auth).

### 4. Test Traffic API

```bash
curl -u monitoring:123456 \
  -X GET \
  "http://192.168.88.1:8728/rest/interface/monitor-traffic" \
  -H "Content-Type: application/json" \
  -d '{"interface":"ether1","once":"true"}'
```

---

## Troubleshooting

### Error: Connection Refused

**Penyebab:**
- API service tidak diaktifkan
- Port salah
- Firewall block

**Solusi:**
```bash
/ip service print
# Pastikan api dan api-ssl berstatus "E" (enabled)

# Jika disabled, aktifkan:
/ip service enable api
/ip service enable api-ssl

# Check firewall rules
/ip firewall filter print
# Pastikan tidak ada rule yang memblock port 8728
```

---

### Error: 401 Unauthorized

**Penyebab:**
- Username salah
- Password salah
- User tidak punya permission

**Solusi:**
```bash
# Verifikasi username
/user print

# Reset password
/user set monitoring password=newpassword123

# Verifikasi group permissions
/user group print
/user group print [nomor]
```

---

### Error: Invalid Characters

**Penyebab:**
- Password mengandung karakter spesial yang perlu escape

**Solusi:**
- Gunakan password tanpa karakter spesial
- Atau escape karakter dengan backslash

```bash
# Contoh: Password dengan spesial char
/user set monitoring password="Pass@123\!"
```

---

### Koneksi Timeout

**Penyebab:**
- Network unreachable
- Firewall block port

**Solusi:**
```bash
# Test ping dari server
ping 192.168.88.1

# Check firewall di Mikrotik
/ip firewall filter print

# Test port dengan netstat
/tool netstat | grep 8728
```

---

## Security Best Practice

### 1. Jangan Gunakan Admin untuk Monitoring

❌ **Jangan:**
```bash
# Hindari user admin untuk monitoring
MT_USER=admin
```

✅ **Gunakan:**
```bash
# Buat user terpisah dengan limited permission
/user group add name=monitoring policy=read,api,test
/user add name=monitoring password=123456 group=monitoring
```

---

### 2. Gunakan SSL untuk Production

```bash
# Gunakan port 8729 (API-SSL) untuk production
MT_PORT=8729

# Test SSL connection
curl -u monitoring:123456 https://192.168.88.1:8729/rest/interface -k
# Flag -k untuk ignore self-signed certificate
```

---

### 3. Ganti Password Secara Berkala

```bash
# Ganti password setiap 3-6 bulan
/user set monitoring password=newpassword123
# Update juga di .env.local aplikasi Anda
```

---

### 4. Monitor API Access

```bash
# Lihat log koneksi API
/log print where topics~"api"
```

---

## Verifikasi Setup Lengkap

Checklist untuk memverifikasi setup:

- [ ] API service diaktifkan (`/ip service print`)
- [ ] User `monitoring` dibuat (`/user print`)
- [ ] User punya group `monitoring` atau `full`
- [ ] Password sudah diset
- [ ] Firewall tidak memblock port 8728
- [ ] Test koneksi dengan curl berhasil
- [ ] Environment variables sudah diupdate di aplikasi

---

## Contoh Setup Lengkap

```bash
# 1. Aktifkan API
/ip service enable api
/ip service enable api-ssl

# 2. Buat group
/user group add name=monitoring policy=read,api,test,winbox

# 3. Buat user
/user add name=monitoring password=MonitoringSecurePass123 group=monitoring disabled=no

# 4. Setup firewall (jika perlu)
/ip firewall filter add chain=input src-address=192.168.1.0/24 protocol=tcp dst-port=8728 action=accept

# 5. Verifikasi
/user print
/ip service print
/ip firewall filter print
```

---

**Tips:**
- Simpan password yang aman
- Jangan share credentials
- Regular maintenance & update Mikrotik OS
- Backup konfigurasi Mikrotik secara berkala

---

Last Updated: November 17, 2024
