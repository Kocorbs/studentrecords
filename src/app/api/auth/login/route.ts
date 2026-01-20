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
    try {
        const { username, password } = await request.json();
        const hashedPassword = hashPassword(password);

        const user = await prisma.user.findFirst({
            where: {
                username,
                password: hashedPassword
            }
        });

        if (user) {
            // Update last login
            await prisma.user.update({
                where: { id: user.id },
                data: { last_login: new Date() }
            });

            // Don't send password to frontend
            const { password: _, ...userWithoutPassword } = user;
            return NextResponse.json(userWithoutPassword);
        } else {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}
