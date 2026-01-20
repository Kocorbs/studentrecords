import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper to hash password
const hashPassword = (password: string) => {
    return bcrypt.hashSync(password, 10);
};

// GET /api/users - Get all users
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                email: true,
                full_name: true,
                created_at: true,
                last_login: true
            },
            orderBy: { id: 'asc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
    try {
        const { username, password, role, email, full_name } = await request.json();

        // Check if username already exists
        const existingUser = await prisma.user.findFirst({ where: { username } });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        const user = await prisma.user.create({
            data: {
                username,
                password: hashPassword(password),
                role: role || 'user',
                email,
                full_name,
                created_at: new Date()
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
