"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Device {
  id: string;
  ip: string;
  mac: string;
  hostname?: string;
  interface: string;
  uploadSpeed: number;
  downloadSpeed: number;
  totalUp: number;
  totalDown: number;
  isOnline: boolean;
  lastSeen: string;
  firstSeen: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterInterface, setFilterInterface] = useState("all");

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 3000); // Update setiap 3 detik
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices?action=devices");
      const data = await response.json();
      setDevices(data.devices || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices =
    filterInterface === "all"
      ? devices
      : devices.filter((d) => d.interface === filterInterface);

  const onlineCount = devices.filter((d) => d.isOnline).length;
  const totalDataDown = devices.reduce((sum, d) => sum + d.totalDown, 0);
  const totalDataUp = devices.reduce((sum, d) => sum + d.totalUp, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Network Devices
            </h1>
            <p className="text-gray-400">
              Monitor all devices connected to your network
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Devices</p>
            <p className="text-white text-3xl font-bold">{devices.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Online</p>
            <p className="text-green-400 text-3xl font-bold">{onlineCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Downloaded</p>
            <p className="text-white text-3xl font-bold">
              {(totalDataDown / 1000000000).toFixed(2)} GB
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Uploaded</p>
            <p className="text-white text-3xl font-bold">
              {(totalDataUp / 1000000000).toFixed(2)} GB
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
          <label className="block text-white text-sm font-medium mb-3">
            Filter by Interface
          </label>
          <div className="flex gap-2 flex-wrap">
            {["all", "ether1", "ether2", "ether3", "ether4", "ether5"].map(
              (iface) => (
                <button
                  key={iface}
                  onClick={() => setFilterInterface(iface)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterInterface === iface
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {iface === "all" ? "All Devices" : iface}
                </button>
              )
            )}
          </div>
        </div>

        {/* Devices Table */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 overflow-x-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading devices...</p>
            </div>
          )}

          {!loading && filteredDevices.length > 0 && (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    Hostname
                  </th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    IP Address
                  </th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    MAC Address
                  </th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    Interface
                  </th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    Download Speed
                  </th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    Upload Speed
                  </th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    Total Data
                  </th>
                  <th className="text-left text-gray-400 font-semibold py-3 px-4">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDevices.map((device) => (
                  <tr
                    key={device.id}
                    className="border-b border-gray-700 hover:bg-gray-700 transition-all"
                  >
                    <td className="text-gray-300 py-3 px-4">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          device.isOnline ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                    </td>
                    <td className="text-gray-300 py-3 px-4">
                      {device.hostname || "N/A"}
                    </td>
                    <td className="text-blue-400 py-3 px-4 font-mono">
                      {device.ip}
                    </td>
                    <td className="text-gray-400 py-3 px-4 font-mono text-xs">
                      {device.mac}
                    </td>
                    <td className="text-gray-300 py-3 px-4">{device.interface}</td>
                    <td className="text-gray-300 py-3 px-4">
                      {device.downloadSpeed.toFixed(2)} Mbps
                    </td>
                    <td className="text-gray-300 py-3 px-4">
                      {device.uploadSpeed.toFixed(2)} Mbps
                    </td>
                    <td className="text-gray-300 py-3 px-4 text-xs">
                      <div>
                        ↓{" "}
                        {(device.totalDown / 1000000000).toFixed(2)} GB
                      </div>
                      <div>
                        ↑{" "}
                        {(device.totalUp / 1000000000).toFixed(2)} GB
                      </div>
                    </td>
                    <td className="text-gray-300 py-3 px-4">
                      <Link
                        href={`/devices/${device.ip}`}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredDevices.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No devices found for selected filter</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-4 text-blue-100">
          <h3 className="font-bold mb-2">Network Topology Info</h3>
          <ul className="text-sm space-y-1">
            <li>• Port 1: Telkomsel ISP (WAN)</li>
            <li>• Port 2: Biznet ISP (WAN)</li>
            <li>• Port 3: Server</li>
            <li>• Port 4: Switch 16 Port (Client PCs)</li>
            <li>• Port 5: PC IT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
