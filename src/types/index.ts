export interface User {
    id: number;
    username: string;
    password: string;
    role: 'admin' | 'user';
    email: string;
    full_name: string;
    created_at: string;
    last_login?: string;
}

export interface Student {
    id: number;
    title: string;
    username: string; // ID Number
    password: string; // First Name
    attachments: string[];
    category: 'Active' | 'Graduate' | 'Inactive';
    first_name: string;
    middle_name: string;
    last_name: string;
    owner_id: number;
    created_at: string;
    updated_at: string;
    grade_level?: string | null;
    last_school_year?: string | null;
    contact_number?: string | null;
    so_number?: string | null;
    date_issued?: string | null;
    series_year?: string | null;
    lrn?: string | null; // Learner Reference Number
}


export interface Colors {
    primary: string;
    secondary: string;
    accent: string;
    light: string;
    dark: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    background: string;
    card_bg: string;
    text: string;
    transparent: string;
    navbar: string;
    sidebar: string;
    hover: string;
    sidebar_text: string;
    active_item: string;
}

export interface MenuItem {
    icon: string;
    text: string;
    path: string;
}

export interface StatsData {
    title: string;
    value: string | number;
    color: string;
    icon: string;
}

export interface Attachment {
    name: string;
    path: string;
    size?: number;
    type?: string;
}