/**
 * Mikrotik Configuration & Connection Checker
 * Using Mikrotik API Protocol (Socket-based, not HTTP REST)
 */

// @ts-ignore - No type definitions available for mikrotik
const Mikrotik = require('mikrotik');

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
 * Create Mikrotik API connection
 */
export async function createMikrotikConnection() {
  const config = getMikrotikConfig();
  
  try {
    console.log(`[Mikrotik] Creating connection to ${config.host}:${config.port}`);
    
    return new Mikrotik({
      host: config.host,
      user: config.user,
      password: config.pass,
      port: config.port,
      timeout: 10000,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Mikrotik] Connection creation failed: ${errorMsg}`);
    throw error;
  }
}

/**
 * Check connection to Mikrotik via API Protocol
 */
export async function checkMikrotikConnection(): Promise<ConnectionCheckResult> {
  const startTime = Date.now();
  const config = getMikrotikConfig();

  try {
    console.log(`[Connection Check] Connecting to ${config.host}:${config.port} using API Protocol`);
    
    const connection = new Mikrotik({
      host: config.host,
      user: config.user,
      password: config.pass,
      port: config.port,
      timeout: 10000,
    });

    // Test query to verify connection
    const result = await connection.query('/system/identity', {});
    
    connection.close();
    const responseTime = Date.now() - startTime;

    console.log(`[Connection Check] ✓ Connected successfully`);
    
    return {
      isConnected: true,
      message: `Connected to Mikrotik (${result[0]?.name || 'Unknown Router'})`,
      timestamp: new Date().toISOString(),
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);

    console.log(`[Connection Check] ✗ Error after ${responseTime}ms: ${errorMsg}`);

    if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('timeout')) {
      return {
        isConnected: false,
        message: `Cannot connect to Mikrotik at ${config.host}:${config.port} - Connection timed out or refused`,
        timestamp: new Date().toISOString(),
        responseTime,
        error: 'Connection timeout - Mikrotik API service may be unresponsive',
      };
    } else if (errorMsg.includes('ENOTFOUND') || errorMsg.includes('getaddrinfo')) {
      return {
        isConnected: false,
        message: `Cannot resolve Mikrotik host: ${config.host}`,
        timestamp: new Date().toISOString(),
        responseTime,
        error: 'Host unreachable',
      };
    } else if (errorMsg.includes('invalid user') || errorMsg.includes('authentication')) {
      return {
        isConnected: false,
        message: `Authentication failed - Check username and password`,
        timestamp: new Date().toISOString(),
        responseTime,
        error: 'Invalid credentials',
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
