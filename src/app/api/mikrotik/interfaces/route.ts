import { NextResponse } from "next/server";
import { getInterfaceList } from "@/lib/mikrotik";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const interfaces = await getInterfaceList();
    
    return NextResponse.json({
      interfaces: interfaces,
      count: interfaces.length,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch interfaces" },
      { status: 500 }
    );
  }
}
