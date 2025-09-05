import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { comments, users, posts } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const postId = searchParams.get('postId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Single comment by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const comment = await db.select()
        .from(comments)
        .where(eq(comments.id, parseInt(id)))
        .limit(1);

      if (comment.length === 0) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
      }

      return NextResponse.json(comment[0]);
    }

    // List comments with filters
    let query = db.select().from(comments);
    let conditions = [];

    if (userId) {
      conditions.push(eq(comments.userId, parseInt(userId)));
    }

    if (postId) {
      conditions.push(eq(comments.postId, parseInt(postId)));
    }

    if (search) {
      conditions.push(like(comments.content, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const orderDirection = order === 'asc' ? asc : desc;
    query = query.orderBy(orderDirection(comments.createdAt));

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
    const { userId, postId, content } = requestBody;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!postId) {
      return NextResponse.json({ 
        error: "Post ID is required",
        code: "MISSING_POST_ID" 
      }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    // Validate content length
    if (content.length < 1 || content.length > 500) {
      return NextResponse.json({ 
        error: "Content must be between 1 and 500 characters",
        code: "INVALID_CONTENT_LENGTH" 
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

    // Create comment
    const newComment = await db.insert(comments)
      .values({
        userId: parseInt(userId),
        postId: parseInt(postId),
        content: content.trim(),
        createdAt: new Date().toISOString()
      })
      .returning();

    // Increment post comments count
    await db.update(posts)
      .set({
        commentsCount: (post[0].commentsCount || 0) + 1,
        updatedAt: new Date().toISOString()
      })
      .where(eq(posts.id, parseInt(postId)));

    return NextResponse.json(newComment[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { content } = requestBody;

    // Validate content if provided
    if (content !== undefined) {
      if (!content) {
        return NextResponse.json({ 
          error: "Content cannot be empty",
          code: "INVALID_CONTENT" 
        }, { status: 400 });
      }

      if (content.length < 1 || content.length > 500) {
        return NextResponse.json({ 
          error: "Content must be between 1 and 500 characters",
          code: "INVALID_CONTENT_LENGTH" 
        }, { status: 400 });
      }
    }

    // Check if comment exists
    const existingComment = await db.select()
      .from(comments)
      .where(eq(comments.id, parseInt(id)))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Update comment (only content can be updated)
    const updates: any = {};
    if (content !== undefined) {
      updates.content = content.trim();
    }

    const updated = await db.update(comments)
      .set(updates)
      .where(eq(comments.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if comment exists
    const existingComment = await db.select()
      .from(comments)
      .where(eq(comments.id, parseInt(id)))
      .limit(1);

    if (existingComment.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const postId = existingComment[0].postId;

    // Delete comment
    const deleted = await db.delete(comments)
      .where(eq(comments.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Decrement post comments count
    const post = await db.select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (post.length > 0) {
      await db.update(posts)
        .set({
          commentsCount: Math.max(0, (post[0].commentsCount || 0) - 1),
          updatedAt: new Date().toISOString()
        })
        .where(eq(posts.id, postId));
    }

    return NextResponse.json({
      message: 'Comment deleted successfully',
      deletedComment: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}