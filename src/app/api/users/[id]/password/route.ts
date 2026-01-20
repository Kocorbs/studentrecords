import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Helper to hash password
const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex');
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

        if (user.password !== hashPassword(currentPassword)) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        // Update password
        await prisma.user.update({
            where: { id: Number(id) },
            data: { password: hashPassword(newPassword) }
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
