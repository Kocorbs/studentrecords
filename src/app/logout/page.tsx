'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import database from '../../services/database';

export default function LogoutPage() {
    const router = useRouter();
    useEffect(() => {
        database.logout();
        router.push('/login');
    }, [router]);
    return null;
}
