import { db } from '@/db';
import { contacts } from '@/db/schema';

async function main() {
    const sampleContacts = [
        {
            ownerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            contactUserId: 'user_02j5lyu3f0a1z4c2d8e7f6g9h1',
            createdAt: new Date('2024-10-15T10:30:00').toISOString(),
        },
        {
            ownerId: 'user_02j5lyu3f0a1z4c2d8e7f6g9h1',
            contactUserId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            createdAt: new Date('2024-10-15T11:15:00').toISOString(),
        },
        {
            ownerId: 'user_03k6mzv4g1b2a5d3e9f8g0h2i3',
            contactUserId: 'user_04l7naw5h2c3b6e0f1g9h3i4j5',
            createdAt: new Date('2024-10-16T14:20:00').toISOString(),
        },
        {
            ownerId: 'user_04l7naw5h2c3b6e0f1g9h3i4j5',
            contactUserId: 'user_03k6mzv4g1b2a5d3e9f8g0h2i3',
            createdAt: new Date('2024-10-16T15:45:00').toISOString(),
        },
        {
            ownerId: 'user_05m8obx6i3d4c7f1g2h0i4j5k6',
            contactUserId: 'user_06n9pcy7j4e5d8g2h3i5j6k7l8',
            createdAt: new Date('2024-10-17T09:00:00').toISOString(),
        },
        {
            ownerId: 'user_06n9pcy7j4e5d8g2h3i5j6k7l8',
            contactUserId: 'user_07o0qdz8k5f6e9g3h4i6j7k8l9',
            createdAt: new Date('2024-10-17T16:30:00').toISOString(),
        },
        {
            ownerId: 'user_07o0qdz8k5f6e9g3h4i6j7k8l9',
            contactUserId: 'user_08p1rea0l6g7f0h4i5j8k9l0m1',
            createdAt: new Date('2024-10-18T12:00:00').toISOString(),
        },
        {
            ownerId: 'user_08p1rea0l6g7f0h4i5j8k9l0m1',
            contactUserId: 'user_05m8obx6i3d4c7f1g2h0i4j5k6',
            createdAt: new Date('2024-10-18T18:45:00').toISOString(),
        },
    ];

    await db.insert(contacts).values(sampleContacts);
    
    console.log('✅ Contacts seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});