import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { conversations, conversationParticipants, messages, user } from '@/db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get all conversations where current user is a participant
    const userConversations = await db
      .select({
        conversationId: conversationParticipants.conversationId,
      })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, currentUser.id));

    if (userConversations.length === 0) {
      return NextResponse.json([]);
    }

    const conversationIds = userConversations.map(uc => uc.conversationId);

    // Get conversation details with participants and last message
    const conversationDetails = await db
      .select({
        id: conversations.id,
        isGroup: conversations.isGroup,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(inArray(conversations.id, conversationIds))
      .orderBy(desc(conversations.createdAt));

    const result = [];

    for (const conversation of conversationDetails) {
      // Get all participants
      const participants = await db
        .select({
          userId: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .from(conversationParticipants)
        .innerJoin(user, eq(conversationParticipants.userId, user.id))
        .where(eq(conversationParticipants.conversationId, conversation.id));

      // Get last message
      const lastMessageArr = await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const lastMessage = lastMessageArr.length > 0 ? lastMessageArr[0] : null;

      result.push({
        id: conversation.id,
        isGroup: conversation.isGroup,
        createdAt: conversation.createdAt,
        participants: participants,
        lastMessage: lastMessage,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required field
    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json({ 
        error: "userId is required and must be a string",
        code: "MISSING_USER_ID"
      }, { status: 400 });
    }

    const { userId } = body;

    // Check if conversation already exists between these two users
    // First get all conversations where current user is a participant
    const currentUserConversations = await db
      .select({
        conversationId: conversationParticipants.conversationId,
      })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, currentUser.id));

    if (currentUserConversations.length > 0) {
      const conversationIds = currentUserConversations.map(uc => uc.conversationId);
      
      // Check if any of these conversations also has the other user
      const existingConversation = await db
        .select({
          conversationId: conversationParticipants.conversationId,
        })
        .from(conversationParticipants)
        .where(
          and(
            inArray(conversationParticipants.conversationId, conversationIds),
            eq(conversationParticipants.userId, userId)
          )
        )
        .limit(1);

      if (existingConversation.length > 0) {
        // Conversation exists, return it with full details
        const conversationId = existingConversation[0].conversationId;
        
        // Get conversation
        const conversationArr = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, conversationId))
          .limit(1);

        if (conversationArr.length === 0) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const conversation = conversationArr[0];

        // Get participants
        const participants = await db
          .select({
            userId: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          })
          .from(conversationParticipants)
          .innerJoin(user, eq(conversationParticipants.userId, user.id))
          .where(eq(conversationParticipants.conversationId, conversation.id));

        // Get last message
        const lastMessageArr = await db
          .select({
            id: messages.id,
            content: messages.content,
            senderId: messages.senderId,
            createdAt: messages.createdAt,
          })
          .from(messages)
          .where(eq(messages.conversationId, conversation.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        const lastMessage = lastMessageArr.length > 0 ? lastMessageArr[0] : null;

        return NextResponse.json({
          id: conversation.id,
          isGroup: conversation.isGroup,
          createdAt: conversation.createdAt,
          participants: participants,
          lastMessage: lastMessage,
        });
      }
    }

    // No existing conversation, create new one
    const createdAt = new Date().toISOString();
    const isGroup = false;

    const newConversation = await db
      .insert(conversations)
      .values({
        isGroup: isGroup ? 1 : 0,
        createdAt,
      })
      .returning();

    if (newConversation.length === 0) {
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    const conversation = newConversation[0];

    // Add both participants
    await db.insert(conversationParticipants).values([
      {
        conversationId: conversation.id,
        userId: currentUser.id,
        lastReadMessageId: null,
      },
      {
        conversationId: conversation.id,
        userId: userId,
        lastReadMessageId: null,
      }
    ]);

    // Get participant details
    const participants = await db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(conversationParticipants)
      .innerJoin(user, eq(conversationParticipants.userId, user.id))
      .where(eq(conversationParticipants.conversationId, conversation.id));

    return NextResponse.json({
      id: conversation.id,
      isGroup: conversation.isGroup,
      createdAt: conversation.createdAt,
      participants: participants,
      lastMessage: null,
    }, { status: 201 });

  } catch (error) {
    console.error('POST conversations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}