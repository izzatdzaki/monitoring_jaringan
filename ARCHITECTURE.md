# 🏗️ Architecture & Design

Dokumentasi arsitektur teknis sistem monitoring.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (Browser)                      │
├─────────────────────────────────────────────────────────────────┤
│  - React Components (Next.js)                                    │
│  - Tailwind CSS Styling                                          │
│  - Chart.js Visualization                                        │
│  - WebSocket/Polling untuk real-time update                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER (Next.js)                    │
├─────────────────────────────────────────────────────────────────┤
│  API Routes:                                                      │
│  ├─ /api/mikrotik/traffic/[iface]                                │
│  ├─ /api/mikrotik/interfaces                                     │
│  │                                                                │
│  Business Logic:                                                  │
│  ├─ Traffic data fetching                                        │
│  ├─ Caching & rate limiting                                      │
│  ├─ Error handling                                               │
│  │                                                                │
│  Services:                                                        │
│  └─ mikrotik.ts (RouterOS API client)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            INTEGRATION LAYER (Mikrotik REST API)                 │
├─────────────────────────────────────────────────────────────────┤
│  - Basic Auth (username:password)                                │
│  - HTTP/HTTPS (port 8728/8729)                                   │
│  - JSON Response Format                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ TCP/IP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│          DATA SOURCE LAYER (Mikrotik RouterOS)                   │
├─────────────────────────────────────────────────────────────────┤
│  - Interface Monitoring                                          │
│  - Real-time traffic statistics                                  │
│  - System information                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
monitoring_jaringan/
│
├── src/
│   │
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout component
│   │   ├── page.tsx                      # Home page
│   │   ├── globals.css                   # Global styles
│   │   │
│   │   ├── api/                          # API Routes
│   │   │   └── mikrotik/
│   │   │       ├── traffic/
│   │   │       │   └── [iface]/
│   │   │       │       └── route.ts      # GET /api/mikrotik/traffic/ether1
│   │   │       └── interfaces/
│   │   │           └── route.ts          # GET /api/mikrotik/interfaces
│   │   │
│   │   └── dashboard/
│   │       └── page.tsx                  # Dashboard page with chart
│   │
│   ├── lib/                              # Utilities & Services
│   │   └── mikrotik.ts                   # Mikrotik API client
│   │
│   └── components/                       # React Components
│       └── TrafficChart.tsx              # Chart component
│
├── public/                               # Static assets
│   └── (favicon, images, etc)
│
├── Configuration Files
│   ├── package.json                      # Dependencies & scripts
│   ├── tsconfig.json                     # TypeScript config
│   ├── next.config.js                    # Next.js config
│   ├── tailwind.config.ts                # Tailwind config
│   ├── postcss.config.js                 # PostCSS config
│   └── .eslintrc.json                    # ESLint config
│
├── Environment
│   ├── .env.local                        # Local env variables
│   ├── .env.example                      # Env template
│   └── .gitignore                        # Git ignore rules
│
└── Documentation
    ├── README.md                         # Full documentation
    ├── QUICKSTART.md                     # Quick start guide
    ├── MIKROTIK_SETUP.md                 # Mikrotik configuration
    ├── ENV_SETUP.md                      # Environment setup
    └── DEPLOYMENT.md                     # Deployment guide
```

---

## Component Architecture

### Pages Layer

```typescript
// /dashboard/page.tsx
// Entry point untuk dashboard
// Mengurus state management
// Render chart component

export default function Dashboard() {
  // State management
  const [interfaces, setInterfaces] = useState([])
  const [selectedInterface, setSelectedInterface] = useState("ether1")
  
  // Fetch interfaces dari API
  useEffect(() => {
    fetch('/api/mikrotik/interfaces')
  }, [])
  
  // Render dashboard UI
  return (
    <div>
      <InterfaceSelector interfaces={interfaces} />
      <TrafficChart iface={selectedInterface} />
    </div>
  )
}
```

### Component Layer

```typescript
// /components/TrafficChart.tsx
// Presentational component
// Chart visualization
// Real-time polling

export default function TrafficChart({ iface }) {
  // Setup Chart.js
  useEffect(() => {
    initChart()
  }, [])
  
  // Polling untuk data
  useEffect(() => {
    fetchTraffic()
    setInterval(fetchTraffic, 1000)
  }, [iface])
  
  // Render canvas + error handling
  return <canvas ref={chartRef} />
}
```

### API Layer

```typescript
// /api/mikrotik/traffic/[iface]/route.ts
// API endpoint
// Request validation
// Error handling

