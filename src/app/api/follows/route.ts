import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { follows, users } from '@/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const followerId = searchParams.get('followerId');
    const followingId = searchParams.get('followingId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get single follow by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const follow = await db.select()
        .from(follows)
        .where(eq(follows.id, parseInt(id)))
        .limit(1);

      if (follow.length === 0) {
        return NextResponse.json({ error: 'Follow relationship not found' }, { status: 404 });
      }

      return NextResponse.json(follow[0]);
    }

    // Build query with filters
    let query = db.select().from(follows);
    let conditions = [];

    // Apply filters
    if (followerId) {
      const followerIdInt = parseInt(followerId);
      if (isNaN(followerIdInt)) {
        return NextResponse.json({ 
          error: "Valid followerId is required",
          code: "INVALID_FOLLOWER_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(follows.followerId, followerIdInt));
    }

    if (followingId) {
      const followingIdInt = parseInt(followingId);
      if (isNaN(followingIdInt)) {
        return NextResponse.json({ 
          error: "Valid followingId is required",
          code: "INVALID_FOLLOWING_ID" 
        }, { status: 400 });
      }
      conditions.push(eq(follows.followingId, followingIdInt));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(follows.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { followerId, followingId } = requestBody;

    // Validation
    if (!followerId) {
      return NextResponse.json({ 
        error: "followerId is required",
        code: "MISSING_FOLLOWER_ID" 
      }, { status: 400 });
    }

    if (!followingId) {
      return NextResponse.json({ 
        error: "followingId is required",
        code: "MISSING_FOLLOWING_ID" 
      }, { status: 400 });
    }

    const followerIdInt = parseInt(followerId);
    const followingIdInt = parseInt(followingId);
    
    if (isNaN(followerIdInt) || isNaN(followingIdInt)) {
      return NextResponse.json({ 
        error: "Valid follower and following IDs are required",
        code: "INVALID_IDS" 
      }, { status: 400 });
    }

    // Prevent self-following
    if (followerIdInt === followingIdInt) {
      return NextResponse.json({ 
        error: "Cannot follow yourself",
        code: "SELF_FOLLOW_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate both users exist
    const followerUser = await db.select()
      .from(users)
      .where(eq(users.id, followerIdInt))
      .limit(1);

    if (followerUser.length === 0) {
      return NextResponse.json({ 
        error: "Follower user does not exist",
        code: "FOLLOWER_NOT_FOUND" 
      }, { status: 400 });
    }

    const followingUser = await db.select()
      .from(users)
      .where(eq(users.id, followingIdInt))
      .limit(1);

    if (followingUser.length === 0) {
      return NextResponse.json({ 
        error: "User to follow does not exist",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Check for duplicate follow
    const existingFollow = await db.select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerIdInt),
        eq(follows.followingId, followingIdInt)
      ))
      .limit(1);

    if (existingFollow.length > 0) {
      return NextResponse.json({ 
        error: "Already following this user",
        code: "DUPLICATE_FOLLOW" 
      }, { status: 400 });
    }

    // Create follow relationship
    const newFollow = await db.insert(follows)
      .values({
        followerId: followerIdInt,
        followingId: followingIdInt,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newFollow[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const followerId = searchParams.get('followerId');
    const followingId = searchParams.get('followingId');

    // Delete by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const existingFollow = await db.select()
        .from(follows)
        .where(eq(follows.id, parseInt(id)))
        .limit(1);

      if (existingFollow.length === 0) {
        return NextResponse.json({ error: 'Follow relationship not found' }, { status: 404 });
      }

      const deleted = await db.delete(follows)
        .where(eq(follows.id, parseInt(id)))
        .returning();

      return NextResponse.json({ 
        message: 'Follow relationship deleted successfully',
        deleted: deleted[0]
      });
    }

    // Delete by follower/following combination
    if (followerId && followingId) {
      const followerIdInt = parseInt(followerId);
      const followingIdInt = parseInt(followingId);

      if (isNaN(followerIdInt) || isNaN(followingIdInt)) {
        return NextResponse.json({ 
          error: "Valid followerId and followingId are required",
          code: "INVALID_IDS" 
        }, { status: 400 });
      }

      const existingFollow = await db.select()
        .from(follows)
        .where(and(
          eq(follows.followerId, followerIdInt),
          eq(follows.followingId, followingIdInt)
        ))
        .limit(1);

      if (existingFollow.length === 0) {
        return NextResponse.json({ error: 'Follow relationship not found' }, { status: 404 });
      }

      const deleted = await db.delete(follows)
        .where(and(
          eq(follows.followerId, followerIdInt),
          eq(follows.followingId, followingIdInt)
        ))
        .returning();

      return NextResponse.json({ 
        message: 'Follow relationship deleted successfully',
        deleted: deleted[0]
      });
    }

    return NextResponse.json({ 
      error: "Either id or both followerId and followingId are required",
      code: "MISSING_PARAMETERS" 
    }, { status: 400 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}