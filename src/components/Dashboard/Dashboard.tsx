'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import StatsCard from './StatCard';
import database from '../../services/database';
import socketService from '../../services/socket';
import { Student } from '../../types';
import { formatDate } from '../../utils/helpers';
import { COLORS } from '../../utils/constants';
import spcLogo from '../../assets/spc-logo.png';
import '../../styles/App.css';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        graduate: 0,
        inactive: 0
    });
    const [recentStudents, setRecentStudents] = useState<Student[]>([]);

    const loadDashboardData = useCallback(async () => {
        const currentUser = database.getCurrentUser();
        if (!currentUser) return;

        // Get student statistics
        const studentStats = await database.getStudentStats(currentUser.id);
        setStats({
            total: studentStats.total || 0,
            active: studentStats.Active || 0,
            graduate: studentStats.Graduate || 0,
            inactive: studentStats.Inactive || 0
        });

        // Get recent students
        const students = await database.getStudents(currentUser.id);
        const recent = students
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5);
        setRecentStudents(recent);
    }, []);

    useEffect(() => {
        loadDashboardData();

        // Connect to real-time updates
        socketService.connect();

        // Subscribe to student changes
        const unsubscribe = socketService.onStudentChange(() => {
            // Refresh dashboard data when any student changes
            loadDashboardData();
        });

        return () => {
            unsubscribe();
        };
    }, [loadDashboardData]);

    const statsData = [
        { title: 'Total Students', value: stats.total, color: COLORS.primary, icon: '👨‍🎓' },
        { title: 'Active Students', value: stats.active, color: COLORS.success, icon: '✅' },
        { title: 'Graduates', value: stats.graduate, color: COLORS.info, icon: '🎓' },
        { title: 'Inactive', value: stats.inactive, color: COLORS.warning, icon: '⏸️' }
    ];

    return (
        <div style={{ padding: '24px' }}>
            {/* Welcome Area */}
            <div className="card" style={{
                marginBottom: '32px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white',
                border: 'none',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-15%',
                    right: '-8%',
                    width: '400px',
                    height: '400px',
                    opacity: '0.1',
                    transform: 'rotate(15deg)',
                    pointerEvents: 'none',
                    borderRadius: '50%',
                    overflow: 'hidden'
                }}>
                    <Image
                        src={spcLogo}
                        alt=""
                        width={400}
                        height={400}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                    />
                </div>

                <div className="card-body" style={{ position: 'relative', zIndex: 1, padding: '48px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                        Welcome back, Admin! 👋
                    </h1>
                    <p style={{ opacity: 0.9, fontSize: '16px', maxWidth: '600px', lineHeight: '1.6' }}>
                        This is your control center for St. Peter&apos;s College Student Records.
                        Manage students, generate reports, and monitor system activities with ease.
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-container">
                {statsData.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ marginTop: '30px' }}>
                <div className="card-header">
                    <span>📈 Recent Activity</span>
                </div>
                <div className="card-body">
                    {recentStudents.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Status</th>
                                        <th>Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td style={{ fontWeight: '600' }}>
                                                👤 {student.first_name} {student.last_name}
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    backgroundColor:
                                                        student.category === 'Active' ? '#ecfdf5' :
                                                            student.category === 'Graduate' ? '#eff6ff' : '#fffbeb',
                                                    color:
                                                        student.category === 'Active' ? '#059669' :
                                                            student.category === 'Graduate' ? '#2563eb' : '#d97706',
                                                    border: `1px solid ${student.category === 'Active' ? '#10b98120' :
                                                        student.category === 'Graduate' ? '#3b82f620' : '#f59e0b20'
                                                        }`
                                                }}>
                                                    {student.category}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)' }}>{formatDate(student.updated_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                            No recent activity found at the moment.
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '40px',
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px',
                borderTop: '1px solid var(--border-light)'
            }}>
                © 2026 St. Peter&apos;s College - Student Records Management System
            </div>
        </div>
    );
};

export default Dashboard;