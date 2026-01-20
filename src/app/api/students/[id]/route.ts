import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/students/[id] - Update student
export async function PUT(
    request: NextRequest,
    context: any // Use any to support both Next.js 14 and 15 parameter styles
) {
    try {
        const params = await context.params;
        const id = params?.id;

        if (!id) {
            return NextResponse.json({ error: 'Missing student ID' }, { status: 400 });
        }

        const studentData = await request.json();
        console.log(`📝 Updating student ID: ${id}`, studentData);

        // Remove ID from studentData to prevent primary key update issues
        const { id: _, created_at: __, updated_at: ___, ...dataToUpdate } = studentData;

        // Prepare update data
        const data: any = {
            ...dataToUpdate,
            updated_at: new Date()
        };

        const student = await prisma.student.update({
            where: { id: Number(id) },
            data
        });

        console.log('✅ Student updated successfully:', student.id);
        return NextResponse.json(student);
    } catch (error) {
        console.error('❌ Update student error:', error);
        return NextResponse.json(
            {
                error: 'Failed to update student',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
                stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
            },
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
