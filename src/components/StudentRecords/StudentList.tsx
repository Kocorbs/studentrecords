'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import database from '../../services/database';
import socketService from '../../services/socket';
import { Student } from '../../types';
import { formatDate } from '../../utils/helpers';
import { showDeleteConfirm, showToast } from '../../utils/sweetalert';
import '../../styles/App.css';
import StudentView from './StudentView';
import StudentForm from './StudentForm';

const StudentList: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        loadStudents();

        // Connect to real-time updates
        socketService.connect();

        // Subscribe to student changes
        const unsubscribe = socketService.onStudentChange((type, data) => {
            if (type === 'created') {
                setStudents(prev => [data, ...prev]);
                showToast.success(`New student added: ${data.first_name} ${data.last_name}`);
            } else if (type === 'updated') {
                setStudents(prev => prev.map(s => s.id === data.id ? data : s));
                showToast.info(`Record updated: ${data.first_name} ${data.last_name}`);
            } else if (type === 'deleted') {
                setStudents(prev => prev.filter(s => s.id !== data.id));
                showToast.warning('A student record was deleted');
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const loadStudents = async () => {
        const currentUser = database.getCurrentUser();
        if (currentUser) {
            const fetchedStudents = await database.getStudents(currentUser.id);
            setStudents(fetchedStudents);
        }
    };

    const handleAddStudent = () => {
        setEditingStudent(undefined);
        setIsFormOpen(true);
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setIsFormOpen(true);
    };

    const handleDeleteStudent = async (student: Student) => {
        const result = await showDeleteConfirm(`${student.first_name} ${student.last_name}'s record`);
        if (result.isConfirmed) {
            const currentUser = database.getCurrentUser();
            if (currentUser) {
                const success = await database.deleteStudent(student.id, currentUser.id);
                if (success) {
                    showToast.success('Student record deleted successfully!');
                    loadStudents();
                }
            }
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.username.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterCategory === 'All' || student.category === filterCategory;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="student-list-container">
            {/* Header Area */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
                        Student Records
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
                        Manage and track academic records for VPC students
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handleAddStudent}>
                    <span>➕</span> Add New Student
                </button>
            </div>

            {/* Filters Area */}
            <div className="card" style={{ marginBottom: '32px', border: '1px solid var(--border-light)' }}>
                <div className="card-body" style={{ display: 'flex', gap: '20px', padding: '24px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                        <label htmlFor="search-students" style={{ display: 'none' }}>Search Students</label>
                        <input
                            id="search-students"
                            name="search"
                            type="text"
                            placeholder="Search by name or ID number..."
                            className="form-control"
                            style={{ paddingLeft: '44px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '200px' }}>
                        <label htmlFor="filter-category" style={{ display: 'none' }}>Filter Category</label>
                        <select
                            id="filter-category"
                            name="category"
                            className="form-control"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Active">Active Students</option>
                            <option value="Graduate">Graduates</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>ID Number</th>
                            <th>Grade Level</th>
                            <th>Category</th>
                            <th>Last Updated</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <tr key={student.id}>
                                    <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                                        {student.first_name} {student.last_name}
                                    </td>
                                    <td>
                                        <code style={{ background: 'var(--bg-content)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>
                                            {student.username}
                                        </code>
                                    </td>
                                    <td style={{ fontWeight: '600', color: 'var(--info)' }}>
                                        {student.grade_level || 'N/A'}
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
                                        }}>
                                            {student.category}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                        {formatDate(student.updated_at)}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                className="btn btn-sm"
                                                style={{ padding: '8px', background: 'var(--bg-content)', border: '1px solid var(--border-light)' }}
                                                onClick={() => setSelectedStudent(student)}
                                                title="View Details"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                style={{ padding: '8px', color: 'var(--info)', background: 'var(--bg-content)', border: '1px solid var(--border-light)' }}
                                                onClick={() => handleEditStudent(student)}
                                                title="Edit Record"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm"
                                                style={{ padding: '8px', color: 'var(--danger)', background: 'var(--bg-content)', border: '1px solid var(--border-light)' }}
                                                onClick={() => handleDeleteStudent(student)}
                                                title="Delete Record"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                                    No student records found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => router.push('/dashboard')}
                    style={{ background: 'white', color: 'var(--text-main)', border: '1px solid var(--border-medium)', padding: '12px 32px' }}
                >
                    ⬅ Back to Dashboard
                </button>
            </div>

            {/* Modals */}
            {selectedStudent && (
                <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
                    <div className="modal" style={{ width: '900px' }} onClick={e => e.stopPropagation()}>
                        <StudentView
                            student={selectedStudent}
                            onClose={() => setSelectedStudent(null)}
                            onEdit={(student) => handleEditStudent(student)}
                        />
                    </div>
                </div>
            )}

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal" style={{ width: '800px' }}>
                        <StudentForm
                            student={editingStudent}
                            onCancel={() => setIsFormOpen(false)}
                            onSuccess={() => {
                                setIsFormOpen(false);
                                loadStudents();
                            }}
                        />
                    </div>
                </div>
            )}


        </div>
    );
};

export default StudentList;