import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/students/[id] - Update student
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { grades, ...studentData } = await request.json();

        // Prepare update data
        const data: any = {
            ...studentData,
            updated_at: new Date()
        };

        // Handle nested grades update (delete all and re-create)
        if (grades && Array.isArray(grades)) {
            data.grades = {
                deleteMany: {},
                create: grades.map((g: any) => ({
                    subject: g.subject,
                    grade: g.grade
                }))
            };
        }

        const student = await prisma.student.update({
            where: { id: Number(id) },
            data,
            include: { grades: true }
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error('Update student error:', error);
        return NextResponse.json(
            { error: 'Failed to update student' },
            { status: 500 }
        );
    }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.student.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete student error:', error);
        return NextResponse.json(
            { error: 'Failed to delete student' },
            { status: 500 }
        );
    }
}
