import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { follows, user } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId } = body;

    // SECURITY: Check for forbidden fields
    if ('followerId' in body || 'followingId' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required field
    if (!targetUserId) {
      return NextResponse.json({ 
        error: "Target user ID is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate targetUserId is different from current user
    if (targetUserId === currentUser.id) {
      return NextResponse.json({ 
        error: "Cannot follow yourself",
        code: "INVALID_TARGET_USER" 
      }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await db.select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json({ 
        error: "Target user not found",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Check for existing follow request
    const existingFollow = await db.select()
      .from(follows)
      .where(and(
        eq(follows.followerId, currentUser.id),
        eq(follows.followingId, targetUserId)
      ))
      .limit(1);

    if (existingFollow.length > 0) {
      return NextResponse.json({ 
        error: "Follow request already exists",
        code: "DUPLICATE_FOLLOW" 
      }, { status: 409 });
    }

    // Create follow request
    const newFollow = await db.insert(follows)
      .values({
        followerId: currentUser.id,
        followingId: targetUserId,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newFollow[0], { status: 201 });

  } catch (error) {
    console.error('POST /api/follows error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const isRequests = url.pathname.endsWith('/requests');

    if (isRequests) {
      // Get incoming pending follow requests for current user
      const requests = await db.select({
        id: follows.id,
        status: follows.status,
        createdAt: follows.createdAt,
        followerId: follows.followerId,
        followerName: user.name,
        followerEmail: user.email,
        followerImage: user.image
      })
        .from(follows)
        .innerJoin(user, eq(follows.followerId, user.id))
        .where(and(
          eq(follows.followingId, currentUser.id),
          eq(follows.status, 'pending')
        ))
        .orderBy(desc(follows.createdAt));

      return NextResponse.json(requests);
    }

    // Default: Get all follows initiated by current user
    const userFollows = await db.select({
      id: follows.id,
      status: follows.status,
      createdAt: follows.createdAt,
      followingId: follows.followingId,
      followingName: user.name,
      followingEmail: user.email,
      followingImage: user.image
    })
      .from(follows)
      .innerJoin(user, eq(follows.followingId, user.id))
      .where(eq(follows.followerId, currentUser.id))
      .orderBy(desc(follows.createdAt));

    return NextResponse.json(userFollows);

  } catch (error) {
    console.error('GET /api/follows error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}