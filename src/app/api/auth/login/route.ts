import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Helper to hash password (SHA256 to match frontend) - Using Web Crypto API
const hashPassword = (password: string) => {
    // Note: We can't easily use async web crypto in synchronous flow without refactoring
    // For Node.js runtime (which Vercel Serverless Functions use), 'crypto' module IS available.
    // However, let's make sure we're importing it correctly or check if there's another issue.
    // Keeping 'crypto' for now but adding error handling.
    try {
        return crypto.createHash('sha256').update(password).digest('hex');
    } catch (e) {
        console.error("Crypto error:", e);
        return "";
    }
};

export async function POST(request: NextRequest) {
    console.log('🔐 Login attempt started at:', new Date().toISOString());

    try {
        // Parse request body
        let body;
        try {
            body = await request.json();
            console.log('📥 Request received for username:', body?.username || 'undefined');
        } catch (parseError) {
            console.error('❌ Failed to parse request body:', parseError);
            return NextResponse.json(
                { error: 'Invalid request format' },
                { status: 400 }
            );
        }

        const { username, password } = body;

        // Validate input
        if (!username || !password) {
            console.warn('⚠️ Missing credentials - username:', !!username, 'password:', !!password);
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        if (!hashedPassword) {
            console.error('❌ Password hashing failed');
            return NextResponse.json(
                { error: 'Authentication system error' },
                { status: 500 }
            );
        }

        console.log('🔍 Querying database for user:', username);

        // Query database
        let user;
        try {
            user = await prisma.user.findFirst({
                where: {
                    username,
                    password: hashedPassword
                }
            });
            console.log('✓ Database query completed. User found:', !!user);
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            return NextResponse.json(
                { error: 'Database connection failed. Please check your DATABASE_URL environment variable.' },
                { status: 500 }
            );
        }

        if (user) {
            console.log('✅ Authentication successful for user ID:', user.id);

            // Update last login
            try {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { last_login: new Date() }
                });
                console.log('✓ Updated last_login timestamp');
            } catch (updateError) {
                console.warn('⚠️ Failed to update last_login (non-critical):', updateError);
                // Continue anyway - this is non-critical
            }

            // Don't send password to frontend
            const { password: _, ...userWithoutPassword } = user;
            return NextResponse.json(userWithoutPassword);
        } else {
            console.warn('⚠️ Authentication failed - invalid credentials for:', username);
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('❌ Unexpected login error:', error);

        // Log more details if it's a Prisma error
        if (error && typeof error === 'object' && 'code' in error) {
            console.error('Prisma Error Code:', (error as any).code);
            console.error('Prisma Error Message:', (error as any).message);
        }

        return NextResponse.json(
            {
                error: 'Login failed',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            },
            { status: 500 }
        );
    }
}
