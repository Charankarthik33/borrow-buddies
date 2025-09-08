import { db } from '@/db';
import { bookings } from '@/db/schema';

async function main() {
    const sampleBookings = [
        {
            serviceId: 1,
            customerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
            date: '2024-01-15',
            durationHours: 2,
            totalPrice: 120,
            status: 'pending',
            createdAt: new Date('2024-01-01T10:30:00').toISOString(),
        },
        {
            serviceId: 2,
            customerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r6',
            date: '2024-01-20',
            durationHours: 3,
            totalPrice: 225,
            status: 'pending',
            createdAt: new Date('2024-01-02T14:15:00').toISOString(),
        },
        {
            serviceId: 3,
            customerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r7',
            date: '2024-01-25',
            durationHours: 1,
            totalPrice: 75,
            status: 'confirmed',
            createdAt: new Date('2024-01-03T09:45:00').toISOString(),
        },
        {
            serviceId: 4,
            customerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r8',
            date: '2024-02-01',
            durationHours: 4,
            totalPrice: 400,
            status: 'confirmed',
            createdAt: new Date('2024-01-05T16:20:00').toISOString(),
        },
        {
            serviceId: 5,
            customerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r9',
            date: '2024-02-05',
            durationHours: 2,
            totalPrice: 150,
            status: 'completed',
            createdAt: new Date('2024-01-10T11:00:00').toISOString(),
        },
        {
            serviceId: 6,
            customerId: 'user_01h4kxt2e8z9y3b1n7m6q5w9r0',
            date: '2024-02-10',
            durationHours: 5,
            totalPrice: 500,
            status: 'completed',
            createdAt: new Date('2024-01-12T13:30:00').toISOString(),
        },
        {
            serviceId: 7,
            customerId: 'user_01h4kxt2e8z9y3b1n7m6q5w9r1',
            date: '2024-02-15',
            durationHours: 6,
            totalPrice: 450,
            status: 'cancelled',
            createdAt: new Date('2024-01-08T15:45:00').toISOString(),
        },
        {
            serviceId: 8,
            customerId: 'user_01h4kxt2e8z9y3b1n7m6q5w9r2',
            date: '2024-02-20',
            durationHours: 8,
            totalPrice: 800,
            status: 'rejected',
            createdAt: new Date('2024-01-18T09:15:00').toISOString(),
        },
    ];

    await db.insert(bookings).values(sampleBookings);
    
    console.log('✅ Bookings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});