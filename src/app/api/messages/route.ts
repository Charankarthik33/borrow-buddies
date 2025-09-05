import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages, users } from '@/db/schema';
import { eq, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single message by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const message = await db.select()
        .from(messages)
        .where(eq(messages.id, parseInt(id)))
        .limit(1);

      if (message.length === 0) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      return NextResponse.json(message[0]);
    }

    // List messages with filters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const senderId = searchParams.get('senderId');
    const receiverId = searchParams.get('receiverId');
    const isRead = searchParams.get('isRead');
    const order = searchParams.get('order') || 'asc';

    let query = db.select().from(messages);
    const conditions = [];

    // Filter by conversation (bidirectional)
    if (senderId && receiverId) {
      const senderIdInt = parseInt(senderId);
      const receiverIdInt = parseInt(receiverId);
      
      if (isNaN(senderIdInt) || isNaN(receiverIdInt)) {
        return NextResponse.json({ 
          error: "Valid sender and receiver IDs are required",
          code: "INVALID_IDS" 
        }, { status: 400 });
      }

      conditions.push(
        or(
          and(eq(messages.senderId, senderIdInt), eq(messages.receiverId, receiverIdInt)),
          and(eq(messages.senderId, receiverIdInt), eq(messages.receiverId, senderIdInt))
        )
      );
    } else {
      // Filter by individual sender or receiver
      if (senderId) {
        const senderIdInt = parseInt(senderId);
        if (isNaN(senderIdInt)) {
          return NextResponse.json({ 
            error: "Valid sender ID is required",
            code: "INVALID_SENDER_ID" 
          }, { status: 400 });
        }
        conditions.push(eq(messages.senderId, senderIdInt));
      }

      if (receiverId) {
        const receiverIdInt = parseInt(receiverId);
        if (isNaN(receiverIdInt)) {
          return NextResponse.json({ 
            error: "Valid receiver ID is required",
            code: "INVALID_RECEIVER_ID" 
          }, { status: 400 });
        }
        conditions.push(eq(messages.receiverId, receiverIdInt));
      }
    }

    // Filter by read status
    if (isRead !== null && isRead !== undefined) {
      const isReadBool = isRead === 'true';
      conditions.push(eq(messages.isRead, isReadBool));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Apply ordering
    if (order === 'desc') {
      query = query.orderBy(desc(messages.createdAt));
    } else {
      query = query.orderBy(asc(messages.createdAt));
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
    const { senderId, receiverId, content, messageType = 'text' } = requestBody;

    // Validate required fields
    if (!senderId) {
      return NextResponse.json({ 
        error: "Sender ID is required",
        code: "MISSING_SENDER_ID" 
      }, { status: 400 });
    }

    if (!receiverId) {
      return NextResponse.json({ 
        error: "Receiver ID is required",
        code: "MISSING_RECEIVER_ID" 
      }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ 
        error: "Content is required",
        code: "MISSING_CONTENT" 
      }, { status: 400 });
    }

    // Validate IDs are integers
    const senderIdInt = parseInt(senderId);
    const receiverIdInt = parseInt(receiverId);

    if (isNaN(senderIdInt) || isNaN(receiverIdInt)) {
      return NextResponse.json({ 
        error: "Valid sender and receiver IDs are required",
        code: "INVALID_IDS" 
      }, { status: 400 });
    }

    // Prevent self-messaging
    if (senderIdInt === receiverIdInt) {
      return NextResponse.json({ 
        error: "Cannot send message to yourself",
        code: "SELF_MESSAGE_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate content length
    if (content.length < 1 || content.length > 1000) {
      return NextResponse.json({ 
        error: "Content must be between 1 and 1000 characters",
        code: "INVALID_CONTENT_LENGTH" 
      }, { status: 400 });
    }

    // Validate messageType
    const validMessageTypes = ['text', 'image', 'system'];
    if (!validMessageTypes.includes(messageType)) {
      return NextResponse.json({ 
        error: "Message type must be 'text', 'image', or 'system'",
        code: "INVALID_MESSAGE_TYPE" 
      }, { status: 400 });
    }

    // Validate sender exists
    const sender = await db.select()
      .from(users)
      .where(eq(users.id, senderIdInt))
      .limit(1);

    if (sender.length === 0) {
      return NextResponse.json({ 
        error: "Sender user not found",
        code: "SENDER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate receiver exists
    const receiver = await db.select()
      .from(users)
      .where(eq(users.id, receiverIdInt))
      .limit(1);

    if (receiver.length === 0) {
      return NextResponse.json({ 
        error: "Receiver user not found",
        code: "RECEIVER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Create message
    const newMessage = await db.insert(messages)
      .values({
        senderId: senderIdInt,
        receiverId: receiverIdInt,
        content: content.trim(),
        messageType,
        isRead: false,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });

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

    const messageId = parseInt(id);
    const requestBody = await request.json();

    // Only allow updating isRead field
    if (!requestBody.hasOwnProperty('isRead')) {
      return NextResponse.json({ 
        error: "Only 'isRead' field can be updated",
        code: "INVALID_UPDATE_FIELD" 
      }, { status: 400 });
    }

    const { isRead } = requestBody;

    // Validate isRead is boolean
    if (typeof isRead !== 'boolean') {
      return NextResponse.json({ 
        error: "isRead must be a boolean value",
        code: "INVALID_IS_READ_TYPE" 
      }, { status: 400 });
    }

    // Check if message exists
    const existingMessage = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Update message
    const updated = await db.update(messages)
      .set({
        isRead,
      })
      .where(eq(messages.id, messageId))
      .returning();

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

    const messageId = parseInt(id);

    // Check if message exists
    const existingMessage = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Delete message
    const deleted = await db.delete(messages)
      .where(eq(messages.id, messageId))
      .returning();

    return NextResponse.json({
      message: 'Message deleted successfully',
      deletedMessage: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}