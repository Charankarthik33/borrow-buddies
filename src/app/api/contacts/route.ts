import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const contactsWithUsers = await db
      .select({
        id: contacts.id,
        ownerId: contacts.ownerId,
        contactUserId: contacts.contactUserId,
        createdAt: contacts.createdAt,
        contactUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(contacts)
      .innerJoin(user, eq(contacts.contactUserId, user.id))
      .where(eq(contacts.ownerId, currentUser.id));

    return NextResponse.json(contactsWithUsers);
  } catch (error) {
    console.error('GET /api/contacts error:', error);
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
    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required and must be a string', code: 'MISSING_USERID' },
        { status: 400 }
      );
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a contact', code: 'SELF_CONTACT' },
        { status: 400 }
      );
    }

    const existingContact = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.ownerId, currentUser.id), eq(contacts.contactUserId, userId)))
      .limit(1);

    if (existingContact.length > 0) {
      return NextResponse.json(
        { error: 'Contact already exists', code: 'DUPLICATE_CONTACT' },
        { status: 400 }
      );
    }

    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 400 }
      );
    }

    const newContact = await db
      .insert(contacts)
      .values({
        ownerId: currentUser.id,
        contactUserId: userId,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const contactWithUser = await db
      .select({
        id: contacts.id,
        ownerId: contacts.ownerId,
        contactUserId: contacts.contactUserId,
        createdAt: contacts.createdAt,
        contactUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(contacts)
      .innerJoin(user, eq(contacts.contactUserId, user.id))
      .where(eq(contacts.id, newContact[0].id))
      .limit(1);

    return NextResponse.json(contactWithUser[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/contacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}