import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	// Only protect actual route pages that exist
	// The main app uses single-page architecture, so we don't need to protect
	// virtual routes like /profile, /messages, etc.
	
	const session = await auth.api.getSession({
		headers: await headers()
	})
 
	if(!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  // Only protect actual API routes that require authentication
  // Remove protection for virtual routes since they're handled in the main page component
  matcher: ["/api/protected/:path*"], // Only protect API routes that actually need auth
};