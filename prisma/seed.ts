import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = (password: string) => {
    return bcrypt.hashSync(password, 10);
};

async function main() {
    // Upsert admin user to ensure password is correct (and hashed) even if user already exists
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashPassword('Admin@123'),
        },
        create: {
            username: 'admin',
            password: hashPassword('Admin@123'),
            role: 'admin',
            email: 'admin@system.com',
            full_name: 'System Administrator',
            created_at: new Date()
        }
    });
    console.log('Admin user seeded/updated with correct credentials.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
