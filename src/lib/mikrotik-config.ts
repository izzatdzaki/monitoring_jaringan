/**
 * Mikrotik Configuration & Connection Checker
 */

export interface MikrotikConfig {
  host: string;
  user: string;
  pass: string;
  port: number;
}

export interface ConnectionCheckResult {
  isConnected: boolean;
  message: string;
  timestamp: string;
  responseTime: number;
  error?: string;
}

/**
 * Get Mikrotik Configuration from environment variables
 */
export function getMikrotikConfig(): MikrotikConfig {
  const host = process.env.MT_HOST || process.env.NEXT_PUBLIC_MIKROTIK_HOST || '192.168.88.1';
  const user = process.env.MT_USER || process.env.NEXT_PUBLIC_MIKROTIK_USER || 'admin';
  const pass = process.env.MT_PASS || process.env.NEXT_PUBLIC_MIKROTIK_PASS || '';
  const port = parseInt(process.env.MT_PORT || '8728', 10);

  return { host, user, pass, port };
}

/**
 * Check connection to Mikrotik
 */
export async function checkMikrotikConnection(): Promise<ConnectionCheckResult> {
  const startTime = Date.now();
  const config = getMikrotikConfig();

  try {
    const auth = `Basic ${Buffer.from(`${config.user}:${config.pass}`).toString('base64')}`;
    const url = `http://${config.host}:${config.port}/rest/system/identity`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return {
        isConnected: true,
        message: `Connected to Mikrotik (${data.name || 'Unknown Router'})`,
        timestamp: new Date().toISOString(),
        responseTime,
      };
    } else if (response.status === 401) {
      return {
        isConnected: false,
        message: 'Authentication failed - Check credentials',
        timestamp: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}`,
      };
    } else {
      return {
        isConnected: false,
        message: `HTTP error ${response.status}`,
        timestamp: new Date().toISOString(),
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes('ECONNREFUSED')) {
      return {
        isConnected: false,
        message: `Cannot connect to Mikrotik at ${config.host}:${config.port} - Connection refused`,
        timestamp: new Date().toISOString(),
        responseTime,
        error: 'ECONNREFUSED',
      };
    } else if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('getaddrinfo')) {
      return {
        isConnected: false,
        message: `Cannot resolve Mikrotik host: ${config.host}`,
        timestamp: new Date().toISOString(),
        responseTime,
        error: 'ENOTFOUND',
      };
    } else if (errorMsg.includes('abort')) {
      return {
        isConnected: false,
        message: `Connection timeout - Mikrotik not responding within 10 seconds`,
        timestamp: new Date().toISOString(),
        responseTime,
        error: 'TIMEOUT',
      };
    }

    return {
      isConnected: false,
      message: `Connection error: ${errorMsg}`,
      timestamp: new Date().toISOString(),
      responseTime,
      error: errorMsg,
    };
  }
}

/**
 * Get Mikrotik Auth Header
 */
export function getMikrotikAuth(config: MikrotikConfig): string {
  return `Basic ${Buffer.from(`${config.user}:${config.pass}`).toString('base64')}`;
}

/**
 * Print configuration status (for logging/debugging)
 */
export function logMikrotikConfig(): void {
  const config = getMikrotikConfig();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔌 Mikrotik Configuration Status');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Password: ${'*'.repeat(Math.max(0, config.pass.length))}`);
  console.log('═══════════════════════════════════════════════════════════');
}
