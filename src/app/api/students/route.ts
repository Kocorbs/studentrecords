import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/students - Get all students for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ownerId = searchParams.get('ownerId');
        const search = searchParams.get('search');
        const status = searchParams.get('status');

        const where: any = {
            owner_id: Number(ownerId)
        };

        if (status && status !== 'All') {
            where.category = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } }
            ];
        }

        const students = await prisma.student.findMany({
            where,
            include: { grades: true },
            orderBy: { id: 'desc' }
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}

// POST /api/students - Create new student
export async function POST(request: NextRequest) {
    try {
        const { grades, ...studentData } = await request.json();

        const data: any = {
            ...studentData,
            created_at: new Date(),
            updated_at: new Date()
        };

        if (grades && Array.isArray(grades)) {
            data.grades = {
                create: grades.map((g: any) => ({
                    subject: g.subject,
                    grade: g.grade
                }))
            };
        }

        const student = await prisma.student.create({
            data,
            include: { grades: true }
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error('Create student error:', error);
        return NextResponse.json(
            { error: 'Failed to create student' },
            { status: 500 }
        );
    }
}
