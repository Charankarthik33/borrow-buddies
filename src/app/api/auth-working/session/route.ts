import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { session, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Get current session info
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(null, { status: 200 });
    }

    // Find session with user data
    const sessionData = await db
      .select({
        id: session.id,
        expiresAt: session.expiresAt,
        token: session.token,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        userId: session.userId,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(eq(session.token, sessionToken))
      .limit(1);

    if (sessionData.length === 0) {
      // Session not found, clear cookie
      const response = NextResponse.json(null, { status: 200 });
      response.cookies.delete('session-token');
      return response;
    }

    const sessionRecord = sessionData[0];

    // Check if session is expired
    if (new Date() > sessionRecord.expiresAt) {
      // Session expired, delete it and clear cookie
      await db.delete(session).where(eq(session.token, sessionToken));
      const response = NextResponse.json(null, { status: 200 });
      response.cookies.delete('session-token');
      return response;
    }

    // Return valid session info
    return NextResponse.json({
      id: sessionRecord.id,
      expiresAt: sessionRecord.expiresAt.toISOString(),
      createdAt: sessionRecord.createdAt.toISOString(),
      updatedAt: sessionRecord.updatedAt.toISOString(),
      ipAddress: sessionRecord.ipAddress,
      userAgent: sessionRecord.userAgent,
      user: {
        id: sessionRecord.userId,
        name: sessionRecord.userName,
        email: sessionRecord.userEmail,
        image: sessionRecord.userImage,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('GET session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// Create or validate a session
export async function POST(request: NextRequest) {
  try {
    const { userId, userAgent, ipAddress } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    // Verify user exists
    const userData = await db.select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Generate session token and ID
    const sessionToken = crypto.randomUUID() + '-' + Date.now();
    const sessionId = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

    // Create new session
    const newSession = await db.insert(session)
      .values({
        id: sessionId,
        token: sessionToken,
        userId: userId,
        expiresAt: expiresAt,
        createdAt: now,
        updatedAt: now,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      })
      .returning();

    if (newSession.length === 0) {
      return NextResponse.json({ 
        error: "Failed to create session",
        code: "SESSION_CREATION_FAILED" 
      }, { status: 500 });
    }

    const createdSession = newSession[0];

    // Set session cookie
    const response = NextResponse.json({
      id: createdSession.id,
      token: createdSession.token,
      expiresAt: createdSession.expiresAt.toISOString(),
      createdAt: createdSession.createdAt.toISOString(),
      updatedAt: createdSession.updatedAt.toISOString(),
      ipAddress: createdSession.ipAddress,
      userAgent: createdSession.userAgent,
      user: {
        id: userData[0].id,
        name: userData[0].name,
        email: userData[0].email,
        image: userData[0].image,
      }
    }, { status: 201 });

    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('POST session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// Delete session (logout)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ 
        error: "No active session found",
        code: "NO_SESSION" 
      }, { status: 404 });
    }

    // Delete session from database
    const deleted = await db.delete(session)
      .where(eq(session.token, sessionToken))
      .returning();

    if (deleted.length === 0) {
      // Session not found in database, but clear cookie anyway
      const response = NextResponse.json({ 
        message: "Session cleared successfully" 
      }, { status: 200 });
      response.cookies.delete('session-token');
      return response;
    }

    // Clear session cookie and return success
    const response = NextResponse.json({
      message: "Session deleted successfully",
      deletedSession: {
        id: deleted[0].id,
        token: deleted[0].token,
      }
    }, { status: 200 });

    response.cookies.delete('session-token');
    return response;

  } catch (error) {
    console.error('DELETE session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}