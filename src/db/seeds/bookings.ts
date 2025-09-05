import { db } from '@/db';
import { bookings } from '@/db/schema';

async function main() {
    const sampleBookings = [
        {
            renterId: 2,
            providerId: 5,
            postId: 15,
            startDate: new Date('2024-01-20T10:00:00Z').toISOString(),
            endDate: new Date('2024-01-20T12:00:00Z').toISOString(),
            totalAmount: 25000,
            status: 'completed',
            createdAt: new Date('2024-01-15T09:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-20T12:30:00Z').toISOString(),
        },
        {
            renterId: 1,
            providerId: 11,
            postId: 23,
            startDate: new Date('2024-02-14T14:00:00Z').toISOString(),
            endDate: new Date('2024-02-14T16:00:00Z').toISOString(),
            totalAmount: 18000,
            status: 'confirmed',
            createdAt: new Date('2024-02-10T11:30:00Z').toISOString(),
            updatedAt: new Date('2024-02-12T08:15:00Z').toISOString(),
        },
        {
            renterId: 3,
            providerId: 8,
            postId: 19,
            startDate: new Date('2024-01-25T16:00:00Z').toISOString(),
            endDate: new Date('2024-01-25T18:00:00Z').toISOString(),
            totalAmount: 6000,
            status: 'completed',
            createdAt: new Date('2024-01-22T14:20:00Z').toISOString(),
            updatedAt: new Date('2024-01-25T18:30:00Z').toISOString(),
        },
        {
            renterId: 1,
            providerId: 4,
            postId: 12,
            startDate: new Date('2024-02-05T09:00:00Z').toISOString(),
            endDate: new Date('2024-02-05T13:00:00Z').toISOString(),
            totalAmount: 12000,
            status: 'completed',
            createdAt: new Date('2024-02-01T16:45:00Z').toISOString(),
            updatedAt: new Date('2024-02-05T13:15:00Z').toISOString(),
        },
        {
            renterId: 9,
            providerId: 10,
            postId: 27,
            startDate: new Date('2024-02-20T07:00:00Z').toISOString(),
            endDate: new Date('2024-02-20T08:00:00Z').toISOString(),
            totalAmount: 8000,
            status: 'confirmed',
            createdAt: new Date('2024-02-18T19:30:00Z').toISOString(),
            updatedAt: new Date('2024-02-19T10:00:00Z').toISOString(),
        },
        {
            renterId: 3,
            providerId: 6,
            postId: 21,
            startDate: new Date('2024-03-01T18:00:00Z').toISOString(),
            endDate: new Date('2024-03-03T10:00:00Z').toISOString(),
            totalAmount: 10000,
            status: 'pending',
            createdAt: new Date('2024-02-28T13:15:00Z').toISOString(),
            updatedAt: new Date('2024-02-28T13:15:00Z').toISOString(),
        },
        {
            renterId: 6,
            providerId: 7,
            postId: 18,
            startDate: new Date('2024-01-30T15:00:00Z').toISOString(),
            endDate: new Date('2024-01-30T16:00:00Z').toISOString(),
            totalAmount: 7500,
            status: 'completed',
            createdAt: new Date('2024-01-28T12:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-30T16:30:00Z').toISOString(),
        },
        {
            renterId: 4,
            providerId: 9,
            postId: 25,
            startDate: new Date('2024-02-28T19:00:00Z').toISOString(),
            endDate: new Date('2024-02-28T21:00:00Z').toISOString(),
            totalAmount: 9500,
            status: 'cancelled',
            createdAt: new Date('2024-02-25T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-02-27T14:20:00Z').toISOString(),
        },
        {
            renterId: 7,
            providerId: 3,
            postId: 14,
            startDate: new Date('2024-03-10T11:00:00Z').toISOString(),
            endDate: new Date('2024-03-10T15:00:00Z').toISOString(),
            totalAmount: 15000,
            status: 'confirmed',
            createdAt: new Date('2024-03-05T08:45:00Z').toISOString(),
            updatedAt: new Date('2024-03-07T16:30:00Z').toISOString(),
        },
        {
            renterId: 8,
            providerId: 2,
            postId: 29,
            startDate: new Date('2024-03-15T13:00:00Z').toISOString(),
            endDate: new Date('2024-03-15T17:00:00Z').toISOString(),
            totalAmount: 22000,
            status: 'pending',
            createdAt: new Date('2024-03-12T15:20:00Z').toISOString(),
            updatedAt: new Date('2024-03-12T15:20:00Z').toISOString(),
        }
    ];

    await db.insert(bookings).values(sampleBookings);
    
    console.log('✅ Bookings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});