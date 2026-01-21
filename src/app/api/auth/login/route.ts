import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper to verify password
const verifyPassword = async (password: string, hashed: string) => {
    try {
        return await bcrypt.compare(password, hashed);
    } catch (e) {
        console.error("Bcrypt error:", e);
        return false;
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

        console.log('🔍 Querying database for user:', username);

        // Query database
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { username }
            });
            console.log('✓ Database query completed. User found:', !!user);
        } catch (dbError) {
            console.error('❌ Database error:', dbError);
            return NextResponse.json(
                { error: 'Database connection failed. Please check your DATABASE_URL environment variable.' },
                { status: 500 }
            );
        }

        const isPasswordValid = await verifyPassword(password, user.password);
        console.log('🔐 Password verification result:', isPasswordValid);

        if (user && isPasswordValid) {
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
