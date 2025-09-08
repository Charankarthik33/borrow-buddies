import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, profiles, follows } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { and, eq, notInArray, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userSession = await getCurrentUser(request);
    if (!userSession) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const userId = userSession.id;

    const followingSubquery = db.select({
      followingId: follows.followingId
    })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const suggestions = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      rating: profiles.rating
    })
      .from(user)
      .innerJoin(profiles, eq(user.id, profiles.userId))
      .where(and(
        notInArray(user.id, followingSubquery),
        eq(follows.status, 'accepted')
      ))
      .orderBy(desc(profiles.rating))
      .limit(10);

    return NextResponse.json(suggestions, { status: 200 });

  } catch (error) {
    console.error('GET suggestions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'DATABASE_ERROR'
    }, { status: 500 });
  }
}