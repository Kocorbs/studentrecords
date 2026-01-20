import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Route segment config - replaces deprecated `export const config`
export const runtime = 'nodejs'; // Force Node.js runtime for filesystem access
export const maxDuration = 60; // Max function duration in seconds

// NOTE: This implementation uses the filesystem and will NOT work on Vercel's
// serverless environment. For production deployment on Vercel, you should:
// 1. Use Vercel Blob Storage: https://vercel.com/docs/storage/vercel-blob
// 2. Or use AWS S3, Cloudinary, or similar cloud storage
// 3. Or use Edge Functions with a different storage strategy

// POST /api/upload - Handle file uploads
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files uploaded' },
                { status: 400 }
            );
        }

        // Create uploads directory in public folder
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const filePaths: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = uniqueSuffix + '-' + file.name;
            const filepath = path.join(uploadsDir, filename);

            await writeFile(filepath, buffer);
            filePaths.push(`/uploads/${filename}`);
        }

        return NextResponse.json({ files: filePaths });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        );
    }
}


