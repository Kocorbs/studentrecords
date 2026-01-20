import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/backup - Create database backup
export async function GET() {
    try {
        const users = await prisma.user.findMany();
        const students = await prisma.student.findMany({
            include: { grades: true }
        });

        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            data: {
                users,
                students
            }
        };

        return NextResponse.json(backup);
    } catch (error) {
        console.error('Backup error:', error);
        return NextResponse.json(
            { error: 'Failed to create backup' },
            { status: 500 }
        );
    }
}
