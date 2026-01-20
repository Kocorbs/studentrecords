import React, { useState } from 'react';
import Image from 'next/image';
import { Student } from '../../types';
import pdfExport from '../../services/pdfExport';
import { formatDate, copyToClipboard } from '../../utils/helpers';
import spcLogo from '../../assets/spc-logo.png';
import '../../styles/App.css';

interface StudentViewProps {
    student: Student;
    onClose: () => void;
    onEdit: (student: Student) => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, onClose, onEdit }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'attachments'>('info');

    const handlePrint = () => {
        pdfExport.exportStudentDetails(student);
    };

    const handleCopyID = async () => {
        const success = await copyToClipboard(student.username);
        if (success) {
            alert('ID Number copied to clipboard!');
        }
    };

    const openFile = (fileName: string) => {
        // Build the full path for the attachment
        const filePath = fileName.startsWith('/') ? fileName : `/uploads/${fileName}`;
        window.open(filePath, '_blank');
    };

    const printFile = (fileName: string) => {
        // Build the full path for the attachment
        const filePath = fileName.startsWith('/') ? fileName : `/uploads/${fileName}`;
        const printWindow = window.open(filePath, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100%' }}>
            <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>👨‍🎓</span>
                    <span>Student Record Detail</span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'var(--transition)'
                    }}
                >
                    ✕
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                backgroundColor: 'white',
                padding: '0 24px',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <button
                    onClick={() => setActiveTab('info')}
                    style={{
                        padding: '20px 24px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        borderBottom: activeTab === 'info' ? '3px solid var(--primary)' : '3px solid transparent',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '14px',
                        color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-muted)',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span>👤</span> Information
                </button>

                {student.attachments && student.attachments.length > 0 && (
                    <button
                        onClick={() => setActiveTab('attachments')}
                        style={{
                            padding: '20px 24px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            borderBottom: activeTab === 'attachments' ? '3px solid var(--primary)' : '3px solid transparent',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '14px',
                            color: activeTab === 'attachments' ? 'var(--primary)' : 'var(--text-muted)',
                            transition: 'var(--transition)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>📁</span> Attachments Gallery ({student.attachments.length})
                    </button>
                )}
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', padding: '32px' }}>
                {activeTab === 'info' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        {/* School Header Card */}
                        <div className="card" style={{ gridColumn: '1 / -1', background: 'var(--bg-content)', border: '1px solid var(--border-light)' }}>
                            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                                    <Image
                                        src={spcLogo}
                                        alt="SPC Logo"
                                        fill
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                <div>
                                    <h1 style={{ color: 'var(--primary)', fontSize: '28px', fontWeight: '900', marginBottom: '4px', letterSpacing: '-0.02em' }}>ST. PETER'S COLLEGE</h1>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '12px' }}>Student Academic Record</p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="card">
                            <div className="card-header" style={{ padding: '16px 24px', fontSize: '14px' }}>👤 Basic Information</div>
                            <div className="card-body" style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <DetailItem label="Full Name" value={`${student.first_name} ${student.middle_name || ''} ${student.last_name}`} bold />
                                    <DetailItem label="ID Number" value={student.username} color="var(--primary)" bold />
                                    <DetailItem label="Grade Level" value={student.grade_level || 'N/A'} color="var(--primary)" bold />
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                                        <span style={{
                                            padding: '6px 16px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            backgroundColor: student.category === 'Active' ? '#ecfdf5' :
                                                student.category === 'Graduate' ? '#eff6ff' : '#fffbeb',
                                            color: student.category === 'Active' ? '#059669' :
                                                student.category === 'Graduate' ? '#2563eb' : '#d97706',
                                            display: 'inline-block'
                                        }}>{student.category}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Graduation Details */}
                        {student.category === 'Graduate' && (
                            <div className="card">
                                <div className="card-header" style={{ padding: '16px 24px', fontSize: '14px' }}>🎓 Graduation Details</div>
                                <div className="card-body" style={{ padding: '24px' }}>
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <DetailItem label="Last School Year" value={student.last_school_year || 'N/A'} />
                                        <DetailItem label="SO Number" value={student.so_number || 'N/A'} />
                                        <DetailItem label="Date Issued" value={student.date_issued || 'N/A'} />
                                        <DetailItem label="LRN" value={student.lrn || 'N/A'} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="card">
                            <div className="card-header" style={{ padding: '16px 24px', fontSize: '14px' }}>⚙️ System Information</div>
                            <div className="card-body" style={{ padding: '24px', display: 'grid', gap: '20px' }}>
                                {student.contact_number && <DetailItem label="Contact Number" value={student.contact_number} />}
                                <DetailItem label="Created On" value={formatDate(student.created_at)} />
                                <DetailItem label="Last Updated" value={formatDate(student.updated_at)} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                        {student.attachments?.map((attachment, idx) => (
                            <div key={idx} className="card" style={{ background: 'white' }}>
                                <div style={{ height: '160px', background: 'var(--bg-content)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                                    {attachment.toLowerCase().match(/\.(png|jpg|jpeg|gif|bmp)$/) ? '🖼️' : '📄'}
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attachment}</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-sm" onClick={() => openFile(attachment)} style={{ flex: 1, padding: '8px', fontSize: '12px', backgroundColor: 'var(--info)', color: 'white' }}>Open</button>
                                        <button className="btn btn-sm" onClick={() => printFile(attachment)} style={{ flex: 1, padding: '8px', fontSize: '12px', backgroundColor: 'var(--success)', color: 'white' }}>Print</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="modal-footer">
                <button
                    onClick={handleCopyID}
                    className="btn"
                    style={{ background: 'var(--bg-content)', color: 'var(--text-main)', border: '1px solid var(--border-medium)' }}
                >
                    📋 Copy ID
                </button>
                <button
                    onClick={() => {
                        onEdit(student);
                        onClose();
                    }}
                    className="btn btn-info"
                >
                    ✏️ Edit Record
                </button>
                <button
                    onClick={handlePrint}
                    className="btn btn-primary"
                >
                    📤 Export PDF
                </button>
                <button
                    onClick={onClose}
                    className="btn btn-danger"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value: string; bold?: boolean; color?: string }> = ({
    label, value, bold = false, color
}) => (
    <div>
        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            {label}
        </div>
        <div style={{ fontSize: '15px', fontWeight: bold ? '700' : '500', color: color || 'var(--text-main)' }}>
            {value}
        </div>
    </div>
);

export default StudentView;