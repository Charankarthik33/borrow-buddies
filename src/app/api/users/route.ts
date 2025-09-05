import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Single user by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const user = await db.select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (user.length === 0) {
        return NextResponse.json({ 
          error: 'User not found',
          code: "USER_NOT_FOUND" 
        }, { status: 404 });
      }

      // Remove password hash from response for security
      const { passwordHash, ...safeUser } = user[0];
      return NextResponse.json(safeUser);
    }

    // List users with pagination and search
    let query = db.select().from(users);

    if (search) {
      const searchCondition = or(
        like(users.username, `%${search}%`),
        like(users.displayName, `%${search}%`)
      );
      query = query.where(searchCondition);
    }

    // Apply sorting
    const orderBy = order === 'asc' ? asc : desc;
    if (sort === 'username') {
      query = query.orderBy(orderBy(users.username));
    } else if (sort === 'displayName') {
      query = query.orderBy(orderBy(users.displayName));
    } else if (sort === 'joinDate') {
      query = query.orderBy(orderBy(users.joinDate));
    } else {
      query = query.orderBy(orderBy(users.createdAt));
    }

    const results = await query.limit(limit).offset(offset);

    // Remove password hashes from all results
    const safeResults = results.map(({ passwordHash, ...user }) => user);

    return NextResponse.json(safeResults);
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
      email, 
      username, 
      displayName, 
      passwordHash,
      avatar,
      coverImage,
      bio,
      location,
      interests
    } = requestBody;

    // Validation
    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({ 
        error: "Username is required",
        code: "MISSING_USERNAME" 
      }, { status: 400 });
    }

    if (!displayName) {
      return NextResponse.json({ 
        error: "Display name is required",
        code: "MISSING_DISPLAY_NAME" 
      }, { status: 400 });
    }

    if (!passwordHash) {
      return NextResponse.json({ 
        error: "Password hash is required",
        code: "MISSING_PASSWORD_HASH" 
      }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT" 
      }, { status: 400 });
    }

    // Username validation (3-30 characters, alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        error: "Username must be 3-30 characters and contain only letters, numbers, and underscores",
        code: "INVALID_USERNAME_FORMAT" 
      }, { status: 400 });
    }

    // Display name validation (1-50 characters)
    if (displayName.length < 1 || displayName.length > 50) {
      return NextResponse.json({ 
        error: "Display name must be 1-50 characters",
        code: "INVALID_DISPLAY_NAME_LENGTH" 
      }, { status: 400 });
    }

    // Check for unique email and username
    const existingUser = await db.select()
      .from(users)
      .where(or(
        eq(users.email, email.toLowerCase().trim()),
        eq(users.username, username.trim())
      ))
      .limit(1);

    if (existingUser.length > 0) {
      const conflict = existingUser[0].email === email.toLowerCase().trim() ? 'email' : 'username';
      return NextResponse.json({ 
        error: `User with this ${conflict} already exists`,
        code: "DUPLICATE_USER" 
      }, { status: 409 });
    }

    const currentTimestamp = new Date().toISOString();

    // Prepare insert data with auto-generated fields
    const insertData = {
      email: email.toLowerCase().trim(),
      username: username.trim(),
      displayName: displayName.trim(),
      passwordHash,
      avatar: avatar || null,
      coverImage: coverImage || null,
      bio: bio?.trim() || null,
      location: location?.trim() || null,
      isVerified: false,
      verificationStatus: 'none',
      interests: interests || null,
      followersCount: 0,
      followingCount: 0,
      trustScore: 0,
      isPrivate: false,
      allowMessages: true,
      allowFollows: true,
      joinDate: currentTimestamp,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp
    };

    const newUser = await db.insert(users)
      .values(insertData)
      .returning();

    // Remove password hash from response
    const { passwordHash: _, ...safeUser } = newUser[0];

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'Email or username already exists',
        code: "UNIQUE_CONSTRAINT_VIOLATION" 
      }, { status: 409 });
    }
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
      email, 
      username, 
      displayName, 
      passwordHash,
      avatar,
      coverImage,
      bio,
      location,
      isVerified,
      verificationStatus,
      interests,
      followersCount,
      followingCount,
      trustScore,
      isPrivate,
      allowMessages,
      allowFollows
    } = requestBody;

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add fields to update if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ 
          error: "Invalid email format",
          code: "INVALID_EMAIL_FORMAT" 
        }, { status: 400 });
      }

      // Check email uniqueness (excluding current user)
      const existingEmail = await db.select()
        .from(users)
        .where(and(
          eq(users.email, email.toLowerCase().trim()),
          eq(users.id, parseInt(id))
        ))
        .limit(1);

      if (existingEmail.length === 0) {
        const emailCheck = await db.select()
          .from(users)
          .where(eq(users.email, email.toLowerCase().trim()))
          .limit(1);

        if (emailCheck.length > 0) {
          return NextResponse.json({ 
            error: "Email already exists",
            code: "DUPLICATE_EMAIL" 
          }, { status: 409 });
        }
      }

      updateData.email = email.toLowerCase().trim();
    }

    if (username !== undefined) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json({ 
          error: "Username must be 3-30 characters and contain only letters, numbers, and underscores",
          code: "INVALID_USERNAME_FORMAT" 
        }, { status: 400 });
      }

      // Check username uniqueness (excluding current user)
      const existingUsername = await db.select()
        .from(users)
        .where(and(
          eq(users.username, username.trim()),
          eq(users.id, parseInt(id))
        ))
        .limit(1);

      if (existingUsername.length === 0) {
        const usernameCheck = await db.select()
          .from(users)
          .where(eq(users.username, username.trim()))
          .limit(1);

        if (usernameCheck.length > 0) {
          return NextResponse.json({ 
            error: "Username already exists",
            code: "DUPLICATE_USERNAME" 
          }, { status: 409 });
        }
      }

      updateData.username = username.trim();
    }

    if (displayName !== undefined) {
      if (displayName.length < 1 || displayName.length > 50) {
        return NextResponse.json({ 
          error: "Display name must be 1-50 characters",
          code: "INVALID_DISPLAY_NAME_LENGTH" 
        }, { status: 400 });
      }
      updateData.displayName = displayName.trim();
    }

    if (passwordHash !== undefined) {
      updateData.passwordHash = passwordHash;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    if (coverImage !== undefined) {
      updateData.coverImage = coverImage;
    }

    if (bio !== undefined) {
      updateData.bio = bio?.trim() || null;
    }

    if (location !== undefined) {
      updateData.location = location?.trim() || null;
    }

    if (isVerified !== undefined) {
      updateData.isVerified = Boolean(isVerified);
    }

    if (verificationStatus !== undefined) {
      const validStatuses = ['none', 'pending', 'verified'];
      if (!validStatuses.includes(verificationStatus)) {
        return NextResponse.json({ 
          error: "Verification status must be one of: none, pending, verified",
          code: "INVALID_VERIFICATION_STATUS" 
        }, { status: 400 });
      }
      updateData.verificationStatus = verificationStatus;
    }

    if (interests !== undefined) {
      updateData.interests = interests;
    }

    if (followersCount !== undefined) {
      updateData.followersCount = parseInt(followersCount) || 0;
    }

    if (followingCount !== undefined) {
      updateData.followingCount = parseInt(followingCount) || 0;
    }

    if (trustScore !== undefined) {
      updateData.trustScore = parseFloat(trustScore) || 0.0;
    }

    if (isPrivate !== undefined) {
      updateData.isPrivate = Boolean(isPrivate);
    }

    if (allowMessages !== undefined) {
      updateData.allowMessages = Boolean(allowMessages);
    }

    if (allowFollows !== undefined) {
      updateData.allowFollows = Boolean(allowFollows);
    }

    const updated = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning();

    // Remove password hash from response
    const { passwordHash: _, ...safeUser } = updated[0];

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('PUT error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'Email or username already exists',
        code: "UNIQUE_CONSTRAINT_VIOLATION" 
      }, { status: 409 });
    }
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

    // Check if user exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: "USER_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(users)
      .where(eq(users.id, parseInt(id)))
      .returning();

    // Remove password hash from response
    const { passwordHash: _, ...safeUser } = deleted[0];

    return NextResponse.json({
      message: 'User deleted successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}