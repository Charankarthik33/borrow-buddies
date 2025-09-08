import { db } from '@/db';
import { follows } from '@/db/schema';

async function main() {
    const sampleFollows = [
        // Accepted follows (8)
        {
            followerId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            followingId: 'user_01h4kxt2f1a2b3c4d5e6f7g8h9',
            status: 'accepted',
            createdAt: new Date('2024-01-10').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2f1a2b3c4d5e6f7g8h9',
            followingId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            status: 'accepted',
            createdAt: new Date('2024-01-12').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2i1j2k3l4m5n6o7p8q9',
            followingId: 'user_01h4kxt2r2s3t4u5v6w7x8y9z0',
            status: 'accepted',
            createdAt: new Date('2024-02-01').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2r2s3t4u5v6w7x8y9z0',
            followingId: 'user_01h4kxt2i1j2k3l4m5n6o7p8q9',
            status: 'accepted',
            createdAt: new Date('2024-02-05').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2a3b4c5d6e7f8g9h0i1',
            followingId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            status: 'accepted',
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2j2k3l4m5n6o7p8q9r0',
            followingId: 'user_01h4kxt2f1a2b3c4d5e6f7g8h9',
            status: 'accepted',
            createdAt: new Date('2024-03-01').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2s3t4u5v6w7x8y9z0a1',
            followingId: 'user_01h4kxt2i1j2k3l4m5n6o7p8q9',
            status: 'accepted',
            createdAt: new Date('2024-03-10').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2b4c5d6e7f8g9h0i1j2',
            followingId: 'user_01h4kxt2r2s3t4u5v6w7x8y9z0',
            status: 'accepted',
            createdAt: new Date('2024-03-15').toISOString(),
        },
        // Pending follows (3)
        {
            followerId: 'user_01h4kxt2t4u5v6w7x8y9z0a2b3',
            followingId: 'user_01h4kxt2a3b4c5d6e7f8g9h0i1',
            status: 'pending',
            createdAt: new Date('2024-03-20').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2u5v6w7x8y9z0a3b4c5',
            followingId: 'user_01h4kxt2j2k3l4m5n6o7p8q9r0',
            status: 'pending',
            createdAt: new Date('2024-03-25').toISOString(),
        },
        {
            followerId: 'user_01h4kxt2v6w7x8y9z0a4b5c6d7',
            followingId: 'user_01h4kxt2s3t4u5v6w7x8y9z0a1',
            status: 'pending',
            createdAt: new Date('2024-04-01').toISOString(),
        },
        // Rejected follow (1)
        {
            followerId: 'user_01h4kxt2w7x8y9z0a5b6c7d8e9',
            followingId: 'user_01h4kxt2t4u5v6w7x8y9z0a2b3',
            status: 'rejected',
            createdAt: new Date('2024-04-05').toISOString(),
        }
    ];

    await db.insert(follows).values(sampleFollows);
    
    console.log('✅ Follows seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});