import { db } from '@/db';
import { conversationParticipants } from '@/db/schema';

async function main() {
    const sampleParticipants = [
        {
            conversationId: 1,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            lastReadMessageId: null,
        },
        {
            conversationId: 1,
            userId: 'user_02s5mgu3f7x8c4d2e9w3q1z6y9',
            lastReadMessageId: null,
        },
        {
            conversationId: 2,
            userId: 'user_03t6nhv4g8y9d5e3f0r4q2z7a8',
            lastReadMessageId: null,
        },
        {
            conversationId: 2,
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            lastReadMessageId: null,
        },
        {
            conversationId: 3,
            userId: 'user_04u7oiw5h9z0e6f4g1s5q3a9b1',
            lastReadMessageId: null,
        },
        {
            conversationId: 3,
            userId: 'user_02s5mgu3f7x8c4d2e9w3q1z6y9',
            lastReadMessageId: null,
        },
        {
            conversationId: 4,
            userId: 'user_03t6nhv4g8y9d5e3f0r4q2z7a8',
            lastReadMessageId: null,
        },
        {
            conversationId: 4,
            userId: 'user_04u7oiw5h9z0e6f4g1s5q3a9b1',
            lastReadMessageId: null,
        }
    ];

    await db.insert(conversationParticipants).values(sampleParticipants);
    
    console.log('✅ Conversation participants seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});