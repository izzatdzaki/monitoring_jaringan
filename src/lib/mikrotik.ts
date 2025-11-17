/**
 * RouterOS API Client untuk Next.js
 * Dokumentasi: https://wiki.mikrotik.com/wiki/Manual:API
 */

export interface TrafficData {
  rx: number;
  tx: number;
}

let cachedData: { [key: string]: TrafficData & { timestamp: number } } = {};

/**
 * Fetch traffic data dari Mikrotik RouterOS via REST API
 * Gunakan endpoint REST API Mikrotik di port 8728 atau 8729
 */
export async function getTraffic(iface: string): Promise<TrafficData> {
  try {
    const host = process.env.MT_HOST || "192.168.88.1";
    const user = process.env.MT_USER || "admin";
    const password = process.env.MT_PASS || "";
    const port = process.env.MT_PORT || "8728";

    // Untuk dokumentasi, kami menggunakan REST API approach
    // Pastikan Mikrotik telah mengaktifkan REST API atau menggunakan HTTP API
    
    const auth = Buffer.from(`${user}:${password}`).toString("base64");
    const url = `http://${host}:${port}/rest/interface/monitor-traffic`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        interface: iface,
        once: true,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();

    // Parse hasil dari API Mikrotik
    const rx = Array.isArray(data) && data[0]
      ? Number(data[0]["rx-bits-per-second"] || 0)
      : Number(data["rx-bits-per-second"] || 0);
    
    const tx = Array.isArray(data) && data[0]
      ? Number(data[0]["tx-bits-per-second"] || 0)
      : Number(data["tx-bits-per-second"] || 0);

    const result = { rx, tx };
    
    // Cache hasil untuk 1 detik
    cachedData[iface] = {
      ...result,
      timestamp: Date.now(),
    };

    return result;
  } catch (error) {
    console.error("Error fetching traffic:", error);
    
    // Return cached data jika tersedia
    if (cachedData[iface] && Date.now() - cachedData[iface].timestamp < 5000) {
      return {
        rx: cachedData[iface].rx,
        tx: cachedData[iface].tx,
      };
    }

    // Return mock data untuk demo jika tidak ada koneksi
    return {
      rx: Math.random() * 5000000 + 1000000,
      tx: Math.random() * 3000000 + 500000,
    };
  }
}

export async function getInterfaceList(): Promise<string[]> {
  try {
    const host = process.env.MT_HOST || "192.168.88.1";
    const user = process.env.MT_USER || "admin";
    const password = process.env.MT_PASS || "";
    const port = process.env.MT_PORT || "8728";

    const auth = Buffer.from(`${user}:${password}`).toString("base64");
    const url = `http://${host}:${port}/rest/interface`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract interface names dari response
    const interfaces = Array.isArray(data)
      ? data.map((iface: any) => iface.name).filter((name: any) => name)
      : [];

    return interfaces.length > 0 ? interfaces : ["ether1", "ether2", "ether3"];
  } catch (error) {
    console.error("Error fetching interfaces:", error);
    // Return default interfaces untuk demo
    return ["ether1", "ether2", "ether3"];
  }
}

