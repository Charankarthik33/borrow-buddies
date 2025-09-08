import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { services, user, profiles } from '@/db/schema';
import { eq, like, and, or, desc, asc, sql, gte, lte, inArray } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '9999999');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const availability = searchParams.get('availability') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = db.select({
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
      ownerId: services.ownerId,
      owner: {
        id: user.id,
        name: user.name,
        rating: profiles.rating
      }
    })
      .from(services)
      .leftJoin(user, eq(services.ownerId, user.id))
      .leftJoin(profiles, eq(user.id, profiles.userId));

    const conditions = [];

    if (q) {
      conditions.push(
        or(
          like(services.title, `%${q}%`),
          like(services.description, `%${q}%`)
        )
      );
    }

    if (category) {
      conditions.push(eq(services.category, category));
    }

    if (location) {
      conditions.push(eq(services.location, location));
    }

    if (minPrice > 0 || maxPrice < 9999999) {
      conditions.push(
        and(
          gte(services.price, minPrice),
          lte(services.price, maxPrice)
        )
      );
    }

    if (availability === 'available') {
      conditions.push(eq(services.isAvailable, true));
    } else if (availability === 'unavailable') {
      conditions.push(eq(services.isAvailable, false));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    let sortField;
    if (sortBy === 'price') {
      sortField = services.price;
    } else if (sortBy === 'rating') {
      sortField = profiles.rating;
    } else {
      sortField = services.createdAt;
    }
    query = query.orderBy(desc(sortField));

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET services error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    // Security check: reject if ownerId provided in body
    if ('ownerId' in body || 'owner_id' in body || 'userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "Owner ID cannot be provided in request body",
        code: "OWNER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const {
      title,
      description,
      category,
      price,
      priceUnit,
      location,
      images,
      availableDates,
      isAvailable
    } = body;

    // Validation
    if (!title || !description || price === undefined) {
      return NextResponse.json({ 
        error: 'Required fields are missing',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json({ 
        error: 'Price must be a non-negative number',
        code: 'INVALID_PRICE'
      }, { status: 400 });
    }

    if (priceUnit && !['hour', 'day', 'session'].includes(priceUnit)) {
      return NextResponse.json({ 
        error: 'Invalid price unit',
        code: 'INVALID_PRICE_UNIT'
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    const newService = await db.insert(services)
      .values({
        ownerId: currentUser.id,
        title: title.trim(),
        description: description.trim(),
        category: category?.trim() || null,
        price: Math.round(price),
        priceUnit: priceUnit || 'hour',
        location: location?.trim() || null,
        images: JSON.stringify(images || []),
        availableDates: JSON.stringify(availableDates || []),
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        createdAt: now
      })
      .returning();

    const result = await db.select({
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
      owner: {
        id: user.id,
        name: user.name
      }
    })
      .from(services)
      .leftJoin(user, eq(services.ownerId, user.id))
      .where(eq(services.id, newService[0].id))
      .limit(1);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('POST service error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}