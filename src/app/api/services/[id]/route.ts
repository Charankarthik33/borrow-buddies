import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { services, user, profiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceId = parseInt(params.id);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const serviceResult = await db
      .select({
        id: services.id,
        title: services.title,
        description: services.description,
        category: services.category,
        price: services.price,
        priceUnit: services.priceUnit,
        location: services.location,
        images: services.images,
        availableDates: services.availableDates,
        isAvailable: services.isAvailable,
        createdAt: services.createdAt,
        ownerId: services.ownerId
      })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (serviceResult.length === 0) {
      return NextResponse.json(
        { error: 'Service not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const service = serviceResult[0];

    const ownerResult = await db
      .select({
        id: user.id,
        name: user.name,
        rating: profiles.rating
      })
      .from(user)
      .leftJoin(profiles, eq(user.id, profiles.userId))
      .where(eq(user.id, service.ownerId))
      .limit(1);

    const owner = ownerResult[0] || { id: service.ownerId, name: '', rating: 0 };

    const response = {
      id: service.id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      priceUnit: service.priceUnit,
      location: service.location,
      images: service.images,
      availableDates: service.availableDates,
      isAvailable: service.isAvailable,
      createdAt: service.createdAt,
      owner: {
        id: owner.id,
        name: owner.name,
        rating: owner.rating
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET service error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    const serviceId = parseInt(params.id);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('ownerId' in body || 'userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          error: "User ID cannot be provided in request body",
          code: "USER_ID_NOT_ALLOWED" 
        }, 
        { status: 400 }
      );
    }

    const updates: any = {};
    
    if ('title' in body) {
      if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title is required and must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if ('description' in body) {
      if (!body.description || typeof body.description !== 'string') {
        return NextResponse.json(
          { error: 'Description is required and must be a string', code: 'INVALID_DESCRIPTION' },
          { status: 400 }
        );
      }
      updates.description = body.description.trim();
    }

    if ('category' in body) {
      if (body.category !== null && (typeof body.category !== 'string' || body.category.trim().length === 0)) {
        return NextResponse.json(
          { error: 'Category must be a non-empty string or null', code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
      updates.category = body.category ? body.category.trim() : null;
    }

    if ('price' in body) {
      if (typeof body.price !== 'number' || body.price < 0) {
        return NextResponse.json(
          { error: 'Price must be a non-negative number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
      updates.price = body.price;
    }

    if ('priceUnit' in body) {
      const validUnits = ['hour', 'day', 'session'];
      if (!validUnits.includes(body.priceUnit)) {
        return NextResponse.json(
          { error: 'Price unit must be one of: hour, day, session', code: 'INVALID_PRICE_UNIT' },
          { status: 400 }
        );
      }
      updates.priceUnit = body.priceUnit;
    }

    if ('location' in body) {
      if (body.location !== null && (typeof body.location !== 'string' || body.location.trim().length === 0)) {
        return NextResponse.json(
          { error: 'Location must be a non-empty string or null', code: 'INVALID_LOCATION' },
          { status: 400 }
        );
      }
      updates.location = body.location ? body.location.trim() : null;
    }

    if ('images' in body) {
      if (!Array.isArray(body.images)) {
        return NextResponse.json(
          { error: 'Images must be an array', code: 'INVALID_IMAGES' },
          { status: 400 }
        );
      }
      updates.images = body.images;
    }

    if ('availableDates' in body) {
      if (!Array.isArray(body.availableDates)) {
        return NextResponse.json(
          { error: 'Available dates must be an array', code: 'INVALID_AVAILABLE_DATES' },
          { status: 400 }
        );
      }
      updates.availableDates = body.availableDates;
    }

    if ('isAvailable' in body) {
      if (typeof body.isAvailable !== 'boolean') {
        return NextResponse.json(
          { error: 'isAvailable must be a boolean', code: 'INVALID_IS_AVAILABLE' },
          { status: 400 }
        );
      }
      updates.isAvailable = body.isAvailable ? 1 : 0;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    updates.updatedAt = new Date().toISOString();

    const updatedResult = await db
      .update(services)
      .set(updates)
      .where(and(eq(services.id, serviceId), eq(services.ownerId, currentUser.id)))
      .returning();

    if (updatedResult.length === 0) {
      return NextResponse.json(
        { error: 'Service not found or unauthorized', code: 'NOT_FOUND_OR_UNAUTHORIZED' },
        { status: 404 }
      );
    }

    const updatedService = updatedResult[0];

    const ownerResult = await db
      .select({
        id: user.id,
        name: user.name,
        rating: profiles.rating
      })
      .from(user)
      .leftJoin(profiles, eq(user.id, profiles.userId))
      .where(eq(user.id, updatedService.ownerId))
      .limit(1);

    const owner = ownerResult[0] || { id: updatedService.ownerId, name: '', rating: 0 };

    const response = {
      id: updatedService.id,
      title: updatedService.title,
      description: updatedService.description,
      category: updatedService.category,
      price: updatedService.price,
      priceUnit: updatedService.priceUnit,
      location: updatedService.location,
      images: updatedService.images,
      availableDates: updatedService.availableDates,
      isAvailable: updatedService.isAvailable,
      createdAt: updatedService.createdAt,
      owner: {
        id: owner.id,
        name: owner.name,
        rating: owner.rating
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('PATCH service error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    const serviceId = parseInt(params.id);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const deletedResult = await db
      .delete(services)
      .where(and(eq(services.id, serviceId), eq(services.ownerId, currentUser.id)))
      .returning();

    if (deletedResult.length === 0) {
      return NextResponse.json(
        { error: 'Service not found or unauthorized', code: 'NOT_FOUND_OR_UNAUTHORIZED' },
        { status: 404 }
      );
    }

    const deletedService = deletedResult[0];

    const ownerResult = await db
      .select({
        id: user.id,
        name: user.name,
        rating: profiles.rating
      })
      .from(user)
      .leftJoin(profiles, eq(user.id, profiles.userId))
      .where(eq(user.id, deletedService.ownerId))
      .limit(1);

    const owner = ownerResult[0] || { id: deletedService.ownerId, name: '', rating: 0 };

    const response = {
      message: 'Service deleted successfully',
      service: {
        id: deletedService.id,
        title: deletedService.title,
        description: deletedService.description,
        category: deletedService.category,
        price: deletedService.price,
        priceUnit: deletedService.priceUnit,
        location: deletedService.location,
        images: deletedService.images,
        availableDates: deletedService.availableDates,
        isAvailable: deletedService.isAvailable,
        createdAt: deletedService.createdAt,
        owner: {
          id: owner.id,
          name: owner.name,
          rating: owner.rating
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('DELETE service error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}