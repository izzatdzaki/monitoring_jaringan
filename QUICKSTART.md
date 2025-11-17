# ⚡ Quick Start Guide

Setup sistem monitoring Mikrotik dalam 5 menit!

## Prerequisites

- Node.js 18+ & npm
- Mikrotik RouterOS dengan API enabled
- Text editor (VS Code recommended)

## Step 1: Setup Mikrotik (1 menit)

Login ke Mikrotik via SSH/Winbox:

```bash
# Aktifkan API
/ip service enable api

# Buat user monitoring
/user group add name=monitoring policy=read,api,test
/user add name=monitoring password=123456 group=monitoring
```

## Step 2: Configure Environment (1 menit)

Edit `.env.local`:

```env
MT_HOST=192.168.88.1
MT_USER=monitoring
MT_PASS=123456
MT_PORT=8728
```

Sesuaikan dengan IP Mikrotik Anda.

## Step 3: Install Dependencies (2 menit)

```bash
cd c:\laragon\www\monitoring_jaringan
npm install
```

## Step 4: Run Development Server (1 menit)

```bash
npm run dev
```

## Step 5: Access Dashboard

1. Buka browser: http://localhost:3000
2. Click **"Go to Dashboard"**
3. Lihat traffic real-time dari Mikrotik!

---

## Success ✓

Dashboard sekarang menampilkan:
- ✅ Real-time traffic monitoring
- ✅ Upload & Download graph
- ✅ Interface selector
- ✅ Live update setiap 1 detik

---

## Troubleshooting

### API Connection Error
```bash
# Verify Mikrotik API enabled
curl -u monitoring:123456 http://192.168.88.1:8728/rest/interface
```

### Port Already In Use
```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

### Dependencies Issue
```bash
rm -r node_modules package-lock.json
npm install
```

---

## Next Steps

- 📖 Read [README.md](README.md) for full documentation
- 🔧 Configure in [MIKROTIK_SETUP.md](MIKROTIK_SETUP.md)
- 🚀 Deploy using [DEPLOYMENT.md](DEPLOYMENT.md)
- 🛠️ Setup environment in [ENV_SETUP.md](ENV_SETUP.md)

---

**Questions?** Check the documentation files or troubleshooting section above.

Happy monitoring! 🎉
