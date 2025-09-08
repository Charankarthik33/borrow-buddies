import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { follows } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    const id = params.id;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (accept|reject) is required', code: 'INVALID_ACTION' },
        { status: 400 }
      );
    }

    const followId = parseInt(id);
    
    const followRecord = await db
      .select()
      .from(follows)
      .where(eq(follows.id, followId))
      .limit(1);

    if (followRecord.length === 0) {
      return NextResponse.json(
        { error: 'Follow request not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const follow = followRecord[0];
    
    if (follow.followingId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this follow request', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    if (follow.status !== 'pending') {
      return NextResponse.json(
        { error: 'Follow request has already been processed', code: 'ALREADY_PROCESSED' },
        { status: 400 }
      );
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    
    const updatedFollow = await db
      .update(follows)
      .set({ status: newStatus })
      .where(eq(follows.id, followId))
      .returning();

    return NextResponse.json(updatedFollow[0], { status: 200 });
    
  } catch (error) {
    console.error('PATCH follows/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}