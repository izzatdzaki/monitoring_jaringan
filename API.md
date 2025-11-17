# 📡 API Documentation

Dokumentasi lengkap semua API endpoints sistem monitoring.

## Base URL

```
http://localhost:3000        (Development)
https://example.com          (Production)
```

## Authentication

Semua request ke Mikrotik RouterOS menggunakan **Basic Authentication**.

```
Authorization: Basic base64(username:password)
```

---

## Endpoints

### 1. Get Traffic Data

#### Endpoint
```
GET /api/mikrotik/traffic/:iface
```

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| iface | string | Yes | Interface name (e.g., ether1, ether2, bridge1) |

#### Examples

```bash
# Get traffic untuk interface ether1
curl http://localhost:3000/api/mikrotik/traffic/ether1

# Get traffic untuk interface ether2
curl http://localhost:3000/api/mikrotik/traffic/ether2

# Get traffic untuk bridge
curl http://localhost:3000/api/mikrotik/traffic/bridge1
```

#### Response (Success)

**Status: 200 OK**

```json
{
  "interface": "ether1",
  "rx": 1250000,
  "tx": 950000,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| interface | string | Interface name |
| rx | number | Download speed (bits per second) |
| tx | number | Upload speed (bits per second) |
| timestamp | string | ISO 8601 timestamp |

#### Response (Error)

**Status: 400 Bad Request**
```json
{
  "error": "Interface parameter is required"
}
```

**Status: 500 Internal Server Error**
```json
{
  "error": "Failed to fetch traffic data from Mikrotik"
}
```

#### Use Cases

```typescript
// React Component Example
import { useState, useEffect } from 'react'

