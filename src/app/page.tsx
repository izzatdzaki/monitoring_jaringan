import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Network Monitoring System
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Real-time traffic monitoring for Mikrotik RouterOS
          </p>
          <p className="text-gray-500 text-sm">
            Built with Next.js &amp; Chart.js
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
          <div className="pt-4">
            <p className="text-gray-400 text-sm">
              Make sure your Mikrotik RouterOS is configured and accessible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
