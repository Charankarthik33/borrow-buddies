import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { services, favorites, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const serviceId = parseInt(params.id);
    
    if (isNaN(serviceId)) {
      return NextResponse.json({ 
        error: 'Valid service ID is required',
        code: 'INVALID_SERVICE_ID'
      }, { status: 400 });
    }

    // Check if service exists
    const serviceExists = await db.select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (serviceExists.length === 0) {
      return NextResponse.json({ 
        error: 'Service not found',
        code: 'SERVICE_NOT_FOUND'
      }, { status: 404 });
    }

    // Check if favorite already exists
    const existingFavorite = await db.select()
      .from(favorites)
      .where(and(eq(favorites.userId, user.id), eq(favorites.serviceId, serviceId)))
      .limit(1);

    let result;
    let favorited: boolean;

    if (existingFavorite.length > 0) {
      // Delete existing favorite (unfavorite)
      const deleted = await db.delete(favorites)
        .where(and(eq(favorites.userId, user.id), eq(favorites.serviceId, serviceId)))
        .returning();
      
      result = deleted[0];
      favorited = false;
    } else {
      // Create new favorite
      const created = await db.insert(favorites)
        .values({
          userId: user.id,
          serviceId: serviceId,
          createdAt: new Date().toISOString()
        })
        .returning();
      
      result = created[0];
      favorited = true;
    }

    return NextResponse.json({ 
      favorited,
      favorite: result
    }, { status: 200 });

  } catch (error) {
    console.error('Favorite toggle error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}