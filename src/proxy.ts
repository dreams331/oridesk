import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return (await auth(() => NextResponse.next()))(request, {} as never);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/client/:path*",
    "/agent/:path*",
  ],
};
