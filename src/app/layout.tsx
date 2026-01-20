import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/App.css'; // Assuming this exists, otherwise I'll need to create or verify path

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Student Records System',
    description: 'Manage student records efficiently',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
