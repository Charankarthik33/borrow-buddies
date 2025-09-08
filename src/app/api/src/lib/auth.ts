import { NextRequest, NextResponse } from 'next/server';

export interface User {
  id: string;
  name?: string;
  email?: string;
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return null;
    }
    
    // For demo purposes, return mock user if token is provided
    return {
      id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
      name: 'Demo User',
      email: 'demo@example.com'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export const auth = {
  // Placeholder auth object for better-auth integration
  // In a real implementation, this would import from your auth config
};