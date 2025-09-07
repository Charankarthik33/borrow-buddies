import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, like, or, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const testCrud = searchParams.get('test');

    // If test=true, return comprehensive database test
    if (testCrud === 'true') {
      try {
        // Test user count
        const userCount = await db.select({ count: count() }).from(user);
        
        // Test user list (limit 5)
        const users = await db.select().from(user).limit(5);
        
        return NextResponse.json({
          status: 'database_crud_test',
          userCount: userCount[0]?.count || 0,
          sampleUsers: users,
          databaseOperational: true,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return NextResponse.json({
          status: 'database_crud_test_failed',
          error: error.toString(),
          timestamp: new Date().toISOString()
        }, { status: 500 });
      }
    }

    // Regular user fetch
    if (id) {
      const userData = await db.select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);

      if (userData.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(userData[0]);
    }

    // List all users
    const users = await db.select().from(user).limit(10);
    return NextResponse.json(users);
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
    const { id, name, email, emailVerified, image } = requestBody;

    // Validate required fields
    if (!id || !name || !email) {
      return NextResponse.json({ 
        error: "ID, name, and email are required", 
        code: "MISSING_REQUIRED_FIELDS" 
      }, { status: 400 });
    }

    // Prepare insert data with proper field handling for better-auth schema
    const insertData = {
      id: id.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      emailVerified: emailVerified !== undefined ? Boolean(emailVerified) : false,
      image: image || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user
    const newUser = await db.insert(user)
      .values(insertData)
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Handle unique constraint violations
    if (error.toString().includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "User with this ID or email already exists",
        code: "UNIQUE_CONSTRAINT_VIOLATION" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}