"use client"
import { createAuthClient } from "better-auth/react"
import { useEffect, useState } from "react"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
   fetchOptions: {
     onSuccess: (ctx) => {
       const authToken = ctx.response.headers.get("set-auth-token")
       if(authToken){
         localStorage.setItem("bearer_token", authToken);
       }
     }
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

   const fetchSession = async () => {
      try {
         setIsPending(true);
         const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
         
         const res = await authClient.getSession({
            fetchOptions: {
               headers: token ? {
                  Authorization: `Bearer ${token}`,
               } : {}
            },
         });
         
         if (res.data?.user) {
            setSession(res.data);
            setError(null);
         } else {
            setSession(null);
         }
      } catch (err) {
         console.error("Session fetch error:", err);
         setSession(null);
         setError(err);
      } finally {
         setIsPending(false);
      }
   };

   const refetch = () => {
      fetchSession();
   };

   useEffect(() => {
      fetchSession();

      // Listen for storage changes to handle login/logout from other tabs
      const handleStorageChange = (event: StorageEvent) => {
         if (event.key === "bearer_token") {
            fetchSession();
         }
      };

      // Listen for focus to refresh session
      const handleFocus = () => {
         fetchSession();
      };

      if (typeof window !== 'undefined') {
         window.addEventListener('storage', handleStorageChange);
         window.addEventListener('focus', handleFocus);
         
         return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
         };
      }
   }, []);

   return { data: session, isPending, error, refetch };
}