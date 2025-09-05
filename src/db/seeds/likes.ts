import { db } from '@/db';
import { likes } from '@/db/schema';

async function main() {
    const sampleLikes = [
        // Popular fitness trainer post getting likes from health-conscious users
        { userId: 2, postId: 1, createdAt: new Date('2024-01-15T09:30:00Z').toISOString() },
        { userId: 4, postId: 1, createdAt: new Date('2024-01-15T10:15:00Z').toISOString() },
        { userId: 7, postId: 1, createdAt: new Date('2024-01-15T11:45:00Z').toISOString() },
        { userId: 9, postId: 1, createdAt: new Date('2024-01-15T14:20:00Z').toISOString() },
        { userId: 11, postId: 1, createdAt: new Date('2024-01-16T08:30:00Z').toISOString() },
        
        // Photography service post getting likes from creatives
        { userId: 3, postId: 2, createdAt: new Date('2024-01-18T13:45:00Z').toISOString() },
        { userId: 5, postId: 2, createdAt: new Date('2024-01-18T15:20:00Z').toISOString() },
        { userId: 8, postId: 2, createdAt: new Date('2024-01-19T09:10:00Z').toISOString() },
        
        // Local SF cleaning service getting likes from SF users
        { userId: 1, postId: 3, createdAt: new Date('2024-01-20T16:30:00Z').toISOString() },
        { userId: 6, postId: 3, createdAt: new Date('2024-01-20T18:45:00Z').toISOString() },
        { userId: 10, postId: 3, createdAt: new Date('2024-01-21T07:15:00Z').toISOString() },
        { userId: 12, postId: 3, createdAt: new Date('2024-01-21T12:30:00Z').toISOString() },
        
        // Food/cooking post getting likes from food enthusiasts
        { userId: 2, postId: 4, createdAt: new Date('2024-01-22T19:20:00Z').toISOString() },
        { userId: 7, postId: 4, createdAt: new Date('2024-01-22T20:15:00Z').toISOString() },
        { userId: 9, postId: 4, createdAt: new Date('2024-01-23T08:45:00Z').toISOString() },
        
        // Design service post getting moderate engagement
        { userId: 4, postId: 5, createdAt: new Date('2024-01-25T11:30:00Z').toISOString() },
        { userId: 8, postId: 5, createdAt: new Date('2024-01-25T14:20:00Z').toISOString() },
        { userId: 11, postId: 5, createdAt: new Date('2024-01-26T09:15:00Z').toISOString() },
        
        // Single like on a personal post
        { userId: 3, postId: 6, createdAt: new Date('2024-01-28T16:45:00Z').toISOString() },
        
        // Popular dog walking service post
        { userId: 1, postId: 7, createdAt: new Date('2024-02-01T10:30:00Z').toISOString() },
        { userId: 2, postId: 7, createdAt: new Date('2024-02-01T12:15:00Z').toISOString() },
        { userId: 5, postId: 7, createdAt: new Date('2024-02-01T15:45:00Z').toISOString() },
        { userId: 9, postId: 7, createdAt: new Date('2024-02-02T08:20:00Z').toISOString() },
        { userId: 12, postId: 7, createdAt: new Date('2024-02-02T13:30:00Z').toISOString() },
        
        // Yoga instructor post getting likes from wellness community
        { userId: 6, postId: 8, createdAt: new Date('2024-02-05T07:45:00Z').toISOString() },
        { userId: 10, postId: 8, createdAt: new Date('2024-02-05T09:30:00Z').toISOString() },
        { userId: 11, postId: 8, createdAt: new Date('2024-02-05T11:15:00Z').toISOString() },
        
        // Recent tech tutoring post
        { userId: 3, postId: 9, createdAt: new Date('2024-02-08T14:20:00Z').toISOString() },
        { userId: 7, postId: 9, createdAt: new Date('2024-02-08T16:45:00Z').toISOString() },
        
        // Art/creative post getting creative community likes
        { userId: 4, postId: 10, createdAt: new Date('2024-02-10T12:30:00Z').toISOString() },
        { userId: 8, postId: 10, createdAt: new Date('2024-02-10T15:20:00Z').toISOString() },
        { userId: 5, postId: 10, createdAt: new Date('2024-02-11T09:45:00Z').toISOString() },
        
        // Recent handyman service post
        { userId: 1, postId: 11, createdAt: new Date('2024-02-12T11:15:00Z').toISOString() },
        { userId: 6, postId: 11, createdAt: new Date('2024-02-12T13:30:00Z').toISOString() },
        { userId: 12, postId: 11, createdAt: new Date('2024-02-13T08:45:00Z').toISOString() },
        
        // Cooking lesson post
        { userId: 2, postId: 12, createdAt: new Date('2024-02-14T18:20:00Z').toISOString() },
        { userId: 9, postId: 12, createdAt: new Date('2024-02-14T19:15:00Z').toISOString() },
        
        // Recent fitness post getting immediate engagement
        { userId: 7, postId: 13, createdAt: new Date('2024-02-15T06:30:00Z').toISOString() },
        { userId: 10, postId: 13, createdAt: new Date('2024-02-15T07:45:00Z').toISOString() },
        { userId: 11, postId: 13, createdAt: new Date('2024-02-15T09:20:00Z').toISOString() },
        
        // Single like on personal share
        { userId: 4, postId: 14, createdAt: new Date('2024-02-16T16:30:00Z').toISOString() },
        
        // Recent gardening service post
        { userId: 1, postId: 15, createdAt: new Date('2024-02-17T14:15:00Z').toISOString() },
        { userId: 3, postId: 15, createdAt: new Date('2024-02-17T15:45:00Z').toISOString() }
    ];

    await db.insert(likes).values(sampleLikes);
    
    console.log('✅ Likes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});