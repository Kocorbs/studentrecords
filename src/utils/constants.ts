import { Colors, MenuItem } from '../types';

export const COLORS: Colors = {
    primary: '#800000',  // Maroon
    secondary: '#D12C26',  // Gold
    accent: '#C41E3A',  // Crimson
    light: '#f8f9fa',
    dark: '#212529',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    background: '#ffffff',
    card_bg: '#f8f9fa',
    text: '#2b2d42',
    transparent: '#ffffff00',
    navbar: '#800000',  // Maroon for navbar
    sidebar: '#5a0019',  // Dark maroon for sidebar
    hover: '#9a031e',  // Sidebar hover
    sidebar_text: '#ffffff',
    active_item: '#9a031e'
};

export const THEMES = {
    default: COLORS,
    darkMode: {
        ...COLORS,
        primary: '#800000',
        sidebar: '#2d0000',
        hover: '#9a031e',
        light: '#1f1f1f',
        background: '#121212',
        dark: '#ffffff'
    },
    blueTheme: {
        ...COLORS,
        primary: '#0d6efd',
        sidebar: '#083b86',
        hover: '#0b5ed7'
    }
};

export const MENU_ITEMS: MenuItem[] = [
    { icon: '🏠', text: 'Dashboard', path: '/dashboard' },
    { icon: '📋', text: 'Student Records', path: '/students' },
    { icon: '📊', text: 'Reports', path: '/reports' },
    { icon: '⚙️', text: 'Settings', path: '/settings' },
    { icon: '🆘', text: 'Help & Support', path: '/help' },
    { icon: '🚪', text: 'Logout', path: '/logout' }
];

export const STUDENT_STATUSES = ['Active', 'Graduate', 'Inactive'] as const;