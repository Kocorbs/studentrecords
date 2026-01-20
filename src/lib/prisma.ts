import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

declare global {
    // eslint-disable-next-line no-var
    var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

const createPrismaClient = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    }).$extends(withAccelerate());
};

// Singleton pattern to prevent multiple Prisma Client instances in development
// In production, a new instance is created; in development, it's reused across hot reloads
const prisma = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

// Test connection on initialization - Note: $connect is handled by the base client
if (typeof window === 'undefined') {
    // We don't explicitly call $connect() with Accelerate as it's connectionless
    console.log('✅ Prisma Client initialized with Accelerate');
}

export default prisma;
