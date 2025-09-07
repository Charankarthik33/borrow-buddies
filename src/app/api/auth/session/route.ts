import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

// Get the handlers from better-auth
const { GET, POST } = toNextJsHandler(auth);

// Export the handlers directly
export { GET, POST };