import { db } from '@/db';
import { profiles } from '@/db/schema';

async function main() {
    const sampleProfiles = [
        {
            userId: 'Kon01ToXF7bok9phqTiUC',
            location: 'New York, NY',
            bio: 'Experienced software engineer with 8+ years in full-stack development. Specializing in React, Node.js, and cloud architecture. Passionate about building scalable applications and mentoring junior developers.',
            rating: 4.8,
            verified: true,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
            location: 'San Francisco, CA',
            bio: 'UX/UI designer with a background in psychology and human-computer interaction. Creating intuitive digital experiences for startups and enterprise clients. Expert in Figma, Sketch, and user research methodologies.',
            rating: 4.9,
            verified: true,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user_02h4kxt2e8z9y3b1n7m6q5w8r5',
            location: 'Austin, TX',
            bio: 'Digital marketing specialist helping businesses grow their online presence. 5 years experience in SEO, content marketing, and social media strategy. Certified Google Ads and Analytics professional.',
            rating: 4.5,
            verified: true,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user_03h4kxt2e8z9y3b1n7m6q5w8r6',
            location: 'Seattle, WA',
            bio: 'Data scientist with expertise in machine learning and statistical analysis. Former Amazon employee with deep knowledge of recommendation systems and predictive modeling. Python and R enthusiast.',
            rating: 4.7,
            verified: false,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user_04h4kxt2e8z9y3b1n7m6q5w8r7',
            location: 'Boston, MA',
            bio: 'Financial analyst and investment advisor with CFA certification. 10 years experience in portfolio management and risk assessment. Specializing in sustainable investing and ESG strategies.',
            rating: 4.3,
            verified: true,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user_05h4kxt2e8z9y3b1n7m6q5w8r8',
            location: 'Chicago, IL',
            bio: 'Project management professional with PMP certification. Leading cross-functional teams in agile environments. Experienced in SaaS implementations and digital transformation initiatives for Fortune 500 companies.',
            rating: 3.8,
            verified: true,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user_06h4kxt2e8z9y3b1n7m6q5w8r9',
            location: 'Miami, FL',
            bio: 'Creative content writer and copywriter with background in journalism. Helping brands tell compelling stories across digital platforms. Multilingual content creator with Spanish and Portuguese fluency.',
            rating: 4.6,
            verified: false,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user_07h4kxt2e8z9y3b1n7m6q5w8s0',
            location: 'Denver, CO',
            bio: 'Civil engineer specializing in sustainable infrastructure and green building design. LEED certified professional with experience in residential and commercial projects across the Mountain West region.',
            rating: 3.5,
            verified: false,
            createdAt: new Date().toISOString(),
        },
        {
            userId: 'user_08h4kxt2e8z9y3b1n7m6q5w8s1',
            location: 'Portland, OR',
            bio: 'Professional photographer and videographer. 6 years capturing weddings, corporate events, and product campaigns. Expertise in drone photography and cinematic storytelling for brand marketing materials.',
            rating: 5.0,
            verified: true,
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(profiles).values(sampleProfiles);
    
    console.log('✅ Profiles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});