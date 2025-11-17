'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ConnectionStatus {
  isConnected: boolean;
  message: string;
  timestamp: string;
  responseTime: number;
  error?: string;
}

export default function StatusPage() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/health/check');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        isConnected: false,
        message: 'Failed to check connection',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        responseTime: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();

    if (autoRefresh) {
      const interval = setInterval(checkConnection, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh]);

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking Mikrotik connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">System Status</h1>
          <p className="text-gray-400">Mikrotik Connection Health Check</p>
        </div>

        {/* Status Card */}
        <div
          className={`rounded-lg p-6 mb-6 ${
            status?.isConnected
              ? 'bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/50'
              : 'bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-500/50'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full ${status?.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
              ></div>
              <h2 className={`text-2xl font-bold ${status?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {status?.isConnected ? 'Connected' : 'Disconnected'}
              </h2>
            </div>
            <button
              onClick={checkConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Retry'}
            </button>
          </div>

          <p className={`text-lg mb-4 ${status?.isConnected ? 'text-green-300' : 'text-red-300'}`}>
            {status?.message}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-400">Response Time</p>
              <p className="text-white font-mono">{status?.responseTime}ms</p>
            </div>
            <div>
              <p className="text-gray-400">Last Check</p>
              <p className="text-white font-mono text-xs">
                {status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
          </div>

          {status?.error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">
                <span className="font-semibold">Error:</span> {status.error}
              </p>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-gray-300">Auto-refresh every 5 seconds</span>
          </label>
        </div>

        {/* Help */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Troubleshooting</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>• Check if Mikrotik device is powered on and connected to network</li>
            <li>• Verify connection settings in .env.local file</li>
            <li>• Ensure firewall allows traffic on port 8728</li>
            <li>• Verify credentials (username/password) are correct</li>
            <li>• Try accessing Mikrotik Winbox directly to confirm connectivity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
