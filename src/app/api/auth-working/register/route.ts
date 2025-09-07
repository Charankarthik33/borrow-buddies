import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long",
        code: "WEAK_PASSWORD" 
      }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    // Check if user already exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: "User with this email already exists",
        code: "EMAIL_ALREADY_EXISTS" 
      }, { status: 400 });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate user ID
    const userId = nanoid();
    const accountId = nanoid();
    const now = new Date();

    // Create user
    const newUser = await db.insert(user).values({
      id: userId,
      name: trimmedName,
      email: normalizedEmail,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    }).returning();

    if (newUser.length === 0) {
      return NextResponse.json({ 
        error: "Failed to create user",
        code: "USER_CREATION_FAILED" 
      }, { status: 500 });
    }

    // Create account record for email/password authentication
    const newAccount = await db.insert(account).values({
      id: accountId,
      accountId: normalizedEmail,
      providerId: "email",
      userId: userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    }).returning();

    if (newAccount.length === 0) {
      // Rollback user creation if account creation fails
      await db.delete(user).where(eq(user.id, userId));
      return NextResponse.json({ 
        error: "Failed to create account",
        code: "ACCOUNT_CREATION_FAILED" 
      }, { status: 500 });
    }

    // Return user data (excluding sensitive information)
    const userData = {
      id: newUser[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
      emailVerified: newUser[0].emailVerified,
      createdAt: newUser[0].createdAt,
    };

    return NextResponse.json(userData, { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    
    // Handle specific database constraint errors
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "User with this email already exists",
        code: "EMAIL_ALREADY_EXISTS" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}