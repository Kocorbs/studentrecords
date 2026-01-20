'use client';

import DashboardLayout from '../../components/Layout/DashboardLayout';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
