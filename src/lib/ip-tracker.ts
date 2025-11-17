/**
 * IP Tracking Middleware & Logger
 * Mencatat setiap akses ke halaman dan API dengan IP address
 */

interface AccessLog {
  id: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  timestamp: string;
  status?: number;
  duration?: number;
}

// In-memory storage (bisa diubah ke database nanti)
const accessLogs: AccessLog[] = [];
const MAX_LOGS = 1000; // Keep last 1000 logs

/**
 * Extract IP address dari request headers
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  // Check various headers yang mungkin berisi IP
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-client-ip") ||
    headers.get("x-cluster-client-ip") ||
    "unknown";

  return ip;
}

/**
 * Log access ke halaman/API
 */
export function logAccess(
  ip: string,
  path: string,
  method: string,
  userAgent: string,
  status?: number,
  duration?: number
): void {
  const log: AccessLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ip,
    userAgent,
    path,
    method,
    timestamp: new Date().toISOString(),
    status,
    duration,
  };

  accessLogs.unshift(log); // Add to beginning

  // Keep only last MAX_LOGS entries
  if (accessLogs.length > MAX_LOGS) {
    accessLogs.pop();
  }

  console.log(`[${method}] ${path} - IP: ${ip} - ${status}`);
}

/**
 * Get all access logs
 */
export function getAllLogs(): AccessLog[] {
  return accessLogs;
}

/**
 * Get logs filtered by criteria
 */
export function getFilteredLogs(
  options?: {
    ip?: string;
    path?: string;
    method?: string;
    limit?: number;
    offset?: number;
  }
): AccessLog[] {
  let filtered = [...accessLogs];

  if (options?.ip) {
    filtered = filtered.filter((log) => log.ip === options.ip);
  }

  if (options?.path) {
    filtered = filtered.filter((log) => log.path.includes(options.path!));
  }

  if (options?.method) {
    filtered = filtered.filter((log) => log.method === options.method);
  }

  const limit = options?.limit || 100;
  const offset = options?.offset || 0;

  return filtered.slice(offset, offset + limit);
}

/**
 * Get unique IPs yang pernah akses
 */
export function getUniqueIPs(): string[] {
  const ips = new Set(accessLogs.map((log) => log.ip));
  return Array.from(ips).sort();
}

/**
 * Get statistics
 */
export function getStats() {
  const uniqueIPs = new Set(accessLogs.map((log) => log.ip)).size;
  const totalAccess = accessLogs.length;
  
  // Count by method
  const methodCount = accessLogs.reduce(
    (acc, log) => {
      acc[log.method] = (acc[log.method] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Count by path
  const pathCount = accessLogs.reduce(
    (acc, log) => {
      acc[log.path] = (acc[log.path] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Count by IP
  const ipCount = accessLogs.reduce(
    (acc, log) => {
      acc[log.ip] = (acc[log.ip] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalAccess,
    uniqueIPs,
    methodCount,
    pathCount,
    ipCount,
    lastAccess: accessLogs[0]?.timestamp || null,
  };
}

/**
 * Clear logs (untuk maintenance)
 */
export function clearLogs(): void {
  accessLogs.length = 0;
  console.log("[ADMIN] Access logs cleared");
}

/**
 * Export logs as JSON
 */
export function exportLogs(): string {
  return JSON.stringify(accessLogs, null, 2);
}
