import { NextResponse } from "next/server";
import { getTraffic } from "@/lib/mikrotik";

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { iface: string } }
) {
  try {
    const iface = params.iface;
    
    if (!iface) {
      return NextResponse.json(
        { error: "Interface parameter is required" },
        { status: 400 }
      );
    }

    const data = await getTraffic(iface);
    
    return NextResponse.json({
      interface: iface,
      rx: data.rx,
      tx: data.tx,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch traffic data" },
      { status: 500 }
    );
  }
}
