import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/restore - Restore database from backup
export async function POST(request: NextRequest) {
    try {
        const { data } = await request.json();

        if (!data || !data.users || !data.students) {
            return NextResponse.json(
                { error: 'Invalid backup data' },
                { status: 400 }
            );
        }

        // Clear existing students (keep users to prevent lockout)
        await prisma.student.deleteMany();

        // Restore students
        for (const student of data.students) {
            await prisma.student.create({
                data: {
                    title: student.title,
                    username: student.username,
                    password: student.password,
                    attachments: student.attachments || [],
                    category: student.category,
                    first_name: student.first_name,
                    middle_name: student.middle_name,
                    last_name: student.last_name,
                    owner_id: student.owner_id,
                    created_at: new Date(student.created_at),
                    updated_at: new Date(student.updated_at),
                    last_school_year: student.last_school_year,
                    contact_number: student.contact_number,
                    so_number: student.so_number,
                    date_issued: student.date_issued,
                    series_year: student.series_year,
                    lrn: student.lrn,
                    grade_level: student.grade_level
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Database restored successfully'
        });
    } catch (error) {
        console.error('Restore error:', error);
        return NextResponse.json(
            { error: 'Failed to restore database' },
            { status: 500 }
        );
    }
}