export default function TrafficDisplay() {
  const [traffic, setTraffic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const response = await fetch('/api/mikrotik/traffic/ether1')
        const data = await response.json()
        
        if (response.ok) {
          setTraffic(data)
          setError(null)
        } else {
          setError(data.error)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTraffic()
    const interval = setInterval(fetchTraffic, 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <p>Download: {(traffic.rx / 1000000).toFixed(2)} Mbps</p>
      <p>Upload: {(traffic.tx / 1000000).toFixed(2)} Mbps</p>
    </div>
  )
}
```

---

### 2. Get Interface List

#### Endpoint
```
GET /api/mikrotik/interfaces
```

#### Parameters
None

#### Examples

```bash
# Get semua interfaces
curl http://localhost:3000/api/mikrotik/interfaces
```

#### Response (Success)

**Status: 200 OK**

```json
{
  "interfaces": [
    "ether1",
    "ether2",
    "ether3",
    "ether4",
    "bridge1",
    "wlan1"
  ],
  "count": 6
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| interfaces | array | List of interface names |
| count | number | Total number of interfaces |

#### Response (Error)

**Status: 500 Internal Server Error**
```json
{
  "error": "Failed to fetch interfaces from Mikrotik"
}
```

#### Fallback Data

Jika Mikrotik tidak accessible, API akan return default interfaces:

```json
{
  "interfaces": [
    "ether1",
    "ether2",
    "ether3"
  ],
  "count": 3
}
```

#### Use Cases

```typescript
// Fetch interfaces saat component mount
useEffect(() => {
  const fetchInterfaces = async () => {
    try {
      const response = await fetch('/api/mikrotik/interfaces')
      const data = await response.json()
      setInterfaces(data.interfaces)
    } catch (err) {
      console.error('Error:', err)
      // Fallback ke default interfaces
      setInterfaces(['ether1', 'ether2', 'ether3'])
    }
  }

  fetchInterfaces()
}, [])
```

---

## Data Formats

### Traffic Data

```typescript
interface TrafficResponse {
  interface: string
  rx: number              // bits per second
  tx: number              // bits per second
  timestamp: string       // ISO 8601
}
```

### Interface List

```typescript
interface InterfaceListResponse {
  interfaces: string[]
  count: number
}
```

---

## Rate Limiting

Tidak ada rate limiting default, tapi recommendation:

```typescript
// Implement rate limit di production
const MAX_REQUESTS_PER_MINUTE = 100

function checkRateLimit(clientId: string) {
  const now = Date.now()
  const requests = requestLog.get(clientId) || []
  const recent = requests.filter(t => now - t < 60000)
  
  if (recent.length >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Rate limit exceeded')
  }
  
  requestLog.set(clientId, [...recent, now])
}
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Missing or invalid parameters |
| 401 | Unauthorized | Authentication failed |
| 404 | Not Found | Endpoint tidak ditemukan |
| 500 | Internal Server Error | Server error / Mikrotik connection failed |

---

## Performance Tips

### 1. Polling vs WebSocket

**Current Implementation (Polling):**
- Polling setiap 1 detik
- Simple to implement
- Works everywhere
- Some network overhead

**Alternative (WebSocket):**
```typescript
// WebSocket implementation (future enhancement)
import WebSocket from 'ws'

const ws = new WebSocket('wss://localhost:3000/ws')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  updateChart(data)
}
```

### 2. Caching Strategy

```typescript
// Cache responses untuk 500ms
const CACHE_DURATION = 500

const cache = new Map()

export async function getTrafficCached(iface: string) {
  const cached = cache.get(iface)
  
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data
  }
  
  const data = await getTraffic(iface)
  cache.set(iface, { data, time: Date.now() })
  
  return data
}
```

### 3. Batch Requests

```typescript
// Fetch multiple interfaces sekaligus
async function getMultipleTraffic(interfaces: string[]) {
  return Promise.all(
    interfaces.map(iface => 
      fetch(`/api/mikrotik/traffic/${iface}`)
        .then(r => r.json())
    )
  )
}

// Usage
const trafficData = await getMultipleTraffic(['ether1', 'ether2', 'ether3'])
```

---

## Testing

### Using cURL

```bash
# Test connection
curl -i http://localhost:3000/api/mikrotik/interfaces

# Test specific interface
curl -i http://localhost:3000/api/mikrotik/traffic/ether1

# Test invalid interface
curl -i http://localhost:3000/api/mikrotik/traffic/invalid
```

### Using Postman

1. Create new Request
2. Method: `GET`
3. URL: `http://localhost:3000/api/mikrotik/traffic/ether1`
4. Send
5. Check response

### Using JavaScript

```javascript
// Simple test
async function testAPI() {
  try {
    // Test interfaces endpoint
    const ifaceRes = await fetch('/api/mikrotik/interfaces')
    console.log('Interfaces:', await ifaceRes.json())
    
    // Test traffic endpoint
    const trafficRes = await fetch('/api/mikrotik/traffic/ether1')
    console.log('Traffic:', await trafficRes.json())
  } catch (err) {
    console.error('Error:', err)
  }
}

testAPI()
```

---

## Monitoring API Health

```typescript
// Create health check endpoint
export async function GET() {
  try {
    const interfaces = await getInterfaceList()
    
    return NextResponse.json({
      status: 'healthy',
      interfaces: interfaces.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message
      },
      { status: 503 }
    )
  }
}
```

---

## Troubleshooting

### API Returns Error 500

**Check:**
1. Mikrotik API running: `curl http://MT_HOST:8728`
2. Credentials correct in `.env.local`
3. User permissions: `/user print` (in Mikrotik)
4. Firewall rules in Mikrotik

### API Response Slow

**Optimize:**
1. Reduce polling interval (but with rate limit)
2. Implement caching
3. Use batch requests
4. Check network latency: `ping MT_HOST`

### Invalid Interface Error

**Solution:**
1. Get valid interfaces: `curl /api/mikrotik/interfaces`
2. Use interface name from list
3. Check interface status in Mikrotik

---

## API Versioning (Future)

```
/api/v1/mikrotik/traffic/[iface]
/api/v2/mikrotik/traffic/[iface]  (future)
```

---

## Deprecation Policy

- Old endpoints: marked as deprecated
- 6 months transition period
- Clear migration guide provided
- Error messages indicate new endpoint

---

**See Also:**
- [README.md](README.md) - Full documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
