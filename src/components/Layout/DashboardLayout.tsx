'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Image from 'next/image';
import spcLogo from '../../assets/spc-logo.png';
import database from '../../services/database';
import '../../styles/App.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [pageTitle, setPageTitle] = useState('');
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if user is logged in
        const currentUser = database.getCurrentUser();
        if (!currentUser) {
            router.push('/login');
            return;
        }



        // Set page title based on current route
        const path = pathname;
        const titles: Record<string, string> = {
            '/dashboard': 'Dashboard',
            '/students': '',
            '/reports': 'Reports',
            '/settings': 'Settings',
            '/help': 'Help & Support'
        };

        if (titles[path]) {
            setPageTitle(titles[path]);
        }
    }, [pathname, router]);

    const handleToggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    /* No loading state needed for userName anymore */

    return (
        <div className="app-container">
            <Navbar
                title={pageTitle}
                onToggleSidebar={handleToggleSidebar}
                isSidebarVisible={sidebarVisible}
            />

            <div className="main-content">
                <Sidebar
                    isVisible={sidebarVisible}
                />

                <div className={`content-area ${sidebarVisible ? '' : 'content-area-full'}`} style={{ position: 'relative' }}>
                    <div style={{
                        position: 'fixed',
                        bottom: '-10%',
                        right: '-5%',
                        width: '600px',
                        height: '600px',
                        opacity: '0.05',
                        pointerEvents: 'none',
                        zIndex: 0,
                        transform: 'rotate(-15deg)'
                    }}>
                        <Image
                            src={spcLogo}
                            alt="Watermark"
                            fill
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;