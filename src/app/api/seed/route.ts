import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Helper to hash password
const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// POST /api/seed - Seed admin user
export async function POST() {
    try {
        const adminExists = await prisma.user.findFirst({
            where: { username: 'admin' }
        });

        if (!adminExists) {
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
            return NextResponse.json({ message: 'Admin user created' });
        } else {
            return NextResponse.json({ message: 'Admin user already exists' });
        }
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { error: 'Seed failed' },
            { status: 500 }
        );
    }
}
