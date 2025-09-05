import { db } from '@/db';
import { comments } from '@/db/schema';

async function main() {
    const sampleComments = [
        {
            userId: 3,
            postId: 1,
            content: "This looks amazing! What's your hourly rate for portrait sessions? 📸",
            createdAt: new Date('2024-01-15T14:30:00Z').toISOString(),
        },
        {
            userId: 7,
            postId: 1,
            content: "Your portfolio is stunning! Do you travel to Brooklyn for shoots?",
            createdAt: new Date('2024-01-15T15:45:00Z').toISOString(),
        },
        {
            userId: 12,
            postId: 2,
            content: "I really need help with calculus! Are you available weekends? 📚",
            createdAt: new Date('2024-01-16T10:20:00Z').toISOString(),
        },
        {
            userId: 5,
            postId: 2,
            content: "My daughter struggled with math but your approach sounds perfect. What ages do you work with?",
            createdAt: new Date('2024-01-16T11:15:00Z').toISOString(),
        },
        {
            userId: 9,
            postId: 2,
            content: "Can you help with SAT math prep too? Looking for someone in the Manhattan area.",
            createdAt: new Date('2024-01-16T16:30:00Z').toISOString(),
        },
        {
            userId: 15,
            postId: 3,
            content: "Finally someone who gets it right! 🧽 How much for a deep clean of a 2BR apartment?",
            createdAt: new Date('2024-01-17T09:00:00Z').toISOString(),
        },
        {
            userId: 2,
            postId: 3,
            content: "Do you bring your own supplies? Moving out next month and need this service badly!",
            createdAt: new Date('2024-01-17T13:25:00Z').toISOString(),
        },
        {
            userId: 18,
            postId: 4,
            content: "Love this energy! 💪 Do you offer outdoor bootcamp sessions in Central Park?",
            createdAt: new Date('2024-01-18T07:45:00Z').toISOString(),
        },
        {
            userId: 6,
            postId: 4,
            content: "What's included in your fitness packages? Looking to get back in shape after winter 😅",
            createdAt: new Date('2024-01-18T12:10:00Z').toISOString(),
        },
        {
            userId: 11,
            postId: 5,
            content: "This pasta looks incredible! Can we book you for a dinner party of 8 people?",
            createdAt: new Date('2024-01-19T19:30:00Z').toISOString(),
        },
        {
            userId: 14,
            postId: 5,
            content: "Do you cater to dietary restrictions? Asking for a friend with gluten sensitivity 🍝",
            createdAt: new Date('2024-01-19T20:15:00Z').toISOString(),
        },
        {
            userId: 4,
            postId: 6,
            content: "Your designs are so fresh! What's your rate for logo design and branding?",
            createdAt: new Date('2024-01-20T11:00:00Z').toISOString(),
        },
        {
            userId: 13,
            postId: 7,
            content: "I need someone exactly like you! How long does a typical room makeover take? ✨",
            createdAt: new Date('2024-01-21T14:20:00Z').toISOString(),
        },
        {
            userId: 8,
            postId: 7,
            content: "Do you work with small budgets? My studio apartment needs some magic but I'm a student 💸",
            createdAt: new Date('2024-01-21T16:45:00Z').toISOString(),
        },
        {
            userId: 19,
            postId: 8,
            content: "Absolutely love your style! Available for family portraits in Queens this weekend?",
            createdAt: new Date('2024-01-22T10:30:00Z').toISOString(),
        },
        {
            userId: 1,
            postId: 9,
            content: "This is exactly what I need for my startup! What's your process for business consulting? 💼",
            createdAt: new Date('2024-01-23T09:15:00Z').toISOString(),
        },
        {
            userId: 16,
            postId: 9,
            content: "Can you help with marketing strategy too? Your background looks perfect for what we need.",
            createdAt: new Date('2024-01-23T11:30:00Z').toISOString(),
        },
        {
            userId: 10,
            postId: 10,
            content: "Perfect timing! 🐕 Do you offer weekend dog walking in the Financial District?",
            createdAt: new Date('2024-01-24T08:00:00Z').toISOString(),
        },
        {
            userId: 17,
            postId: 10,
            content: "My golden retriever needs exercise while I'm at work. What are your daily rates?",
            createdAt: new Date('2024-01-24T12:45:00Z').toISOString(),
        },
        {
            userId: 20,
            postId: 11,
            content: "You're so talented! 🎵 Do you teach beginners? I've always wanted to learn guitar.",
            createdAt: new Date('2024-01-25T15:20:00Z').toISOString(),
        },
        {
            userId: 3,
            postId: 12,
            content: "This looks therapeutic! How much for a couples massage session? 💆‍♀️",
            createdAt: new Date('2024-01-26T18:00:00Z').toISOString(),
        },
        {
            userId: 7,
            postId: 13,
            content: "Finally found you! Are you available for corporate events? We need catering for 50 people.",
            createdAt: new Date('2024-01-27T13:10:00Z').toISOString(),
        },
        {
            userId: 12,
            postId: 14,
            content: "Your garden transformation is amazing! 🌱 Do you consult on balcony gardens too?",
            createdAt: new Date('2024-01-28T10:45:00Z').toISOString(),
        },
        {
            userId: 5,
            postId: 15,
            content: "This is so helpful! Can you teach virtual classes? I'm not in NYC but would love to learn.",
            createdAt: new Date('2024-01-29T16:30:00Z').toISOString(),
        },
        {
            userId: 9,
            postId: 1,
            content: "Booked! Can't wait for our session next week 📅",
            createdAt: new Date('2024-01-30T11:00:00Z').toISOString(),
        }
    ];

    await db.insert(comments).values(sampleComments);
    
    console.log('✅ Comments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});