import { db } from '@/db';
import { messages } from '@/db/schema';

async function main() {
    const sampleMessages = [
        // Photography service inquiry - User 2 to User 5
        {
            senderId: 2,
            receiverId: 5,
            content: "Hi! I saw your photography post and I'm interested in booking a session for my family. What are your rates for a 2-hour outdoor shoot?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        },
        {
            senderId: 5,
            receiverId: 2,
            content: "Hello! Thanks for reaching out. For a 2-hour family session, I charge $250 which includes editing and delivery of 50+ photos. When were you thinking?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-01-15T14:20:00Z').toISOString(),
        },
        {
            senderId: 2,
            receiverId: 5,
            content: "That sounds perfect! How about next Saturday morning around 9 AM at Central Park?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-01-15T16:45:00Z').toISOString(),
        },
        {
            senderId: 5,
            receiverId: 2,
            content: "Saturday at 9 AM works great! I'll bring my full setup. Should we meet at the Bethesda Fountain entrance?",
            messageType: 'text',
            isRead: false,
            createdAt: new Date('2024-01-15T18:10:00Z').toISOString(),
        },

        // Tutoring discussion - User 3 to User 8
        {
            senderId: 3,
            receiverId: 8,
            content: "Hey! My daughter is struggling with calculus and I saw you offer math tutoring. Are you available for weekly sessions?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-01-20T15:30:00Z').toISOString(),
        },
        {
            senderId: 8,
            receiverId: 3,
            content: "Absolutely! I'd love to help. What grade level and which specific topics is she having trouble with?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-01-20T16:15:00Z').toISOString(),
        },
        {
            senderId: 3,
            receiverId: 8,
            content: "She's in 12th grade, mainly struggling with derivatives and integration. We're looking for someone who can meet twice a week.",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-01-20T17:00:00Z').toISOString(),
        },
        {
            senderId: 8,
            receiverId: 3,
            content: "Perfect! I charge $60/hour and I'm available Tuesdays and Thursdays after 4 PM. We can start this week if you'd like!",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-01-20T17:30:00Z').toISOString(),
        },

        // Cleaning service booking - User 1 to User 4
        {
            senderId: 1,
            receiverId: 4,
            content: "Hi there! I need a deep cleaning service for my 3-bedroom apartment. Can you give me a quote?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-01T09:15:00Z').toISOString(),
        },
        {
            senderId: 4,
            receiverId: 1,
            content: "Hi! For a 3-bedroom deep clean, I charge $180 and it typically takes 4-5 hours. This includes bathrooms, kitchen, all surfaces, and floors.",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-01T11:20:00Z').toISOString(),
        },
        {
            senderId: 1,
            receiverId: 4,
            content: "That sounds reasonable. I'm available this Friday morning. Would 8 AM work for you?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-01T12:45:00Z').toISOString(),
        },
        {
            senderId: 4,
            receiverId: 1,
            content: "Friday at 8 AM is perfect! I'll bring all supplies. Just need the address and any specific areas you want me to focus on.",
            messageType: 'text',
            isRead: false,
            createdAt: new Date('2024-02-01T13:30:00Z').toISOString(),
        },

        // Follow-up after service - User 6 to User 7
        {
            senderId: 6,
            receiverId: 7,
            content: "Thank you so much for the guitar lesson yesterday! My son hasn't stopped playing since you left. You're an amazing teacher!",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-10T19:30:00Z').toISOString(),
        },
        {
            senderId: 7,
            receiverId: 6,
            content: "That makes me so happy to hear! He's a natural and has great enthusiasm. Same time next week?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-10T20:15:00Z').toISOString(),
        },
        {
            senderId: 6,
            receiverId: 7,
            content: "Absolutely! He's already asking if he can learn 'Wonderwall' next 😂",
            messageType: 'text',
            isRead: false,
            createdAt: new Date('2024-02-10T20:45:00Z').toISOString(),
        },

        // Price negotiation - User 9 to User 10
        {
            senderId: 9,
            receiverId: 10,
            content: "Hey! I'm interested in your personal training services but $80/session is a bit out of my budget. Would you consider $60 for a package of 8 sessions?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-15T14:00:00Z').toISOString(),
        },
        {
            senderId: 10,
            receiverId: 9,
            content: "I appreciate your interest! I can do $65/session for an 8-session package, so $520 total. That's my best offer for the quality of training I provide.",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-15T15:30:00Z').toISOString(),
        },
        {
            senderId: 9,
            receiverId: 10,
            content: "That works for me! When can we start? I'm hoping to get in shape for my wedding in June.",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-15T16:00:00Z').toISOString(),
        },
        {
            senderId: 10,
            receiverId: 9,
            content: "Congratulations on the upcoming wedding! We can start Monday if you'd like. I'll create a custom plan to get you ready for the big day!",
            messageType: 'text',
            isRead: false,
            createdAt: new Date('2024-02-15T16:45:00Z').toISOString(),
        },

        // Social conversation - User 11 to User 12
        {
            senderId: 11,
            receiverId: 12,
            content: "Hey! How did your cooking class go yesterday? I saw your story and it looked amazing!",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-20T10:30:00Z').toISOString(),
        },
        {
            senderId: 12,
            receiverId: 11,
            content: "It was incredible! We made fresh pasta from scratch and the instructor was so patient. You should definitely book a session!",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-20T11:15:00Z').toISOString(),
        },
        {
            senderId: 11,
            receiverId: 12,
            content: "I'm definitely interested! Can you send me their contact info? I've been wanting to improve my cooking skills.",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-20T11:45:00Z').toISOString(),
        },
        {
            senderId: 12,
            receiverId: 11,
            content: "Of course! It's actually @chefmaria on the platform. She does small group classes and private sessions. Tell her I referred you!",
            messageType: 'text',
            isRead: false,
            createdAt: new Date('2024-02-20T12:30:00Z').toISOString(),
        },

        // Pet sitting inquiry - User 3 to User 6
        {
            senderId: 3,
            receiverId: 6,
            content: "Hi! I saw your pet sitting post. I need someone to watch my golden retriever for a weekend. Are you available March 2-4?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-25T13:20:00Z').toISOString(),
        },
        {
            senderId: 6,
            receiverId: 3,
            content: "Hi! I'd love to help! I charge $50/day and I have a fenced yard perfect for golden retrievers. What's your pup's name and any special requirements?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-02-25T14:45:00Z').toISOString(),
        },
        {
            senderId: 3,
            receiverId: 6,
            content: "His name is Buddy and he's super friendly! He needs to be walked twice a day and gets one cup of food morning and evening. No special needs!",
            messageType: 'text',
            isRead: false,
            createdAt: new Date('2024-02-25T15:30:00Z').toISOString(),
        },

        // Art commission discussion - User 1 to User 11
        {
            senderId: 1,
            receiverId: 11,
            content: "Your digital art is stunning! I'd love to commission a portrait of my family. What are your rates for a family of 4?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-03-01T16:00:00Z').toISOString(),
        },
        {
            senderId: 11,
            receiverId: 1,
            content: "Thank you so much! For a family portrait, I charge $300 for digital delivery and $400 if you want a printed canvas. Turnaround is usually 2-3 weeks.",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-03-01T17:30:00Z').toISOString(),
        },
        {
            senderId: 1,
            receiverId: 11,
            content: "I'd love the canvas option! Can we schedule a time to discuss the style and send you reference photos?",
            messageType: 'text',
            isRead: false,
            createdAt: new Date('2024-03-01T18:15:00Z').toISOString(),
        },

        // Yoga class follow-up - User 7 to User 9
        {
            senderId: 7,
            receiverId: 9,
            content: "Thanks for joining my yoga class today! How did you feel after your first session?",
            messageType: 'text',
            isRead: true,
            createdAt: new Date('2024-03-05T19:45:00Z').toISOString(),
        },
        {
            senderId: 9,
            receiverId: 7,
            content: "I feel amazing! A bit sore but in a good way. Your instruction was perfect for a beginner like me. Same time next week?",
            messageType: 'text',
            isRead: false,
            createdAt: new Date('2024-03-05T20:30:00Z').toISOString(),
        },
    ];

    await db.insert(messages).values(sampleMessages);
    
    console.log('✅ Messages seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});