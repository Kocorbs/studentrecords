import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/users/[id] - Update user
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { username, role, email, full_name } = await request.json();

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: {
                username,
                role,
                email,
                full_name
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Prevent deleting the last admin
        const adminCount = await prisma.user.count({ where: { role: 'admin' } });
        const userToDelete = await prisma.user.findUnique({ where: { id: Number(id) } });

        if (userToDelete?.role === 'admin' && adminCount <= 1) {
            return NextResponse.json(
                { error: 'Cannot delete the last admin user' },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
