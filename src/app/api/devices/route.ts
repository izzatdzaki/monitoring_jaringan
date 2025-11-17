import { NextResponse } from "next/server";
import { getConnectedDevices, getDeviceDetail, getLayer7Statistics } from "@/lib/device-monitor";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const ip = searchParams.get("ip");

    if (action === "devices") {
      const devices = await getConnectedDevices();
      return NextResponse.json({
        devices,
        count: devices.length,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "device-detail" && ip) {
      const detail = await getDeviceDetail(ip);
      if (!detail) {
        return NextResponse.json(
          { error: "Device not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(detail);
    }

    if (action === "applications") {
      const stats = await getLayer7Statistics();
      return NextResponse.json(stats);
    }

    // Default: return device list
    const devices = await getConnectedDevices();
    return NextResponse.json({
      devices,
      count: devices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
