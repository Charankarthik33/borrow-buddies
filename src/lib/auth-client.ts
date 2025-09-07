"use client"
import { useEffect, useState, useCallback } from "react"

// Custom auth client that works with our working auth endpoints
export const authClient = {
  async signUp(data: { name: string; email: string; password: string }) {
    const response = await fetch('/api/auth-working/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: { code: result.code || 'SIGNUP_FAILED', message: result.error } };
    }

    return { data: result, error: null };
  },

  async signIn(data: { email: string; password: string }) {
    const response = await fetch('/api/auth-working/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: { code: result.code || 'SIGNIN_FAILED', message: result.error } };
    }

    return { data: result, error: null };
  },

  async signOut() {
    const response = await fetch('/api/auth-working/session', {
      method: 'DELETE',
      credentials: 'include',
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: { code: result.code || 'SIGNOUT_FAILED', message: result.error } };
    }

    return { data: result, error: null };
  },

  async getSession() {
    const response = await fetch('/api/auth-working/session', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return { data: null, error: { code: 'SESSION_FETCH_FAILED', message: 'Failed to fetch session' } };
    }

    const result = await response.json();
    return { data: result, error: null };
  }
};

// Custom useSession hook
export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSession = useCallback(async () => {
    try {
      setIsPending(true);
      setError(null);
      
      const { data, error } = await authClient.getSession();
      
      if (error) {
        setSession(null);
        setError(error);
      } else {
        setSession(data);
        setError(null);
      }
    } catch (err) {
      setSession(null);
      setError({ code: 'FETCH_ERROR', message: 'Failed to fetch session' });
    } finally {
      setIsPending(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { 
    data: session, 
    isPending, 
    error, 
    refetch 
  };
}