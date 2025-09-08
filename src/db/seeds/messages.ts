import { db } from '@/db';
import { messages } from '@/db/schema';

async function main() {
    const sampleMessages = [
        // Conversation 1: Between user_123456 and user_234567
        {
            conversationId: 1,
            senderId: 'user_123456',
            content: 'Hey! How are you doing? 😊',
            status: 'read',
            createdAt: new Date('2024-01-15T10:00:00').toISOString(),
        },
        {
            conversationId: 1,
            senderId: 'user_234567',
            content: "Hi! I'm doing great, thanks for asking! How about you?",
            status: 'read',
            createdAt: new Date('2024-01-15T10:05:00').toISOString(),
        },
        {
            conversationId: 1,
            senderId: 'user_123456',
            content: "I'm good too! Would you be interested in grabbing coffee this weekend?",
            status: 'delivered',
            createdAt: new Date('2024-01-15T10:10:00').toISOString(),
        },
        {
            conversationId: 1,
            senderId: 'user_234567',
            content: "That sounds wonderful! There's a new cafe downtown I've been wanting to try. How about Saturday at 2 PM?",
            status: 'sent',
            createdAt: new Date('2024-01-15T10:15:00').toISOString(),
        },

        // Conversation 2: Between user_345678 and user_456789
        {
            conversationId: 2,
            senderId: 'user_345678',
            content: 'Good morning! I wanted to follow up on the project proposal we discussed yesterday.',
            status: 'read',
            createdAt: new Date('2024-01-16T09:00:00').toISOString(),
        },
        {
            conversationId: 2,
            senderId: 'user_456789',
            content: "Yes, I reviewed it thoroughly last night. I think the timeline is realistic, but I'd like to discuss the budget allocation a bit more.",
            status: 'read',
            createdAt: new Date('2024-01-16T09:30:00').toISOString(),
        },
        {
            conversationId: 2,
            senderId: 'user_345678',
            content: "Absolutely! The budget was my concern too. The equipment costs seem higher than expected. Shall we schedule a meeting to go through it line by line?",
            status: 'delivered',
            createdAt: new Date('2024-01-16T10:00:00').toISOString(),
        },
        {
            conversationId: 2,
            senderId: 'user_456789',
            content: "That would be perfect! How about tomorrow afternoon? I have a free slot at 3 PM. We can discuss alternatives for those high-cost items.",
            status: 'sent',
            createdAt: new Date('2024-01-16T11:15:00').toISOString(),
        },

        // Conversation 3: Between user_567890, user_678901, and user_789012
        {
            conversationId: 3,
            senderId: 'user_567890',
            content: "Hey everyone! I've been thinking about planning a hiking trip next month. Who's interested?",
            status: 'read',
            createdAt: new Date('2024-01-17T18:00:00').toISOString(),
        },
        {
            conversationId: 3,
            senderId: 'user_678901',
            content: "Count me in! I've been wanting to hit the trails. Did you have a specific location in mind?",
            status: 'read',
            createdAt: new Date('2024-01-17T18:30:00').toISOString(),
        },
        {
            conversationId: 3,
            senderId: 'user_789012',
            content: "Yes! I heard the trails at Mountain Ridge are fantastic this time of year. We should check the weather forecast first though.",
            status: 'delivered',
            createdAt: new Date('2024-01-17T19:00:00').toISOString(),
        },
        {
            conversationId: 3,
            senderId: 'user_567890',
            content: "Mountain Ridge it is then! I'll create a poll in our group chat to pick the best weekend. Looking forward to it! 🏔️",
            status: 'sent',
            createdAt: new Date('2024-01-17T19:30:00').toISOString(),
        },

        // Conversation 4: Between user_890123 and user_901234
        {
            conversationId: 4,
            senderId: 'user_890123',
            content: 'Hi Sarah! I just finished reading the book you recommended. It was absolutely incredible!',
            status: 'read',
            createdAt: new Date('2024-01-18T14:00:00').toISOString(),
        },
        {
            conversationId: 4,
            senderId: 'user_901234',
            content: "Oh wonderful! I'm so glad you enjoyed it! Which part did you like the most? The plot twist always gets me.",
            status: 'read',
            createdAt: new Date('2024-01-18T14:15:00').toISOString(),
        },
        {
            conversationId: 4,
            senderId: 'user_890123',
            content: "The ending was mind-blowing! I definitely didn't see it coming. Do you have any other recommendations from the same author?",
            status: 'delivered',
            createdAt: new Date('2024-01-18T14:30:00').toISOString(),
        },
        {
            conversationId: 4,
            senderId: 'user_901234',
            content: "Yes! Their next book is even better. I'll lend you my copy next time we meet. Are we still on for lunch next Tuesday?",
            status: 'sent',
            createdAt: new Date('2024-01-18T15:00:00').toISOString(),
        },

        // Additional messages for variety
        // Conversation 1: More exchanges
        {
            conversationId: 1,
            senderId: 'user_123456',
            content: 'Perfect! Saturday at 2 PM works great for me. Looking forward to seeing you!',
            status: 'read',
            createdAt: new Date('2024-01-15T11:00:00').toISOString(),
        },
        {
            conversationId: 1,
            senderId: 'user_234567',
            content: "Great! I'll send you the address. It's the little corner place with the blue awning. Can't wait! ☕",
            status: 'delivered',
            createdAt: new Date('2024-01-15T12:00:00').toISOString(),
        },
        {
            conversationId: 1,
            senderId: 'user_123456',
            content: 'Sounds good! I know exactly where that is. See you there!',
            status: 'sent',
            createdAt: new Date('2024-01-15T13:30:00').toISOString(),
        },
        {
            conversationId: 1,
            senderId: 'user_234567',
            content: "It's going to be lovely catching up! Have a wonderful rest of your day 😊",
            status: 'sent',
            createdAt: new Date('2024-01-15T14:00:00').toISOString(),
        },

        // Additional conversation 3 messages
        {
            conversationId: 3,
            senderId: 'user_678901',
            content: 'Should we make this an overnight trip? There are some great cabins we could rent.',
            status: 'read',
            createdAt: new Date('2024-01-18T08:00:00').toISOString(),
        },
        {
            conversationId: 3,
            senderId: 'user_567890',
            content: "That's a brilliant idea! It would be much more relaxing than trying to do it in one day.",
            status: 'delivered',
            createdAt: new Date('2024-01-18T09:00:00').toISOString(),
        },
        {
            conversationId: 3,
            senderId: 'user_789012',
            content: "I'm in for the overnight option! Let me check the cabin availability right now.",
            status: 'sent',
            createdAt: new Date('2024-01-18T09:30:00').toISOString(),
        },
        {
            conversationId: 3,
            senderId: 'user_678901',
            content: "Perfect! We can make it a mini-vacation. This is exactly what we all needed! 🌲",
            status: 'sent',
            createdAt: new Date('2024-01-18T10:00:00').toISOString(),
        },
    ];

    await db.insert(messages).values(sampleMessages);
    
    console.log('✅ Messages seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});