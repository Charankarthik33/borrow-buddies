import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, users } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const postType = searchParams.get('type');
    const userId = searchParams.get('userId');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Single post by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const post = await db.select()
        .from(posts)
        .where(eq(posts.id, parseInt(id)))
        .limit(1);

      if (post.length === 0) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      return NextResponse.json(post[0]);
    }

    // List posts with filtering and pagination
    let query = db.select().from(posts);
    let conditions = [];

    // Search in content
    if (search) {
      conditions.push(like(posts.content, `%${search}%`));
    }

    // Filter by post type
    if (postType) {
      const validTypes = ['micro', 'media', 'service', 'listing'];
      if (validTypes.includes(postType)) {
        conditions.push(eq(posts.postType, postType));
      }
    }

    // Filter by user ID
    if (userId) {
      const userIdInt = parseInt(userId);
      if (!isNaN(userIdInt)) {
        conditions.push(eq(posts.userId, userIdInt));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const validSortFields = ['createdAt', 'updatedAt', 'likesCount', 'sharesCount', 'commentsCount'];
    if (validSortFields.includes(sort)) {
      const sortOrder = order === 'asc' ? asc : desc;
      query = query.orderBy(sortOrder(posts[sort as keyof typeof posts]));
    }

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
    const {
      userId,
      content,
      postType = 'micro',
      media,
      hashtags,
      mentions,
      location,
      price,
      availability,
      duration,
      serviceCategory,
      tags
    } = requestBody;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ 
        error: "Content must be 2000 characters or less",
        code: "CONTENT_TOO_LONG" 
      }, { status: 400 });
    }

    // Validate postType
    const validPostTypes = ['micro', 'media', 'service', 'listing'];
    if (!validPostTypes.includes(postType)) {
      return NextResponse.json({ 
        error: "Post type must be one of: micro, media, service, listing",
        code: "INVALID_POST_TYPE" 
      }, { status: 400 });
    }

    // Validate serviceCategory for service posts
    if (postType === 'service' && (!serviceCategory || typeof serviceCategory !== 'string' || serviceCategory.trim().length === 0)) {
      return NextResponse.json({ 
        error: "Service category is required for service posts",
        code: "MISSING_SERVICE_CATEGORY" 
      }, { status: 400 });
    }

    // Validate price if provided
    if (price !== undefined && price !== null && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json({ 
        error: "Price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    // Verify user exists
    const userExists = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: "User not found",
        code: "USER_NOT_FOUND" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();
    const isListing = postType === 'listing';

    const newPost = await db.insert(posts).values({
      userId: parseInt(userId),
      content: content.trim(),
      postType,
      media: media || null,
      hashtags: hashtags || null,
      mentions: mentions || null,
      likesCount: 0,
      sharesCount: 0,
      commentsCount: 0,
      bookmarked: false,
      location: location || null,
      price: price ? Math.floor(price) : null,
      availability: availability || null,
      duration: duration || null,
      serviceCategory: serviceCategory?.trim() || null,
      tags: tags || null,
      isListing,
      createdAt: now,
      updatedAt: now
    }).returning();

    return NextResponse.json(newPost[0], { status: 201 });

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
    const {
      content,
      postType,
      media,
      hashtags,
      mentions,
      location,
      price,
      availability,
      duration,
      serviceCategory,
      tags,
      bookmarked
    } = requestBody;

    // Check if post exists
    const existingPost = await db.select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and update content
    if (content !== undefined) {
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ 
          error: "Content cannot be empty",
          code: "INVALID_CONTENT" 
        }, { status: 400 });
      }
      if (content.length > 2000) {
        return NextResponse.json({ 
          error: "Content must be 2000 characters or less",
          code: "CONTENT_TOO_LONG" 
        }, { status: 400 });
      }
      updates.content = content.trim();
    }

    // Validate and update postType
    if (postType !== undefined) {
      const validPostTypes = ['micro', 'media', 'service', 'listing'];
      if (!validPostTypes.includes(postType)) {
        return NextResponse.json({ 
          error: "Post type must be one of: micro, media, service, listing",
          code: "INVALID_POST_TYPE" 
        }, { status: 400 });
      }
      updates.postType = postType;
      updates.isListing = postType === 'listing';
    }

    // Validate serviceCategory for service posts
    const finalPostType = postType || existingPost[0].postType;
    if (finalPostType === 'service') {
      const finalServiceCategory = serviceCategory !== undefined ? serviceCategory : existingPost[0].serviceCategory;
      if (!finalServiceCategory || typeof finalServiceCategory !== 'string' || finalServiceCategory.trim().length === 0) {
        return NextResponse.json({ 
          error: "Service category is required for service posts",
          code: "MISSING_SERVICE_CATEGORY" 
        }, { status: 400 });
      }
    }

    // Validate and update price
    if (price !== undefined && price !== null && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json({ 
        error: "Price must be a positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }

    // Update optional fields
    if (media !== undefined) updates.media = media;
    if (hashtags !== undefined) updates.hashtags = hashtags;
    if (mentions !== undefined) updates.mentions = mentions;
    if (location !== undefined) updates.location = location;
    if (price !== undefined) updates.price = price ? Math.floor(price) : null;
    if (availability !== undefined) updates.availability = availability;
    if (duration !== undefined) updates.duration = duration;
    if (serviceCategory !== undefined) updates.serviceCategory = serviceCategory?.trim() || null;
    if (tags !== undefined) updates.tags = tags;
    if (bookmarked !== undefined) updates.bookmarked = bookmarked;

    const updatedPost = await db.update(posts)
      .set(updates)
      .where(eq(posts.id, parseInt(id)))
      .returning();

    if (updatedPost.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPost[0]);

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

    // Check if post exists
    const existingPost = await db.select()
      .from(posts)
      .where(eq(posts.id, parseInt(id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const deletedPost = await db.delete(posts)
      .where(eq(posts.id, parseInt(id)))
      .returning();

    if (deletedPost.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Post deleted successfully',
      deletedPost: deletedPost[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}