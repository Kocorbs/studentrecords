import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export const maxDuration = 60; // Allow more time for initial database seeding

// Helper to hash password
const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// GET or POST /api/seed - Seed admin user
export async function GET() {
    return handleSeed();
}

export async function POST() {
    return handleSeed();
}

async function handleSeed() {
    console.log('🌱 Seed process started...');
    try {
        const adminExists = await prisma.user.findFirst({
            where: { username: 'admin' }
        });

        if (!adminExists) {
            console.log('👤 Admin user not found. Creating...');
            await prisma.user.create({
                data: {
                    username: 'admin',
                    password: hashPassword('Admin@123'),
                    role: 'admin',
                    email: 'admin@system.com',
                    full_name: 'System Administrator',
                    created_at: new Date()
                }
            });
            console.log('✅ Admin user created successfully');
            return NextResponse.json({
                success: true,
                message: 'Admin user created successfully. You can now log in with admin / Admin@123'
            });
        } else {
            console.log('ℹ️ Admin user already exists');
            return NextResponse.json({
                success: true,
                message: 'Admin user already exists'
            });
        }
    } catch (error) {
        console.error('❌ Seed error:', error);

        // Log Prisma error details
        if (error && typeof error === 'object' && 'code' in error) {
            console.error('Prisma Error Code:', (error as any).code);
            console.error('Prisma Error Message:', (error as any).message);
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Seed failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
