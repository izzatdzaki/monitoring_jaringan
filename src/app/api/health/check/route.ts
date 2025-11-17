import { checkMikrotikConnection, logMikrotikConfig } from '@/lib/mikrotik-config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    logMikrotikConfig();
    const result = await checkMikrotikConnection();

    if (result.isConnected) {
      console.log(`✓ ${result.message} (${result.responseTime}ms)`);
    } else {
      console.log(`✗ ${result.message}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Connection check error:', errorMsg);

    return NextResponse.json(
      {
        isConnected: false,
        message: 'Failed to check connection',
        error: errorMsg,
        timestamp: new Date().toISOString(),
        responseTime: 0,
      },
      { status: 500 }
    );
  }
}
