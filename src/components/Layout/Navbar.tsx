import React from 'react';
import Image from 'next/image';
import spcLogo from '../../assets/spc-logo.png';
import '../../styles/App.css';

interface NavbarProps {
    title: string;
    onToggleSidebar: () => void;
    isSidebarVisible: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
    title,
    onToggleSidebar,
    isSidebarVisible
}) => {
    return (
        <header className="navbar">
            <button
                className="hamburger-btn"
                onClick={onToggleSidebar}
                aria-label={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
                {isSidebarVisible ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                )}
            </button>

            <div className="navbar-title">
                {title}
            </div>

            <div className="navbar-actions">
                <div className="user-info">
                    <div className="user-avatar-container">
                        <Image
                            src={spcLogo}
                            alt="Admin"
                            className="nav-user-logo"
                            width={24}
                            height={24}
                            style={{ borderRadius: '50%', objectFit: 'contain' }}
                        />
                    </div>
                    <span className="user-name">Admin</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Navbar;