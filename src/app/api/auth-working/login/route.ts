import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, session, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Password is required",
        code: "MISSING_PASSWORD" 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT" 
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const users = await db.select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json({ 
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS" 
      }, { status: 401 });
    }

    const foundUser = users[0];

    // Find account with password for this user (using 'email' provider as set in registration)
    const accounts = await db.select()
      .from(account)
      .where(and(
        eq(account.userId, foundUser.id),
        eq(account.providerId, 'email')
      ))
      .limit(1);

    if (accounts.length === 0 || !accounts[0].password) {
      return NextResponse.json({ 
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS" 
      }, { status: 401 });
    }

    const userAccount = accounts[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userAccount.password);
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS" 
      }, { status: 401 });
    }

    // Generate session token and ID
    const sessionToken = nanoid(64); // Use nanoid for secure token generation
    const sessionId = nanoid(32);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const now = new Date();

    // Get request headers for session metadata
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create session
    const newSession = await db.insert(session)
      .values({
        id: sessionId,
        token: sessionToken,
        userId: foundUser.id,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        ipAddress,
        userAgent
      })
      .returning();

    if (newSession.length === 0) {
      return NextResponse.json({ 
        error: "Failed to create session",
        code: "SESSION_CREATION_FAILED" 
      }, { status: 500 });
    }

    // Set session cookie and return success response
    const response = NextResponse.json({
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        emailVerified: foundUser.emailVerified,
        image: foundUser.image,
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt
      },
      session: {
        id: newSession[0].id,
        token: sessionToken,
        expiresAt: newSession[0].expiresAt,
        createdAt: newSession[0].createdAt
      },
      message: "Login successful"
    }, { status: 200 });

    // Set session cookie
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('POST login error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}