export async function GET(req, { params }) {
  try {
    const data = await getTraffic(params.iface)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

### Service Layer

```typescript
// /lib/mikrotik.ts
// Business logic
// Mikrotik API communication
// Data transformation

export async function getTraffic(iface: string) {
  // Build request
  const auth = Buffer.from(`${user}:${pass}`).toString('base64')
  const url = `http://${host}:${port}/rest/interface/monitor-traffic`
  
  // Fetch from Mikrotik
  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` }
  })
  
  // Parse & return data
  return {
    rx: Number(data["rx-bits-per-second"]),
    tx: Number(data["tx-bits-per-second"])
  }
}
```

---

## Data Flow

### Real-time Update Flow

```
1. Dashboard Component Mount
   └─ Initialize Chart.js
   
2. SetInterval (1000ms)
   └─ Fetch /api/mikrotik/traffic/ether1
   
3. API Route Handler
   └─ Call getTraffic() from mikrotik.ts
   
4. Mikrotik Service
   ├─ Build REST API request
   ├─ Send HTTP request to Mikrotik
   ├─ Parse response
   └─ Return { rx, tx }
   
5. API Response
   └─ Return JSON to client
   
6. Chart Component
   ├─ Update chart data
   ├─ Keep last 30 points
   ├─ Render chart update
   └─ SetInterval waits 1 second
   
7. Repeat from Step 2
```

---

## Request/Response Examples

### Get Traffic Data

**Request:**
```http
GET /api/mikrotik/traffic/ether1 HTTP/1.1
Host: localhost:3000
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

### Get Interfaces

**Request:**
```http
GET /api/mikrotik/interfaces HTTP/1.1
Host: localhost:3000
```

**Response:**
```json
{
  "interfaces": ["ether1", "ether2", "bridge1"],
  "count": 3
}
```

---

## Error Handling Strategy

```typescript
// Multi-layer error handling

// 1. API Level
export async function GET(req, { params }) {
  try {
    const data = await getTraffic(params.iface)
    return NextResponse.json(data)
  } catch (error) {
    // Return 500 with error message
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// 2. Service Level
export async function getTraffic(iface: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return parseData(await response.json())
  } catch (error) {
    // Use cached data if available
    if (hasCache(iface)) return getCache(iface)
    // Return mock data for demo
    return mockTrafficData()
  }
}

// 3. Component Level
function TrafficChart({ iface }) {
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchTraffic().catch(err => {
      setError(err.message)
    })
  }, [iface])
  
  if (error) return <ErrorDisplay message={error} />
  return <Chart />
}
```

---

## Performance Considerations

### Caching Strategy

```typescript
// Cache traffic data untuk 1 detik
const cache = new Map()

export function getCache(iface: string) {
  const cached = cache.get(iface)
  if (cached && Date.now() - cached.timestamp < 1000) {
    return cached.data
  }
  return null
}

export function setCache(iface: string, data: TrafficData) {
  cache.set(iface, {
    data,
    timestamp: Date.now()
  })
}
```

### Rate Limiting

```typescript
const requestCounts = new Map()

export function checkRateLimit(key: string, limit = 100) {
  const now = Date.now()
  const requests = requestCounts.get(key) || []
  const recent = requests.filter(t => now - t < 60000)
  
  if (recent.length >= limit) return false
  requestCounts.set(key, [...recent, now])
  return true
}
```

### Browser-side Optimization

```typescript
// Chart.js animation disabled
const chart = new Chart(ctx, {
  options: {
    animation: false,  // No animation = better performance
  },
})

// Limit data points
if (chart.data.labels.length > 30) {
  chart.data.labels.shift()
  chart.data.datasets.forEach(d => d.data.shift())
}

// Use requestAnimationFrame for smooth updates
useEffect(() => {
  const update = () => {
    chart.update('none')  // Don't re-animate
    requestAnimationFrame(update)
  }
  return update
}, [chart])
```

---

## Security Architecture

```
┌─────────────────────────────────────────────┐
│         Browser                              │
│  (React Component + Chart.js)                │
└──────────────┬──────────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────────┐
│    Next.js Server (App Router)               │
│  - Rate Limiting                             │
│  - Input Validation                          │
│  - Error Handling                            │
└──────────────┬──────────────────────────────┘
               │ HTTPS/Basic Auth
               ▼
┌─────────────────────────────────────────────┐
│    Mikrotik RouterOS                         │
│  - User Authentication                       │
│  - Permission Control                        │
│  - Audit Logging                             │
└─────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Single Interface Monitoring
- Memory: ~10MB
- CPU: <1%
- Update Interval: 1 second

### Multi-Interface Monitoring
- Each interface: ~5MB
- Consider database for historical data
- Implement caching layer (Redis)

### Production Deployment
- Load balancer (Nginx)
- Multiple app instances (PM2 cluster)
- Database for persistence
- Cache layer (Redis)
- Monitoring & alerting

---

**See Also:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production setup
- [README.md](README.md) - Full documentation
- [MIKROTIK_SETUP.md](MIKROTIK_SETUP.md) - Mikrotik configuration
