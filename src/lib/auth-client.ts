"use client"
import { createAuthClient } from "better-auth/react"
import { useEffect, useState } from "react"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
   headers: () => {
      // Include bearer token in all requests
      const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
      return token ? { Authorization: `Bearer ${token}` } : {};
   }
});

type SessionData = {
  data: any;
  isPending: boolean;
  error: any;
  refetch: () => void;
}

export function useSession(): SessionData {
   const [session, setSession] = useState<any>(null);
   const [isPending, setIsPending] = useState(true);
   const [error, setError] = useState<any>(null);

   const refetch = () => {
      setIsPending(true);
      setError(null);
      fetchSession();
   };

   const fetchSession = async () => {
      try {
         // Include bearer token in session check
         const res = await authClient.getSession();
         setSession(res.data);
         setError(null);
      } catch (err) {
         console.error("Session fetch error:", err);
         setSession(null);
         setError(err);
      } finally {
         setIsPending(false);
      }
   };

   useEffect(() => {
      fetchSession();

      // Listen for storage changes to handle login/logout from other tabs
      const handleStorageChange = (event) => {
         if (event.key === "bearer_token") {
            fetchSession();
         }
      };

      if (typeof window !== 'undefined') {
         window.addEventListener('storage', handleStorageChange);
         return () => window.removeEventListener('storage', handleStorageChange);
      }
   }, []);

   return { data: session, isPending, error, refetch };
}