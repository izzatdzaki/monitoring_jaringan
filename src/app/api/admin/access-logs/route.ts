import { NextResponse } from "next/server";
import { getAllLogs, getFilteredLogs, getStats, getUniqueIPs } from "@/lib/ip-tracker";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const ip = searchParams.get("ip");
    const path = searchParams.get("path");
    const method = searchParams.get("method");

    // Check simple auth (password dari query param)
    const adminPassword = searchParams.get("adminPassword");
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (action === "stats") {
      return NextResponse.json(getStats());
    }

    if (action === "unique-ips") {
      return NextResponse.json({ ips: getUniqueIPs() });
    }

    if (action === "filter") {
      return NextResponse.json({
        logs: getFilteredLogs({ 
          ip: ip || undefined, 
          path: path || undefined, 
          method: method || undefined, 
          limit, 
          offset 
        }),
        total: getAllLogs().length,
      });
    }

    // Default: return all logs
    return NextResponse.json({
      logs: getFilteredLogs({ limit, offset }),
      total: getAllLogs().length,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
