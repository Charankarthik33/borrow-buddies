import { db } from '@/db';
import { follows } from '@/db/schema';

async function main() {
    const sampleFollows = [
        // Local SF Bay Area cluster - users following each other
        { followerId: 1, followingId: 3, createdAt: new Date('2024-07-15T10:30:00Z').toISOString() },
        { followerId: 3, followingId: 1, createdAt: new Date('2024-07-16T14:20:00Z').toISOString() },
        { followerId: 1, followingId: 7, createdAt: new Date('2024-08-02T09:15:00Z').toISOString() },
        { followerId: 7, followingId: 1, createdAt: new Date('2024-08-03T16:45:00Z').toISOString() },
        
        // NYC cluster follows
        { followerId: 2, followingId: 5, createdAt: new Date('2024-07-22T11:30:00Z').toISOString() },
        { followerId: 5, followingId: 2, createdAt: new Date('2024-07-23T08:45:00Z').toISOString() },
        { followerId: 2, followingId: 9, createdAt: new Date('2024-09-10T13:20:00Z').toISOString() },
        { followerId: 9, followingId: 2, createdAt: new Date('2024-09-11T15:30:00Z').toISOString() },
        
        // Service provider follows - photographers following event planners
        { followerId: 4, followingId: 6, createdAt: new Date('2024-08-15T10:00:00Z').toISOString() },
        { followerId: 6, followingId: 4, createdAt: new Date('2024-08-16T12:30:00Z').toISOString() },
        { followerId: 4, followingId: 8, createdAt: new Date('2024-09-05T14:15:00Z').toISOString() },
        
        // Fitness enthusiasts following trainers
        { followerId: 10, followingId: 1, createdAt: new Date('2024-08-20T07:30:00Z').toISOString() },
        { followerId: 11, followingId: 1, createdAt: new Date('2024-08-25T06:45:00Z').toISOString() },
        { followerId: 12, followingId: 7, createdAt: new Date('2024-09-01T08:20:00Z').toISOString() },
        
        // Cross-city professional follows
        { followerId: 3, followingId: 5, createdAt: new Date('2024-09-12T11:45:00Z').toISOString() },
        { followerId: 8, followingId: 2, createdAt: new Date('2024-09-18T16:20:00Z').toISOString() },
        { followerId: 6, followingId: 9, createdAt: new Date('2024-10-02T13:10:00Z').toISOString() },
        
        // Creative professionals network
        { followerId: 8, followingId: 4, createdAt: new Date('2024-10-08T15:30:00Z').toISOString() },
        { followerId: 4, followingId: 12, createdAt: new Date('2024-10-15T09:45:00Z').toISOString() },
        { followerId: 12, followingId: 6, createdAt: new Date('2024-10-20T14:25:00Z').toISOString() },
        
        // Interest-based follows (travel, lifestyle)
        { followerId: 10, followingId: 8, createdAt: new Date('2024-10-25T12:15:00Z').toISOString() },
        { followerId: 11, followingId: 3, createdAt: new Date('2024-11-01T10:30:00Z').toISOString() },
        { followerId: 5, followingId: 12, createdAt: new Date('2024-11-05T16:45:00Z').toISOString() },
        
        // One-way follows - aspiring professionals following established ones
        { followerId: 10, followingId: 4, createdAt: new Date('2024-11-10T13:20:00Z').toISOString() },
        { followerId: 11, followingId: 6, createdAt: new Date('2024-11-15T11:50:00Z').toISOString() },
        { followerId: 12, followingId: 2, createdAt: new Date('2024-11-20T14:35:00Z').toISOString() },
        
        // Recent follows - discovering new content
        { followerId: 7, followingId: 10, createdAt: new Date('2024-12-01T09:15:00Z').toISOString() },
        { followerId: 9, followingId: 11, createdAt: new Date('2024-12-08T15:40:00Z').toISOString() },
        { followerId: 1, followingId: 12, createdAt: new Date('2024-12-15T12:25:00Z').toISOString() },
        
        // Latest connections
        { followerId: 3, followingId: 10, createdAt: new Date('2024-12-20T10:55:00Z').toISOString() },
        { followerId: 6, followingId: 11, createdAt: new Date('2024-12-28T16:10:00Z').toISOString() },
    ];

    await db.insert(follows).values(sampleFollows);
    
    console.log('✅ Follows seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});