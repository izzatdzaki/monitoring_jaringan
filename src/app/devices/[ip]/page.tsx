"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ApplicationUsage {
  name: string;
  dataUsed: number;
  accessCount: number;
  lastAccess: string;
}

interface DeviceDetail {
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
  applications: ApplicationUsage[];
  currentConnections: number;
  rx: number;
  tx: number;
  rxTotal: number;
  txTotal: number;
}

export default function DeviceDetailPage() {
  const params = useParams();
  const ip = params.ip as string;
  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeviceDetail = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/devices?action=device-detail&ip=${encodeURIComponent(ip)}`
      );
      if (response.status === 404) {
        setError("Device not found");
        return;
      }
      const data = await response.json();
      setDevice(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch device");
    } finally {
      setLoading(false);
    }
  }, [ip]);

  useEffect(() => {
    fetchDeviceDetail();
    const interval = setInterval(fetchDeviceDetail, 2000);
    return () => clearInterval(interval);
  }, [fetchDeviceDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading device details...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/devices"
            className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
          >
            ← Back to Devices
          </Link>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || "Device not found"}
          </div>
        </div>
      </div>
    );
  }

  const totalData = device.totalDown + device.totalUp;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/devices"
            className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
          >
            ← Back to Devices
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            {device.hostname || device.ip}
          </h1>
          <p className="text-gray-400">
            IP: {device.ip} | MAC: {device.mac}
          </p>
        </div>

        {/* Device Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Status</p>
            <p
              className={`text-xl font-bold ${
                device.isOnline ? "text-green-400" : "text-red-400"
              }`}
            >
              {device.isOnline ? "Online" : "Offline"}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Current Download</p>
            <p className="text-white text-3xl font-bold">
              {device.downloadSpeed.toFixed(2)} Mbps
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Current Upload</p>
            <p className="text-white text-3xl font-bold">
              {device.uploadSpeed.toFixed(2)} Mbps
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Data Used</p>
            <p className="text-white text-3xl font-bold">
              {(totalData / 1000000000).toFixed(2)} GB
            </p>
          </div>
        </div>

        {/* Traffic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Download</p>
            <p className="text-white text-2xl font-bold">
              {(device.totalDown / 1000000000).toFixed(2)} GB
            </p>
            <p className="text-gray-500 text-xs mt-1">Total downloaded</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Upload</p>
            <p className="text-white text-2xl font-bold">
              {(device.totalUp / 1000000000).toFixed(2)} GB
            </p>
            <p className="text-gray-500 text-xs mt-1">Total uploaded</p>
          </div>
        </div>

        {/* Device Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Interface</p>
            <p className="text-white font-bold">{device.interface}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Connections</p>
            <p className="text-white font-bold">
              {device.currentConnections} active
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Last Seen</p>
            <p className="text-white font-bold text-xs">
              {new Date(device.lastSeen).toLocaleTimeString("id-ID")}
            </p>
          </div>
        </div>

        {/* Applications/Websites Accessed */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Applications & Websites Accessed
          </h2>

          <div className="space-y-4">
            {device.applications.map((app, index) => (
              <div
                key={index}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-bold">{app.name}</h3>
                  <span className="text-gray-400 text-sm">
                    {app.accessCount} times
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-300 text-sm">
                    Data used: {(app.dataUsed / 1000000).toFixed(2)} MB
                  </div>
                  <div className="text-gray-400 text-xs">
                    Last accessed:{" "}
                    {new Date(app.lastAccess).toLocaleTimeString("id-ID")}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(app.dataUsed / totalData) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {device.applications.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No application data available</p>
              <p className="text-sm mt-2">
                Note: Requires Layer7 DPI setup in Mikrotik
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-lg p-4 text-blue-100">
          <h3 className="font-bold mb-2">About Layer7 Monitoring</h3>
          <p className="text-sm">
            To see detailed application/website access logs, enable Layer7
            firewall rules in Mikrotik RouterOS. This allows tracking of
            Facebook, YouTube, WhatsApp, Instagram, Gaming, Streaming, and
            custom website patterns.
          </p>
        </div>
      </div>
    </div>
  );
}
