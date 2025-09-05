import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, users, posts } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Single booking by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const booking = await db.select()
        .from(bookings)
        .where(eq(bookings.id, parseInt(id)))
        .limit(1);

      if (booking.length === 0) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      return NextResponse.json(booking[0]);
    }

    // List bookings with filters and pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const renterId = searchParams.get('renterId');
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(bookings);
    let conditions = [];

    // Additional filters
    if (renterId) {
      conditions.push(eq(bookings.renterId, parseInt(renterId)));
    }
    if (providerId) {
      conditions.push(eq(bookings.providerId, parseInt(providerId)));
    }
    if (status) {
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json({ 
          error: "Invalid status. Must be one of: pending, confirmed, completed, cancelled",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      conditions.push(eq(bookings.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const sortColumn = sort === 'startDate' ? bookings.startDate :
                      sort === 'endDate' ? bookings.endDate :
                      sort === 'totalAmount' ? bookings.totalAmount :
                      sort === 'status' ? bookings.status :
                      bookings.createdAt;
    
    query = order === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn));
    
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
    const { renterId, providerId, postId, startDate, endDate, totalAmount, status = 'pending' } = requestBody;

    // Validate required fields
    if (!renterId) {
      return NextResponse.json({ 
        error: "Renter ID is required",
        code: "MISSING_RENTER_ID" 
      }, { status: 400 });
    }
    if (!providerId) {
      return NextResponse.json({ 
        error: "Provider ID is required",
        code: "MISSING_PROVIDER_ID" 
      }, { status: 400 });
    }
    if (!postId) {
      return NextResponse.json({ 
        error: "Post ID is required",
        code: "MISSING_POST_ID" 
      }, { status: 400 });
    }
    if (!startDate) {
      return NextResponse.json({ 
        error: "Start date is required",
        code: "MISSING_START_DATE" 
      }, { status: 400 });
    }
    if (!endDate) {
      return NextResponse.json({ 
        error: "End date is required",
        code: "MISSING_END_DATE" 
      }, { status: 400 });
    }
    if (totalAmount === undefined || totalAmount === null) {
      return NextResponse.json({ 
        error: "Total amount is required",
        code: "MISSING_TOTAL_AMOUNT" 
      }, { status: 400 });
    }

    // Prevent self-booking
    if (parseInt(renterId) === parseInt(providerId)) {
      return NextResponse.json({ 
        error: "Cannot book your own service",
        code: "SELF_BOOKING_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate post exists
    const post = await db.select()
      .from(posts)
      .where(eq(posts.id, parseInt(postId)))
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json({ 
        error: "Post not found",
        code: "POST_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate users exist
    const renter = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(renterId)))
      .limit(1);

    if (renter.length === 0) {
      return NextResponse.json({ 
        error: "Renter not found",
        code: "RENTER_NOT_FOUND" 
      }, { status: 400 });
    }

    const provider = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(providerId)))
      .limit(1);

    if (provider.length === 0) {
      return NextResponse.json({ 
        error: "Service provider not found",
        code: "PROVIDER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    const now = new Date();

    if (isNaN(startDateTime.getTime())) {
      return NextResponse.json({ 
        error: "Invalid start date format",
        code: "INVALID_START_DATE" 
      }, { status: 400 });
    }

    if (isNaN(endDateTime.getTime())) {
      return NextResponse.json({ 
        error: "Invalid end date format",
        code: "INVALID_END_DATE" 
      }, { status: 400 });
    }

    if (startDateTime < now) {
      return NextResponse.json({ 
        error: "Start date cannot be in the past",
        code: "PAST_START_DATE" 
      }, { status: 400 });
    }

    if (endDateTime <= startDateTime) {
      return NextResponse.json({ 
        error: "End date must be after start date",
        code: "INVALID_DATE_RANGE" 
      }, { status: 400 });
    }

    // Validate total amount
    if (totalAmount <= 0) {
      return NextResponse.json({ 
        error: "Total amount must be positive",
        code: "INVALID_TOTAL_AMOUNT" 
      }, { status: 400 });
    }

    // Validate status
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be one of: pending, confirmed, completed, cancelled",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Create booking
    const newBooking = await db.insert(bookings)
      .values({
        renterId: parseInt(renterId),
        providerId: parseInt(providerId),
        postId: parseInt(postId),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        totalAmount: parseFloat(totalAmount.toString()),
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newBooking[0], { status: 201 });

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

    // Check booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const requestBody = await request.json();
    const { startDate, endDate, totalAmount, status } = requestBody;
    let updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate status if provided
    if (status !== undefined) {
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json({ 
          error: "Invalid status. Must be one of: pending, confirmed, completed, cancelled",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = status;
    }

    // Validate dates if provided
    if (startDate !== undefined) {
      const startDateTime = new Date(startDate);
      if (isNaN(startDateTime.getTime())) {
        return NextResponse.json({ 
          error: "Invalid start date format",
          code: "INVALID_START_DATE" 
        }, { status: 400 });
      }
      if (startDateTime < new Date()) {
        return NextResponse.json({ 
          error: "Start date cannot be in the past",
          code: "PAST_START_DATE" 
        }, { status: 400 });
      }
      updates.startDate = startDateTime.toISOString();
    }

    if (endDate !== undefined) {
      const endDateTime = new Date(endDate);
      if (isNaN(endDateTime.getTime())) {
        return NextResponse.json({ 
          error: "Invalid end date format",
          code: "INVALID_END_DATE" 
        }, { status: 400 });
      }
      
      const compareStartDate = updates.startDate ? new Date(updates.startDate) : new Date(existingBooking[0].startDate);
      if (endDateTime <= compareStartDate) {
        return NextResponse.json({ 
          error: "End date must be after start date",
          code: "INVALID_DATE_RANGE" 
        }, { status: 400 });
      }
      updates.endDate = endDateTime.toISOString();
    }

    // Validate total amount if provided
    if (totalAmount !== undefined) {
      if (totalAmount <= 0) {
        return NextResponse.json({ 
          error: "Total amount must be positive",
          code: "INVALID_TOTAL_AMOUNT" 
        }, { status: 400 });
      }
      updates.totalAmount = parseFloat(totalAmount.toString());
    }

    const updated = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

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

    // Check booking exists
    const existingBooking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const deleted = await db.delete(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Booking deleted successfully',
      booking: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}