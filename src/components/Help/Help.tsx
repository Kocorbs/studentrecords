import React from 'react';
import '../../styles/App.css';

const Help: React.FC = () => {
    return (
        <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', marginBottom: '8px' }}>🆘 Help & Support Center</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Everything you need to know about the Student Records Management System</p>
            </div>

            <div className="card">
                <div className="card-body" style={{ padding: '48px' }}>
                    <div style={{ maxWidth: '900px' }}>
                        <div style={{ marginBottom: '48px' }}>
                            <h2 style={{ color: 'var(--primary)', fontSize: '24px', fontWeight: '900', marginBottom: '16px' }}>
                                System User Guide
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7' }}>
                                Welcome to the St. Peter's College Student Records System. This guide provides an overview of how to efficiently manage student academic records and export necessary documentation.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                            <section>
                                <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>📋</span> Management
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '16px' }}>
                                    <HelpItem icon="➕" text="Add new students using the global primary action buttons." />
                                    <HelpItem icon="✏️" text="Modify existing records via the edit icon in the student table." />
                                    <HelpItem icon="🗑️" text="Remove records using the delete action (requires confirmation)." />
                                    <HelpItem icon="👁️" text="View full academic details and attachments in the detail modal." />
                                </ul>
                            </section>

                            <section>
                                <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>📤</span> Reporting
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '16px' }}>
                                    <HelpItem icon="📄" text="Export the entire student directory as a PDF report." />
                                    <HelpItem icon="📈" text="Generate statistical summaries and demographic analytics." />
                                    <HelpItem icon="🎓" text="Specific graduate registries with SO and LRN data." />
                                    <HelpItem icon="🖼️" text="Include scanned document attachments in individual exports." />
                                </ul>
                            </section>

                            <section>
                                <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>🎓</span> Status Categories
                                </h3>
                                <div style={{ background: 'var(--bg-content)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '12px', fontSize: '14px' }}>
                                        <li><strong style={{ color: '#059669' }}>Active:</strong> Currently enrolled academic participants.</li>
                                        <li><strong style={{ color: '#2563eb' }}>Graduate:</strong> Alumni with completed studies and SO data.</li>
                                        <li><strong style={{ color: '#d97706' }}>Inactive:</strong> Students who are no longer actively enrolled.</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h3 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>🔐</span> Security
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '16px' }}>
                                    <HelpItem icon="🛡️" text="All student and admin passwords are salted and hashed." />
                                    <HelpItem icon="🛂" text="Role-based access ensures data privacy and integrity." />
                                    <HelpItem icon="⏰" text="Automatic session management for administrative security." />
                                </ul>
                            </section>
                        </div>

                        <div style={{
                            marginTop: '64px',
                            padding: '32px',
                            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            borderRadius: 'var(--radius-lg)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '32px'
                        }}>
                            <div style={{ fontSize: '48px' }}>📞</div>
                            <div>
                                <h4 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Need further assistance?</h4>
                                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '0' }}>
                                    Our support team is available Mon-Fri, 8:00 AM - 5:00 PM.
                                    <br />
                                    <strong>Email:</strong> admin@stpeterscollege.edu.ph | <strong>Phone:</strong> (063) 221-1234
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HelpItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
    <li style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>
        <span style={{ opacity: 0.8 }}>{icon}</span>
        <span>{text}</span>
    </li>
);

export default Help;