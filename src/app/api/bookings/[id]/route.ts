import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, services, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const ACTION_STATUS_MAP = {
  cancel: 'cancelled',
  confirm: 'confirmed',
  complete: 'completed',
  reject: 'rejected'
} as const;

type ActionType = keyof typeof ACTION_STATUS_MAP;

export async function PATCH(
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

    const bookingId = parseInt(params.id);
    if (isNaN(bookingId)) {
      return NextResponse.json({ 
        error: 'Valid booking ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (!action || !Object.keys(ACTION_STATUS_MAP).includes(action)) {
      return NextResponse.json({ 
        error: 'Valid action is required (cancel, confirm, complete, reject)',
        code: 'INVALID_ACTION'
      }, { status: 400 });
    }

    // Get booking with service and customer details
    const [booking] = await db
      .select({
        id: bookings.id,
        serviceId: bookings.serviceId,
        customerId: bookings.customerId,
        status: bookings.status,
        date: bookings.date,
        totalPrice: bookings.totalPrice,
        createdAt: bookings.createdAt,
        service: {
          id: services.id,
          title: services.title,
          ownerId: services.ownerId
        },
        customer: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(user, eq(bookings.customerId, user.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ 
        error: 'Booking not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    // Check authorization based on action
    const actionType = action as ActionType;
    
    if (actionType === 'cancel') {
      // Only customer can cancel
      if (booking.customerId !== user.id) {
        return NextResponse.json({ 
          error: 'Only the customer can cancel this booking',
          code: 'FORBIDDEN'
        }, { status: 403 });
      }
      
      // Can only cancel pending or confirmed bookings
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return NextResponse.json({ 
          error: 'Cannot cancel booking in current status',
          code: 'INVALID_STATUS'
        }, { status: 400 });
      }
    } else if (actionType === 'confirm' || actionType === 'reject') {
      // Only service owner can confirm or reject
      if (booking.service.ownerId !== user.id) {
        return NextResponse.json({ 
          error: 'Only the service owner can confirm or reject this booking',
          code: 'FORBIDDEN'
        }, { status: 403 });
      }
      
      // Can only confirm/reject pending bookings
      if (booking.status !== 'pending') {
        return NextResponse.json({ 
          error: 'Cannot confirm/reject booking in current status',
          code: 'INVALID_STATUS'
        }, { status: 400 });
      }
    } else if (actionType === 'complete') {
      // Both customer and service owner can complete
      if (booking.customerId !== user.id && booking.service.ownerId !== user.id) {
        return NextResponse.json({ 
          error: 'Only the customer or service owner can complete this booking',
          code: 'FORBIDDEN'
        }, { status: 403 });
      }
      
      // Can only complete confirmed bookings
      if (booking.status !== 'confirmed') {
        return NextResponse.json({ 
          error: 'Cannot complete booking in current status',
          code: 'INVALID_STATUS'
        }, { status: 400 });
      }
    }

    // Update booking status
    const newStatus = ACTION_STATUS_MAP[actionType];
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status: newStatus })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      ...updatedBooking,
      service: booking.service,
      customer: booking.customer
    });

  } catch (error) {
    console.error('PATCH booking status error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}