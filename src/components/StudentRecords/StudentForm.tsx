import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import database from '../../services/database';
import { COLORS } from '../../utils/constants';
import { showSuccess, showError } from '../../utils/sweetalert';
import '../../styles/App.css';

interface StudentFormProps {
    student?: Student;
    onSuccess: () => void;
    onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSuccess, onCancel }) => {
    const isEditMode = !!student;
    const currentUser = database.getCurrentUser();

    const [formData, setFormData] = useState({
        username: student?.username || '',
        first_name: student?.first_name || '',
        middle_name: student?.middle_name || '',
        last_name: student?.last_name || '',
        category: student?.category || 'Active',
        grade_level: student?.grade_level || '',
        last_school_year: student?.last_school_year || '',
        contact_number: student?.contact_number || '',
        so_number: student?.so_number || '',
        date_issued: student?.date_issued || '',
        series_year: student?.series_year || '',
        lrn: student?.lrn || ''
    });

    const [attachments, setAttachments] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<string[]>(
        student?.attachments || []
    );
    const [grades, setGrades] = useState<{ subject: string; grade: string }[]>(
        student?.grades?.map(g => ({ subject: g.subject, grade: g.grade })) || []
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showGraduateFields, setShowGraduateFields] = useState(
        student?.category === 'Graduate' || false
    );

    useEffect(() => {
        setShowGraduateFields(formData.category === 'Graduate');
    }, [formData.category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachments(prev => [...prev, ...files]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (index: number) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleGradeChange = (index: number, field: 'subject' | 'grade', value: string) => {
        const newGrades = [...grades];
        newGrades[index][field] = value;
        setGrades(newGrades);
    };

    const addGrade = () => {
        setGrades([...grades, { subject: '', grade: '' }]);
    };

    const removeGrade = (index: number) => {
        setGrades(grades.filter((_, i) => i !== index));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'ID Number is required';
        }

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First Name is required';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last Name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !currentUser) {
            return;
        }

        try {
            const title = `${formData.first_name} ${formData.last_name} (${formData.username})`;

            // Upload new files to server
            let newAttachmentPaths: string[] = [];
            if (attachments.length > 0) {
                try {
                    newAttachmentPaths = await database.uploadFiles(attachments);
                } catch (uploadError) {
                    console.error('File upload failed:', uploadError);
                    // Continue without attachments if upload fails
                }
            }
            const allAttachments = [...existingAttachments, ...newAttachmentPaths];

            // Filter out empty grades
            const validGrades = grades.filter(g => g.subject.trim() && g.grade.trim());

            const studentData = {
                title,
                username: formData.username,
                password: formData.first_name, // Using first name as password field
                attachments: allAttachments,
                category: formData.category,
                first_name: formData.first_name,
                middle_name: formData.middle_name,
                last_name: formData.last_name,
                owner_id: currentUser.id,
                grade_level: formData.grade_level,
                grades: validGrades as any, // Cast to any to avoid partial type check failure
                ...(formData.category === 'Graduate' && {
                    last_school_year: formData.last_school_year,
                    contact_number: formData.contact_number,
                    so_number: formData.so_number,
                    date_issued: formData.date_issued,
                    series_year: formData.series_year,
                    lrn: formData.lrn
                })
            };

            if (isEditMode && student) {
                const updated = await database.updateStudent(student.id, currentUser.id, studentData);
                if (updated) {
                    await showSuccess('Success!', 'Student record updated successfully!');
                    onSuccess();
                } else {
                    showError('Error', 'Failed to update student record.');
                }
            } else {
                const created = await database.createStudent(studentData);
                if (created) {
                    await showSuccess('Success!', 'Student record created successfully!');
                    onSuccess();
                } else {
                    showError('Error', 'Failed to create student record.');
                }
            }
        } catch (error) {
            showError('Oops!', 'An error occurred. Please try again.');
            console.error(error);
        }
    };

    return (
        <div style={{ backgroundColor: COLORS.background }}>
            <div className="modal-header">
                <h2 style={{ margin: 0 }}>
                    {isEditMode ? '✏️ Edit Student Record' : '➕ Add New Student Record'}
                </h2>
                <button
                    onClick={onCancel}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
                        {/* Left Column */}
                        <div style={{ flex: 1 }}>
                            <h3 style={{ color: COLORS.primary, marginBottom: '15px' }}>👤 Basic Information</h3>

                            <div className="form-group">
                                <label className="form-label">ID Number *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter student ID number"
                                />
                                {errors.username && (
                                    <div style={{ color: COLORS.danger, fontSize: '12px', marginTop: '5px' }}>
                                        {errors.username}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter first name"
                                />
                                {errors.first_name && (
                                    <div style={{ color: COLORS.danger, fontSize: '12px', marginTop: '5px' }}>
                                        {errors.first_name}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Middle Name</label>
                                <input
                                    type="text"
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter middle name (optional)"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Last Name *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    placeholder="Enter last name"
                                />
                                {errors.last_name && (
                                    <div style={{ color: COLORS.danger, fontSize: '12px', marginTop: '5px' }}>
                                        {errors.last_name}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Grade Level</label>
                                <select
                                    name="grade_level"
                                    value={formData.grade_level}
                                    onChange={handleInputChange}
                                    className="form-control"
                                >
                                    <option value="">Select Grade Level</option>
                                    <option value="Grade 7">Grade 7</option>
                                    <option value="Grade 8">Grade 8</option>
                                    <option value="Grade 9">Grade 9</option>
                                    <option value="Grade 10">Grade 10</option>
                                    <option value="Grade 11">Grade 11</option>
                                    <option value="Grade 12">Grade 12</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="form-control"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Right Column - Graduate Info */}
                        <div style={{ flex: 1 }}>
                            <h3 style={{ color: COLORS.primary, marginBottom: '15px' }}>🎓 Graduate Information</h3>

                            {showGraduateFields ? (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Last School Year Attended</label>
                                        <input
                                            type="text"
                                            name="last_school_year"
                                            value={formData.last_school_year}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Enter last school year attended"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Contact Number</label>
                                        <input
                                            type="text"
                                            name="contact_number"
                                            value={formData.contact_number}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Enter contact number"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">SO Number</label>
                                        <input
                                            type="text"
                                            name="so_number"
                                            value={formData.so_number}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Enter SO number"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Date Issued</label>
                                        <input
                                            type="date"
                                            name="date_issued"
                                            value={formData.date_issued}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Series of Year</label>
                                        <input
                                            type="text"
                                            name="series_year"
                                            value={formData.series_year}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Enter series of year"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">LRN (Learner Reference Number)</label>
                                        <input
                                            type="text"
                                            name="lrn"
                                            value={formData.lrn}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="Enter LRN"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#666',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '4px'
                                }}>
                                    Graduate information will appear here when status is set to "Graduate"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Academic Grades Section */}
                    <div style={{ marginTop: '20px' }}>
                        <h3 style={{ color: COLORS.primary, marginBottom: '15px' }}>📊 Academic Grades</h3>

                        <div style={{
                            backgroundColor: COLORS.card_bg,
                            padding: '20px',
                            borderRadius: '4px'
                        }}>
                            {grades.map((grade, index) => (
                                <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ flex: 2 }}>
                                        <input
                                            type="text"
                                            placeholder="Subject (e.g., Mathematics)"
                                            value={grade.subject}
                                            onChange={(e) => handleGradeChange(index, 'subject', e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            placeholder="Grade/Rating"
                                            value={grade.grade}
                                            onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeGrade(index)}
                                        style={{
                                            backgroundColor: COLORS.danger,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '0 15px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addGrade}
                                style={{
                                    backgroundColor: COLORS.info,
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 15px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                ➕ Add Subject
                            </button>
                        </div>
                    </div>

                    {/* Attachments Section */}
                    <div style={{ marginTop: '20px' }}>
                        <h3 style={{ color: COLORS.primary, marginBottom: '15px' }}>📁 Attachments</h3>

                        {/* Existing Attachments */}
                        {existingAttachments.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Existing Attachments:</h4>
                                <div style={{
                                    backgroundColor: COLORS.card_bg,
                                    padding: '15px',
                                    borderRadius: '4px'
                                }}>
                                    {existingAttachments.map((attachment, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px',
                                            backgroundColor: 'white',
                                            marginBottom: '5px',
                                            borderRadius: '4px'
                                        }}>
                                            <span>📄 {attachment}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeExistingAttachment(index)}
                                                style={{
                                                    backgroundColor: COLORS.danger,
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Attachments */}
                        <div style={{
                            backgroundColor: COLORS.card_bg,
                            padding: '20px',
                            borderRadius: '4px',
                            minHeight: '100px'
                        }}>
                            <div style={{ marginBottom: '15px' }}>
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="file-upload"
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: COLORS.info,
                                        color: 'white',
                                        padding: '8px 15px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginRight: '10px'
                                    }}
                                >
                                    ➕ Add Files
                                </label>
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                    Accepted: Images, PDF, Documents
                                </span>
                            </div>

                            {attachments.length > 0 && (
                                <div style={{
                                    backgroundColor: 'white',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    maxHeight: '150px',
                                    overflowY: 'auto'
                                }}>
                                    {attachments.map((file, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '5px',
                                            borderBottom: '1px solid #eee'
                                        }}>
                                            <span style={{ fontSize: '12px' }}>📄 {file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                style={{
                                                    backgroundColor: COLORS.danger,
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn btn-danger"
                            style={{
                                backgroundColor: COLORS.danger,
                                padding: '10px 30px',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                backgroundColor: COLORS.primary,
                                padding: '10px 30px',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            💾 {isEditMode ? 'Update Student Record' : 'Save Student Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;