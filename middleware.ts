import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	// Get the pathname of the request (e.g. /, /profile, /messages)
	const pathname = request.nextUrl.pathname;
	
	// Define protected routes that require authentication
	const protectedRoutes = [
		'/profile',
		'/messages', 
		'/bookings',
		'/admin',
		'/settings'
	];
	
	// Check if the current path is a protected route
	const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
	
	// If it's a protected route, check authentication
	if (isProtectedRoute) {
		try {
			const session = await auth.api.getSession({
				headers: await headers()
			});
			
			if (!session?.user) {
				// Redirect to login page with return URL
				const loginUrl = new URL("/login", request.url);
				loginUrl.searchParams.set("callbackUrl", pathname);
				return NextResponse.redirect(loginUrl);
			}
		} catch (error) {
			console.error("Auth middleware error:", error);
			// If there's an auth error, redirect to login
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(loginUrl);
		}
	}
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  // Protect both API routes and frontend routes
  matcher: [
    '/api/protected/:path*',
    '/profile/:path*',
    '/messages/:path*', 
    '/bookings/:path*',
    '/admin/:path*',
    '/settings/:path*'
  ],
};