import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { conversationParticipants, conversations, messages } from '@/db/schema';
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const conversationId = parseInt(params.id);
    if (isNaN(conversationId)) {
      return NextResponse.json(
        { error: 'Valid conversation ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { lastReadMessageId } = body;

    if (!lastReadMessageId || isNaN(parseInt(lastReadMessageId))) {
      return NextResponse.json(
        { error: 'Valid lastReadMessageId is required', code: 'INVALID_LAST_READ_MESSAGE_ID' },
        { status: 400 }
      );
    }

    // Check if conversation exists
    const conversation = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found', code: 'CONVERSATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is participant in this conversation
    const participant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, user.id)
        )
      )
      .limit(1);

    if (participant.length === 0) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation', code: 'NOT_PARTICIPANT' },
        { status: 403 }
      );
    }

    // Check if the message exists in this conversation
    const message = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, parseInt(lastReadMessageId)),
          eq(messages.conversationId, conversationId)
        )
      )
      .limit(1);

    if (message.length === 0) {
      return NextResponse.json(
        { error: 'Message not found in this conversation', code: 'MESSAGE_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Update the participant's lastReadMessageId
    const updatedParticipant = await db
      .update(conversationParticipants)
      .set({
        lastReadMessageId: parseInt(lastReadMessageId),
      })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, user.id)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Conversation marked as read',
      participant: updatedParticipant[0],
    });
  } catch (error) {
    console.error('PATCH /api/conversations/[id]/read error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}