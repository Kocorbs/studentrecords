'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Basic redirect logic. In a real app, middleware is better for this.
        const user = localStorage.getItem('spc_current_user');
        if (user) {
            router.push('/dashboard');
        } else {
            router.push('/login');
        }
    }, [router]);

    return null; // Or a loading spinner
}
