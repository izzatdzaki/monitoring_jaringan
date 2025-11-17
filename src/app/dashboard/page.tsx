"use client";

import { useState, useEffect } from "react";
import TrafficChart from "@/components/TrafficChart";

export default function Dashboard() {
  const [interfaces, setInterfaces] = useState<string[]>([]);
  const [selectedInterface, setSelectedInterface] = useState("ether1");
  const [loadingInterfaces, setLoadingInterfaces] = useState(true);

  useEffect(() => {
    const fetchInterfaces = async () => {
      try {
        setLoadingInterfaces(true);
        // Fetch dari endpoint yang akan kita buat
        const response = await fetch("/api/mikrotik/interfaces");
        const data = await response.json();
        
        if (data.interfaces && Array.isArray(data.interfaces)) {
          setInterfaces(data.interfaces);
          setSelectedInterface(data.interfaces[0] || "ether1");
        } else {
          // Fallback ke interface default
          setInterfaces(["ether1", "ether2", "ether3"]);
          setSelectedInterface("ether1");
        }
      } catch (err) {
        console.error("Error fetching interfaces:", err);
        // Fallback ke interface default
        setInterfaces(["ether1", "ether2", "ether3"]);
        setSelectedInterface("ether1");
      } finally {
        setLoadingInterfaces(false);
      }
    };

    fetchInterfaces();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Network Monitoring System
          </h1>
          <p className="text-gray-400">
            Real-time traffic monitoring from Mikrotik RouterOS
          </p>
        </div>

        {/* Interface Selector */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
          <label className="block text-white text-sm font-medium mb-3">
            Select Interface
          </label>
          <div className="flex flex-wrap gap-3">
            {loadingInterfaces ? (
              <p className="text-gray-400">Loading interfaces...</p>
            ) : (
              interfaces.map((iface) => (
                <button
                  key={iface}
                  onClick={() => setSelectedInterface(iface)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedInterface === iface
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {iface}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chart Container */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
          <TrafficChart 
            iface={selectedInterface} 
            updateInterval={1000}
            maxDataPoints={30}
          />
        </div>

        {/* Info Footer */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Update Interval</p>
            <p className="text-white text-xl font-bold">1 Second</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Data Points</p>
            <p className="text-white text-xl font-bold">30 records</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-green-400 text-xl font-bold">Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
