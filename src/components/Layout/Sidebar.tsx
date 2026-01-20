'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { MENU_ITEMS } from '../../utils/constants';
import { showConfirm } from '../../utils/sweetalert';
import spcLogo from '../../assets/spc-logo.png';
import '../../styles/App.css';

interface SidebarProps {
    isVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        const result = await showConfirm('Logout', 'Are you sure you want to logout?', 'Yes, Logout', 'Cancel');
        if (result.isConfirmed) {
            router.push('/logout');
        }
    };

    const handleNavigation = (path: string) => {
        if (path === '/logout') {
            handleLogout();
        } else {
            router.push(path);
        }
    };

    return (
        <div className={`sidebar ${isVisible ? '' : 'sidebar-hidden'}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Image
                        src={spcLogo}
                        alt="SPC Logo"
                        width={90}
                        height={90}
                        style={{
                            objectFit: 'contain',
                            borderRadius: '50%'
                        }}
                        priority
                    />
                </div>
                <div className="sidebar-title">ST. PETER'S COLLEGE</div>
                <div className="sidebar-subtitle">Iligan City</div>
            </div>

            <div className="menu-items">
                {MENU_ITEMS.map((item, index) => (
                    <div
                        key={index}
                        className={`menu-item ${pathname === item.path ? 'active' : ''}`}
                        onClick={() => handleNavigation(item.path)}
                    >
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-text">{item.text}</span>
                    </div>
                ))}
            </div>


        </div>
    );
};

export default Sidebar;