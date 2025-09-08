import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, conversations, conversationParticipants, user } from '@/db/schema';
import { eq, and, gt, desc, asc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversationId = parseInt(params.id);
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const isParticipant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, currentUser.id)
        )
      )
      .limit(1);

    if (isParticipant.length === 0) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    let query = db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        status: messages.status,
        createdAt: messages.createdAt,
        senderName: user.name,
        senderEmail: user.email,
        senderImage: user.image
      })
      .from(messages)
      .leftJoin(user, eq(messages.senderId, user.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limit);

    if (cursor) {
      const cursorId = parseInt(cursor);
      if (!isNaN(cursorId)) {
        query = query.where(
          and(
            eq(messages.conversationId, conversationId),
            gt(messages.id, cursorId)
          )
        );
      }
    }

    const results = await query;
    
    // Transform results to match expected format
    const transformedResults = results.map(row => ({
      id: row.id,
      conversationId: row.conversationId,
      senderId: row.senderId,
      content: row.content,
      status: row.status,
      createdAt: row.createdAt,
      sender: {
        id: row.senderId,
        name: row.senderName,
        email: row.senderEmail,
        image: row.senderImage
      }
    }));

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('GET conversation messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const conversationId = parseInt(params.id);
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Content is required',
        code: 'MISSING_CONTENT'
      }, { status: 400 });
    }

    if ('senderId' in body || 'sender_id' in body) {
      return NextResponse.json({ 
        error: 'Sender ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED'
      }, { status: 400 });
    }

    const isParticipant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, currentUser.id)
        )
      )
      .limit(1);

    if (isParticipant.length === 0) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    const conversationExists = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversationExists.length === 0) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const newMessage = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: currentUser.id,
        content: content.trim(),
        status: 'sent',
        createdAt: new Date().toISOString()
      })
      .returning();

    const messageWithSender = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        status: messages.status,
        createdAt: messages.createdAt,
        senderName: user.name,
        senderEmail: user.email,
        senderImage: user.image
      })
      .from(messages)
      .leftJoin(user, eq(messages.senderId, user.id))
      .where(eq(messages.id, newMessage[0].id))
      .limit(1);

    const result = messageWithSender[0];
    
    return NextResponse.json({
      id: result.id,
      conversationId: result.conversationId,
      senderId: result.senderId,
      content: result.content,
      status: result.status,
      createdAt: result.createdAt,
      sender: {
        id: result.senderId,
        name: result.senderName,
        email: result.senderEmail,
        image: result.senderImage
      }
    }, { status: 201 });
  } catch (error) {
    console.error('POST conversation message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}