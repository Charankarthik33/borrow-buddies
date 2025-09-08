import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, services, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const results = await db
      .select({
        id: bookings.id,
        serviceId: bookings.serviceId,
        customerId: bookings.customerId,
        date: bookings.date,
        durationHours: bookings.durationHours,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        createdAt: bookings.createdAt,
        service: {
          id: services.id,
          title: services.title,
          category: services.category,
          price: services.price,
          priceUnit: services.priceUnit,
          owner: {
            id: user.id,
            name: user.name
          }
        }
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(user, eq(services.ownerId, user.id))
      .where(eq(bookings.customerId, currentUser.id));

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET bookings error:', error);
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
    
    // Security check: reject if customerId provided in body
    if ('customerId' in body || 'customer_id' in body || 'userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { serviceId, date, durationHours } = body;

    // Validate required fields
    if (!serviceId || !date || !durationHours) {
      return NextResponse.json({ 
        error: 'Missing required fields: serviceId, date, durationHours',
        code: 'MISSING_REQUIRED_FIELD'
      }, { status: 400 });
    }

    // Validate data types
    if (typeof serviceId !== 'number' || typeof durationHours !== 'number') {
      return NextResponse.json({ 
        error: 'serviceId and durationHours must be numbers',
        code: 'INVALID_FIELD_TYPE'
      }, { status: 400 });
    }

    // Validate durationHours is positive
    if (durationHours <= 0) {
      return NextResponse.json({ 
        error: 'durationHours must be greater than 0',
        code: 'INVALID_DURATION'
      }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ 
        error: 'Date must be in YYYY-MM-DD format',
        code: 'INVALID_DATE_FORMAT'
      }, { status: 400 });
    }

    // Check if service exists and is available
    const service = await db
      .select({
        id: services.id,
        price: services.price,
        isAvailable: services.isAvailable
      })
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (service.length === 0) {
      return NextResponse.json({ 
        error: 'Service not found',
        code: 'SERVICE_NOT_FOUND'
      }, { status: 404 });
    }

    if (!service[0].isAvailable) {
      return NextResponse.json({ 
        error: 'Service is not available',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 400 });
    }

    // Calculate total price
    const totalPrice = service[0].price * durationHours;

    // Create booking
    const newBooking = await db
      .insert(bookings)
      .values({
        serviceId,
        customerId: currentUser.id,
        date,
        durationHours,
        totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error('POST bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}