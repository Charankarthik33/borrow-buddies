import { db } from '@/db';
import { user } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            id: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            name: 'John Smith',
            email: 'john.smith@example.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            createdAt: new Date('2024-01-15T09:00:00Z'),
            updatedAt: new Date('2024-01-15T09:00:00Z'),
        },
        {
            id: 'user_02h4kxt2e8z9y3b1n7m6q5w8r5',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            createdAt: new Date('2024-01-16T10:30:00Z'),
            updatedAt: new Date('2024-01-16T10:30:00Z'),
        },
        {
            id: 'user_03h4kxt2e8z9y3b1n7m6q5w8r6',
            name: 'Michael Chen',
            email: 'michael.chen@example.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
            createdAt: new Date('2024-01-17T14:15:00Z'),
            updatedAt: new Date('2024-01-17T14:15:00Z'),
        },
        {
            id: 'user_04h4kxt2e8z9y3b1n7m6q5w8r7',
            name: 'Emma Davis',
            email: 'emma.davis@example.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            createdAt: new Date('2024-01-18T11:45:00Z'),
            updatedAt: new Date('2024-01-18T11:45:00Z'),
        },
        {
            id: 'user_05h4kxt2e8z9y3b1n7m6q5w8r8',
            name: 'Alex Rodriguez',
            email: 'alex.rodriguez@example.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-19T08:20:00Z'),
            updatedAt: new Date('2024-01-19T08:20:00Z'),
        },
        {
            id: 'user_06h4kxt2e8z9y3b1n7m6q5w8r9',
            name: 'Lisa Thompson',
            email: 'lisa.thompson@example.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
            createdAt: new Date('2024-01-20T13:00:00Z'),
            updatedAt: new Date('2024-01-20T13:00:00Z'),
        },
        {
            id: 'user_07h4kxt2e8z9y3b1n7m6q5w8s0',
            name: 'David Kim',
            email: 'david.kim@example.com',
            emailVerified: true,
            image: null,
            createdAt: new Date('2024-01-21T15:30:00Z'),
            updatedAt: new Date('2024-01-21T15:30:00Z'),
        },
        {
            id: 'user_08h4kxt2e8z9y3b1n7m6q5w8s1',
            name: 'Maria Garcia',
            email: 'maria.garcia@example.com',
            emailVerified: true,
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
            createdAt: new Date('2024-01-22T12:10:00Z'),
            updatedAt: new Date('2024-01-22T12:10:00Z'),
        },
    ];

    await db.insert(user).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});