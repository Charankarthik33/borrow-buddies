import { db } from '@/db';
import { conversations } from '@/db/schema';

async function main() {
    const sampleConversations = [
        {
            isGroup: false,
            createdAt: new Date('2024-01-15T10:30:00').toISOString(),
        },
        {
            isGroup: false,
            createdAt: new Date('2024-01-16T14:45:00').toISOString(),
        },
        {
            isGroup: false,
            createdAt: new Date('2024-01-17T09:15:00').toISOString(),
        },
        {
            isGroup: false,
            createdAt: new Date('2024-01-18T16:20:00').toISOString(),
        }
    ];

    await db.insert(conversations).values(sampleConversations);
    
    console.log('✅ Conversations seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});