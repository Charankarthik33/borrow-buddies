import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { likes, users, posts } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortField = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const like = await db.select()
        .from(likes)
        .where(eq(likes.id, parseInt(id)))
        .limit(1);

      if (like.length === 0) {
        return NextResponse.json({ error: 'Like not found' }, { status: 404 });
      }

      return NextResponse.json(like[0]);
    }

    // List with optional filtering
    let query = db.select().from(likes);
    let whereConditions = [];

    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid userId is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }
      whereConditions.push(eq(likes.userId, parseInt(userId)));
    }

    if (postId) {
      if (isNaN(parseInt(postId))) {
        return NextResponse.json({ 
          error: "Valid postId is required",
          code: "INVALID_POST_ID" 
        }, { status: 400 });
      }
      whereConditions.push(eq(likes.postId, parseInt(postId)));
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    // Add sorting
    const sortColumn = likes[sortField as keyof typeof likes] || likes.createdAt;
    query = query.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn));

    const results = await query.limit(limit).offset(offset);
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
    const { userId, postId } = requestBody;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!postId) {
      return NextResponse.json({ 
        error: "postId is required",
        code: "MISSING_POST_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(userId)) || isNaN(parseInt(postId))) {
      return NextResponse.json({ 
        error: "Valid userId and postId are required",
        code: "INVALID_IDS" 
      }, { status: 400 });
    }

    // Validate post exists
    const post = await db.select()
      .from(posts)
      .where(eq(posts.id, parseInt(postId)))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ 
        error: "Post not found",
        code: "POST_NOT_FOUND" 
      }, { status: 400 });
    }

    // Check for duplicate like
    const existingLike = await db.select()
      .from(likes)
      .where(and(
        eq(likes.userId, parseInt(userId)),
        eq(likes.postId, parseInt(postId))
      ))
      .limit(1);

    if (existingLike.length > 0) {
      return NextResponse.json({ 
        error: "You have already liked this post",
        code: "DUPLICATE_LIKE" 
      }, { status: 400 });
    }

    // Create the like
    const newLike = await db.insert(likes)
      .values({
        userId: parseInt(userId),
        postId: parseInt(postId),
        createdAt: new Date().toISOString()
      })
      .returning();

    // Increment post likes count
    await db.update(posts)
      .set({
        likesCount: (post[0].likesCount || 0) + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(posts.id, parseInt(postId)));

    return NextResponse.json(newLike[0], { status: 201 });

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
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');

    let like;
    let whereCondition;

    // Delete by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      whereCondition = eq(likes.id, parseInt(id));
      like = await db.select()
        .from(likes)
        .where(whereCondition)
        .limit(1);

      if (like.length === 0) {
        return NextResponse.json({ error: 'Like not found' }, { status: 404 });
      }
    }
    // Delete by userId + postId combination
    else if (userId && postId) {
      if (isNaN(parseInt(userId)) || isNaN(parseInt(postId))) {
        return NextResponse.json({ 
          error: "Valid userId and postId are required",
          code: "INVALID_PARAMETERS" 
        }, { status: 400 });
      }

      whereCondition = and(
        eq(likes.userId, parseInt(userId)),
        eq(likes.postId, parseInt(postId))
      );

      like = await db.select()
        .from(likes)
        .where(whereCondition)
        .limit(1);

      if (like.length === 0) {
        return NextResponse.json({ error: 'Like not found' }, { status: 404 });
      }
    } else {
      return NextResponse.json({ 
        error: "Either 'id' or both 'userId' and 'postId' parameters are required",
        code: "MISSING_PARAMETERS" 
      }, { status: 400 });
    }

    // Get post info for updating likes count
    const post = await db.select()
      .from(posts)
      .where(eq(posts.id, like[0].postId))
      .limit(1);

    // Delete the like
    const deleted = await db.delete(likes)
      .where(whereCondition)
      .returning();

    // Decrement post likes count
    if (post.length > 0) {
      await db.update(posts)
        .set({
          likesCount: Math.max((post[0].likesCount || 0) - 1, 0),
          updatedAt: new Date().toISOString()
        })
        .where(eq(posts.id, like[0].postId));
    }

    return NextResponse.json({ 
      message: 'Like deleted successfully',
      deleted: deleted[0] 
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}