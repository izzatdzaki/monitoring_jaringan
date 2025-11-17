"use client";

import { useState } from "react";

interface AccessLog {
  id: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  timestamp: string;
  status?: number;
}

interface Stats {
  totalAccess: number;
  uniqueIPs: number;
  methodCount: Record<string, number>;
  pathCount: Record<string, number>;
  ipCount: Record<string, number>;
  lastAccess: string | null;
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterIP, setFilterIP] = useState("");
  const [filterPath, setFilterPath] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
      fetchData();
    } else {
      setError("Invalid password");
    }
  };

  const fetchData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

      // Fetch stats
      const statsRes = await fetch(
        `/api/admin/access-logs?action=stats&adminPassword=${adminPassword}`
      );
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch logs
      const logsRes = await fetch(
        `/api/admin/access-logs?limit=50&offset=0&adminPassword=${adminPassword}`
      );
      const logsData = await logsRes.json();
      setLogs(logsData.logs);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      const params = new URLSearchParams({
        action: "filter",
        adminPassword: adminPassword || "",
        limit: "50",
        offset: "0",
      });

      if (filterIP) params.append("ip", filterIP);
      if (filterPath) params.append("path", filterPath);

      const res = await fetch(`/api/admin/access-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter logs");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-6">Admin Panel</h1>
          <p className="text-gray-400 mb-6">Access Logs Monitoring</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              Login
            </button>
          </form>

          <p className="text-gray-500 text-xs mt-6">
            Hint: Check .env.local for ADMIN_PASSWORD
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">Access Logs & IP Tracking</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Total Access</p>
              <p className="text-white text-3xl font-bold">{stats.totalAccess}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Unique IPs</p>
              <p className="text-white text-3xl font-bold">{stats.uniqueIPs}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">GET Requests</p>
              <p className="text-white text-3xl font-bold">{stats.methodCount.GET || 0}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">POST Requests</p>
              <p className="text-white text-3xl font-bold">{stats.methodCount.POST || 0}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Last Access</p>
              <p className="text-white text-sm">
                {stats.lastAccess
                  ? new Date(stats.lastAccess).toLocaleTimeString("id-ID")
                  : "N/A"}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Filter Logs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Filter by IP</label>
              <input
                type="text"
                value={filterIP}
                onChange={(e) => setFilterIP(e.target.value)}
                placeholder="e.g., 192.168.1.1"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Filter by Path</label>
              <input
                type="text"
                value={filterPath}
                onChange={(e) => setFilterPath(e.target.value)}
                placeholder="e.g., /api/mikrotik"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={filterLogs}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                Filter
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 overflow-x-auto">
          <h2 className="text-xl font-bold text-white mb-4">Access Logs</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading...</p>
            </div>
          )}

          {!loading && logs.length > 0 && (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">Timestamp</th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">IP Address</th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">Method</th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">Path</th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700 transition-all">
                    <td className="text-gray-300 py-3 px-4 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString("id-ID")}
                    </td>
                    <td className="text-blue-400 py-3 px-4 font-mono">{log.ip}</td>
                    <td className="text-gray-300 py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          log.method === "GET"
                            ? "bg-blue-900 text-blue-300"
                            : log.method === "POST"
                            ? "bg-green-900 text-green-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="text-gray-300 py-3 px-4 truncate">{log.path}</td>
                    <td className="text-gray-400 py-3 px-4 truncate text-xs">{log.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && logs.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
