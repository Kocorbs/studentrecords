'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeSettings from './ThemeSettings';
import database from '../../services/database';
import { User } from '../../types';
import { showSuccess, showError, showDeleteConfirm } from '../../utils/sweetalert';
import '../../styles/App.css';

const Settings: React.FC = () => {
    const [showThemeSettings, setShowThemeSettings] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        email: '',
        full_name: '',
        role: 'user' as 'admin' | 'user'
    });
    const router = useRouter();
    const currentUser = database.getCurrentUser();

    useEffect(() => {
        if (showUserManagement) {
            loadUsers();
        }
    }, [showUserManagement]);

    const loadUsers = async () => {
        const fetchedUsers = await database.getAllUsers();
        setUsers(fetchedUsers);
    };

    const handleUserManagement = () => {
        if (currentUser?.role !== 'admin') {
            showError('Access Denied', 'Only administrators can manage users.');
            return;
        }
        setShowUserManagement(true);
    };

    const handleBackupDatabase = async () => {
        setIsLoading(true);
        try {
            const backup = await database.backupDatabase();
            const blob = new Blob([backup], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spc_backup_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            await showSuccess('Backup Complete', 'Database backup downloaded successfully!');
        } catch (error) {
            showError('Backup Failed', 'Failed to create database backup.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreDatabase = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const backupData = event.target?.result as string;
                    const success = await database.restoreDatabase(backupData);
                    if (success) {
                        await showSuccess('Restore Complete', 'Database restored successfully! Please refresh the page.');
                    } else {
                        showError('Restore Failed', 'Failed to restore database. Invalid backup file.');
                    }
                } catch (error) {
                    showError('Restore Failed', 'Failed to restore database.');
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleChangePassword = async () => {
        if (!currentUser) return;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showError('Validation Error', 'All password fields are required');
            return;
        }
        if (newPassword !== confirmPassword) {
            showError('Validation Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            showError('Validation Error', 'New password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await database.changePassword(currentUser.id, currentPassword, newPassword);
            await showSuccess('Password Updated', 'Your password has been changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showError('Password Change Failed', error.message || 'Current password is incorrect');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUser.username || !newUser.password || !newUser.email || !newUser.full_name) {
            showError('Validation Error', 'All fields are required');
            return;
        }

        setIsLoading(true);
        try {
            await database.createUser(newUser);
            await showSuccess('User Created', 'New user has been created successfully!');
            setNewUser({ username: '', password: '', email: '', full_name: '', role: 'user' });
            setShowAddUser(false);
            loadUsers();
        } catch (error: any) {
            showError('Failed', error.message || 'Failed to create user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        setIsLoading(true);
        try {
            await database.updateUser(editingUser.id, {
                username: editingUser.username,
                email: editingUser.email,
                full_name: editingUser.full_name,
                role: editingUser.role
            });
            await showSuccess('User Updated', 'User has been updated successfully!');
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            showError('Failed', 'Failed to update user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (user: User) => {
        const result = await showDeleteConfirm(`user "${user.username}"`);
        if (result.isConfirmed) {
            setIsLoading(true);
            try {
                await database.deleteUser(user.id);
                await showSuccess('User Deleted', 'User has been deleted successfully!');
                loadUsers();
            } catch (error: any) {
                showError('Failed', error.message || 'Failed to delete user');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>System Settings</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Manage your account preferences and system configuration</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                {/* Account Settings */}
                <div className="card">
                    <div className="card-header">🔐 Account Security</div>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="currentPassword" className="form-label">Current Password</label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="form-control"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">New Password</label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="form-control"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-control"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={handleChangePassword}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Update Security Settings'}
                        </button>
                    </div>
                </div>

                {/* System Actions */}
                <div style={{ display: 'grid', gap: '32px' }}>
                    <div className="card">
                        <div className="card-header">🛠️ Quick Actions</div>
                        <div className="card-body" style={{ display: 'grid', gap: '16px' }}>
                            <button
                                className="btn btn-info"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onClick={handleUserManagement}
                                disabled={isLoading}
                            >
                                <span>👥</span> User Management
                            </button>
                            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start', background: 'var(--bg-content)', color: 'var(--text-main)', border: '1px solid var(--border-medium)' }} onClick={() => setShowThemeSettings(true)}>
                                <span>🎨</span> Theme Customization
                            </button>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">🗄️ Database Operations</div>
                        <div className="card-body" style={{ display: 'grid', gap: '16px' }}>
                            <button
                                className="btn btn-success"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onClick={handleBackupDatabase}
                                disabled={isLoading}
                            >
                                <span>📤</span> {isLoading ? 'Exporting...' : 'Export Full Database Backup'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onClick={handleRestoreDatabase}
                                disabled={isLoading}
                            >
                                <span>📥</span> Restore from Local Backup
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '48px', textAlign: 'center' }}>
                <button className="btn" style={{ background: 'white', color: 'var(--text-main)', border: '1px solid var(--border-medium)', padding: '12px 48px' }} onClick={() => router.push('/dashboard')}>
                    ⬅ Back to Control Center
                </button>
            </div>

            {/* Theme Settings Modal */}
            {showThemeSettings && (
                <div className="modal-overlay" onClick={() => setShowThemeSettings(false)}>
                    <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <ThemeSettings onClose={() => setShowThemeSettings(false)} />
                    </div>
                </div>
            )}

            {/* User Management Modal */}
            {showUserManagement && (
                <div className="modal-overlay" onClick={() => setShowUserManagement(false)}>
                    <div className="modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ margin: 0 }}>👥 User Management</h2>
                            <button
                                onClick={() => setShowUserManagement(false)}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" onClick={() => setShowAddUser(true)}>
                                    ➕ Add New User
                                </button>
                            </div>

                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.full_name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: user.role === 'admin' ? '#fee2e2' : '#e0f2fe',
                                                    color: user.role === 'admin' ? '#dc2626' : '#0284c7'
                                                }}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ padding: '4px 8px' }}
                                                        onClick={() => setEditingUser(user)}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ padding: '4px 8px', color: 'var(--danger)' }}
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={user.id === currentUser?.id}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUser && (
                <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
                    <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ margin: 0 }}>➕ Add New User</h2>
                            <button
                                onClick={() => setShowAddUser(false)}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="add_username" className="form-label">Username *</label>
                                <input
                                    id="add_username"
                                    name="username"
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    className="form-control"
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="add_password" className="form-label">Password *</label>
                                <input
                                    id="add_password"
                                    name="password"
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="form-control"
                                    placeholder="Enter password"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="add_full_name" className="form-label">Full Name *</label>
                                <input
                                    id="add_full_name"
                                    name="full_name"
                                    type="text"
                                    value={newUser.full_name}
                                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                    className="form-control"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="add_email" className="form-label">Email *</label>
                                <input
                                    id="add_email"
                                    name="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="form-control"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="add_role" className="form-label">Role *</label>
                                <select
                                    id="add_role"
                                    name="role"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                                    className="form-control"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" onClick={() => setShowAddUser(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleAddUser} disabled={isLoading}>
                                    {isLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 style={{ margin: 0 }}>✏️ Edit User</h2>
                            <button
                                onClick={() => setEditingUser(null)}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="edit_username" className="form-label">Username</label>
                                <input
                                    id="edit_username"
                                    name="username"
                                    type="text"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit_full_name" className="form-label">Full Name</label>
                                <input
                                    id="edit_full_name"
                                    name="full_name"
                                    type="text"
                                    value={editingUser.full_name}
                                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit_email" className="form-label">Email</label>
                                <input
                                    id="edit_email"
                                    name="email"
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className="form-control"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit_role" className="form-label">Role</label>
                                <select
                                    id="edit_role"
                                    name="role"
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'user' })}
                                    className="form-control"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" onClick={() => setEditingUser(null)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleUpdateUser} disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;