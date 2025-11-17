"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

interface TrafficChartProps {
  iface: string;
  updateInterval?: number;
  maxDataPoints?: number;
}

export default function TrafficChart({
  iface,
  updateInterval = 1000,
  maxDataPoints = 30,
}: TrafficChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Download (RX - bits/s)",
            data: [],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
          {
            label: "Upload (TX - bits/s)",
            data: [],
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: "#ef4444",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        animation: {
          duration: 0,
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                weight: 500 as any,
              },
            },
          },
          filler: {
            propagate: true,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Bits per Second",
            },
            ticks: {
              callback: function (value) {
                if (typeof value === "number") {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + "M";
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(1) + "K";
                  }
                }
                return value;
              },
            },
          },
          x: {
            title: {
              display: true,
              text: "Time",
            },
          },
        },
      },
    });

    setLoading(false);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const fetchTraffic = async () => {
      try {
        const response = await fetch(`/api/mikrotik/traffic/${iface}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const now = new Date().toLocaleTimeString("id-ID");

        const chart = chartInstanceRef.current!;
        chart.data.labels!.push(now);
        chart.data.datasets[0].data.push(data.rx);
        chart.data.datasets[1].data.push(data.tx);

        if (chart.data.labels!.length > maxDataPoints) {
          chart.data.labels!.shift();
          chart.data.datasets[0].data.shift();
          chart.data.datasets[1].data.shift();
        }

        chart.update("none");
        setError(null);
      } catch (err) {
        console.error("Error fetching traffic:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    fetchTraffic();
    const interval = setInterval(fetchTraffic, updateInterval);

    return () => clearInterval(interval);
  }, [iface, updateInterval, maxDataPoints]);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Interface: <span className="text-blue-600">{iface}</span>
        </h2>
        <p className="text-sm text-gray-500">Real-time traffic monitoring</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chart...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="relative h-96 w-full">
          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  );
}
