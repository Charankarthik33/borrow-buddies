import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Create the Next.js handler from better-auth
const handler = toNextJsHandler(auth);

// Export the handlers
export const { GET, POST } = handler;

// Debug: Add a catch-all function to log requests
export async function OPTIONS(request: Request) {
  console.log('OPTIONS request to auth endpoint');
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Add debug logging
console.log('Auth route handler initialized', { 
  hasGET: !!handler.GET, 
  hasPOST: !!handler.POST 
});