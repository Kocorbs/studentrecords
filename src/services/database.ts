import { User, Student } from '../types';

// API Base URL - Use relative path for Next.js API routes
const API_URL = '/api';

class DatabaseService {
    private static instance: DatabaseService;
    private currentUser: User | null = null;

    private constructor() {
        this.initialize();
    }

    static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    private initialize(): void {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('spc_current_user');
            if (storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                } catch (error) {
                    console.error('Failed to restore session:', error);
                    localStorage.removeItem('spc_current_user');
                }
            }
        }
    }

    // ==================== USER METHODS ====================

    async login(username: string, password: string): Promise<User | null> {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                return null;
            }

            const user = await response.json();
            this.currentUser = user;
            localStorage.setItem('spc_current_user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout(): void {
        this.currentUser = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('spc_current_user');
        }
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to change password');
            }

            return true;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const response = await fetch(`${API_URL}/users`);
            if (!response.ok) throw new Error('Failed to fetch users');
            return await response.json();
        } catch (error) {
            console.error('Get users error:', error);
            return [];
        }
    }

    async createUser(userData: Omit<User, 'id' | 'created_at' | 'last_login'>): Promise<User | null> {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create user');
            }

            return await response.json();
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Failed to update user');
            return await response.json();
        } catch (error) {
            console.error('Update user error:', error);
            return null;
        }
    }

    async deleteUser(id: number): Promise<boolean> {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete user');
            }

            return true;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }

    // ==================== STUDENT METHODS ====================

    async getStudents(ownerId: number, search?: string, status?: string): Promise<Student[]> {
        try {
            const params = new URLSearchParams({ ownerId: String(ownerId) });
            if (search) params.append('search', search);
            if (status) params.append('status', status);

            const response = await fetch(`${API_URL}/students?${params}`);
            if (!response.ok) throw new Error('Failed to fetch students');

            return await response.json();
        } catch (error) {
            console.error('Get students error:', error);
            return [];
        }
    }

    async getStudentById(id: number, ownerId: number): Promise<Student | undefined> {
        const students = await this.getStudents(ownerId);
        return students.find(s => s.id === id);
    }

    async createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });

        if (!response.ok) throw new Error('Failed to create student');
        return await response.json();
    }

    async updateStudent(id: number, _ownerId: number, updates: Partial<Student>): Promise<Student | null> {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!response.ok) return null;
        return await response.json();
    }

    async deleteStudent(id: number, _ownerId: number): Promise<boolean> {
        const response = await fetch(`${API_URL}/students/${id}`, {
            method: 'DELETE'
        });

        return response.ok;
    }

    async getStudentStats(ownerId: number): Promise<Record<string, number>> {
        const students = await this.getStudents(ownerId);
        const stats: Record<string, number> = {
            total: students.length
        };

        students.forEach(student => {
            stats[student.category] = (stats[student.category] || 0) + 1;
        });

        return stats;
    }

    // ==================== FILE UPLOAD METHODS ====================

    async uploadFiles(files: File[]): Promise<string[]> {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload files');

            const result = await response.json();
            return result.files;
        } catch (error) {
            console.error('Upload files error:', error);
            throw error;
        }
    }

    // ==================== BACKUP/RESTORE METHODS ====================

    async backupDatabase(): Promise<string> {
        try {
            const response = await fetch(`${API_URL}/backup`);
            if (!response.ok) throw new Error('Failed to create backup');

            const backup = await response.json();
            return JSON.stringify(backup, null, 2);
        } catch (error) {
            console.error('Backup error:', error);
            throw error;
        }
    }

    async restoreDatabase(data: string): Promise<boolean> {
        try {
            const backup = JSON.parse(data);

            const response = await fetch(`${API_URL}/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backup)
            });

            if (!response.ok) throw new Error('Failed to restore database');
            return true;
        } catch (error) {
            console.error('Restore error:', error);
            throw error;
        }
    }
}

export default DatabaseService.getInstance();