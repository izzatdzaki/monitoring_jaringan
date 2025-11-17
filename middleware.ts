import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logAccess, getClientIP } from "@/lib/ip-tracker";

export function middleware(request: NextRequest) {
  // Get client IP
  const ip = getClientIP(request);
  
  // Get user agent
  const userAgent = request.headers.get("user-agent") || "Unknown";
  
  // Get path dan method
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Log access (exclude certain paths)
  if (!path.includes("/_next") && !path.includes("/favicon")) {
    logAccess(ip, path, method, userAgent);
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
