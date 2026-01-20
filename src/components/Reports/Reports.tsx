'use client';
import React from 'react';
import pdfExport from '../../services/pdfExport';
import database from '../../services/database';
import '../../styles/App.css';

const Reports: React.FC = () => {
    const handleExportAll = async () => {
        const currentUser = database.getCurrentUser();
        if (!currentUser) return;
        const students = await database.getStudents(currentUser.id);
        await pdfExport.exportAllStudents(students, 'Student Records Report');
    };

    const handleExportStatistics = async () => {
        const currentUser = database.getCurrentUser();
        if (!currentUser) return;
        const stats = await database.getStudentStats(currentUser.id);
        const allStudents = await database.getStudents(currentUser.id);
        const recentStudents = allStudents.slice(0, 5);
        await pdfExport.exportStatistics({
            total: stats.total,
            categoryStats: {
                Active: stats.Active || 0,
                Graduate: stats.Graduate || 0,
                Inactive: stats.Inactive || 0
            },
            recentStudents
        }, 'System Statistics Report');
    };

    const handleExportGraduates = async () => {
        const currentUser = database.getCurrentUser();
        if (!currentUser) return;
        const allStudents = await database.getStudents(currentUser.id);
        const graduates = allStudents.filter((s: { category: string }) => s.category === 'Graduate');
        if (graduates.length === 0) {
            alert('No graduate records found.');
            return;
        }
        await pdfExport.exportAllStudents(graduates, 'Graduate Student Records');
    };

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>Reports & Analytics</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Generate and download comprehensive student data reports</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                {/* All Records Report */}
                <div className="card" style={{ transition: 'var(--transition)' }}>
                    <div className="card-body" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '24px' }}>📋</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>Full Student Directory</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px', lineHeight: '1.6' }}>
                            A comprehensive list of every student record currently in the system, including all basic details and tags.
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleExportAll}>
                            Export Detailed PDF
                        </button>
                    </div>
                </div>

                {/* Statistics Report */}
                <div className="card" style={{ transition: 'var(--transition)' }}>
                    <div className="card-body" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '24px' }}>📊</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>System Overview & Stats</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px', lineHeight: '1.6' }}>
                            Visual and numerical summary of student demographics, enrollment statuses, and recent system activities.
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleExportStatistics}>
                            Generate Analytics PDF
                        </button>
                    </div>
                </div>

                {/* Graduate Report */}
                <div className="card" style={{ transition: 'var(--transition)' }}>
                    <div className="card-body" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎓</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>Graduate Registry</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px', lineHeight: '1.6' }}>
                            Focused report containing only alumni and graduate student records with their corresponding graduation data.
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleExportGraduates}>
                            Export Graduate Registry
                        </button>
                    </div>
                </div>
            </div>

            {/* Hint Box */}
            <div className="card" style={{ marginTop: '48px', background: 'var(--bg-content)', border: '1px dashed var(--border-medium)' }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
                    <span style={{ fontSize: '24px' }}>💡</span>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                        <strong>Tip:</strong> All reports are generated in PDF format and include the official St. Peter's College header.
                        For individual student records, use the "Export PDF" button in the Student Record Detail view.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;