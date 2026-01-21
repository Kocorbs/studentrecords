import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper to hash password
const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

// Helper to verify password
const verifyPassword = async (password: string, hashed: string) => {
    return await bcrypt.compare(password, hashed);
};

// PUT /api/users/[id]/password - Change user password
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { currentPassword, newPassword } = await request.json();

        // Verify current password
        const user = await prisma.user.findUnique({ where: { id: Number(id) } });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const isPasswordValid = await verifyPassword(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        // Update password
        await prisma.user.update({
            where: { id: Number(id) },
            data: { password: await hashPassword(newPassword) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
