import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student } from '../types';
import { formatDate } from '../utils/helpers';
import { COLORS } from '../utils/constants';

class PDFExportService {
    async exportAllStudents(students: Student[], title: string = 'Student Records'): Promise<void> {
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.setTextColor(COLORS.primary);
        doc.text(title, 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });
        doc.text(`Total Records: ${students.length}`, 105, 37, { align: 'center' });

        // Prepare table data
        const tableData = students.map(student => [
            student.id.toString(),
            student.username,
            `${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`,
            student.grade_level || 'N/A',
            student.category,
            formatDate(student.created_at),
            formatDate(student.updated_at)
        ]);

        // Create table
        autoTable(doc, {
            head: [['ID', 'ID Number', 'Full Name', 'Grade Level', 'Status', 'Created', 'Updated']],
            body: tableData,
            startY: 45,
            theme: 'grid',
            headStyles: {
                fillColor: COLORS.primary as any,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        // Add summary
        const summaryY = (autoTable as any).previous.finalY + 10;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary by Status:', 14, summaryY);

        const statusCounts: Record<string, number> = {};
        students.forEach(student => {
            statusCounts[student.category] = (statusCounts[student.category] || 0) + 1;
        });

        let yPos = summaryY + 7;
        Object.entries(statusCounts).forEach(([status, count]) => {
            const percentage = ((count / students.length) * 100).toFixed(1);
            doc.text(`• ${status}: ${count} student(s) (${percentage}%)`, 20, yPos);
            yPos += 6;
        });

        // Add footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('St. Peter\'s College - Student Records Management System', 105, doc.internal.pageSize.height - 10, { align: 'center' });

        // Save the PDF
        doc.save(`student_records_${new Date().getTime()}.pdf`);
    }

    async exportStudentDetails(student: Student): Promise<void> {
        try {
            const doc = new jsPDF();

            // Add header
            doc.setFontSize(18);
            doc.setTextColor(128, 0, 0); // Maroon color
            doc.text(`ST. PETER'S COLLEGE`, 105, 20, { align: 'center' });

            doc.setFontSize(14);
            doc.text(`Student Academic Record`, 105, 28, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 35, { align: 'center' });

            // Horizontal Line
            doc.setDrawColor(128, 0, 0);
            doc.line(20, 38, 190, 38);

            // Student Information
            let yPos = 50;
            const lineHeight = 8;

            // Basic Info Section
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('BASIC INFORMATION', 20, yPos);
            yPos += 8;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);

            const basicInfo = [
                ['ID Number:', student.username],
                ['Full Name:', `${student.first_name} ${student.middle_name || ''} ${student.last_name}`.trim()],
                ['Grade Level:', student.grade_level || 'N/A'],
                ['Status:', student.category],
                ['Created On:', formatDate(student.created_at)],
                ['Last Updated:', formatDate(student.updated_at)]
            ];

            basicInfo.forEach(([label, value]) => {
                doc.setFont('helvetica', 'bold');
                doc.text(label, 25, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(String(value), 60, yPos);
                yPos += lineHeight;
            });

            // Graduate Info section if applicable
            if (student.category === 'Graduate') {
                yPos += 5;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('GRADUATION DETAILS', 20, yPos);
                yPos += 8;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                const gradInfo = [
                    ['Last School Year:', student.last_school_year || 'N/A'],
                    ['Contact Number:', student.contact_number || 'N/A'],
                    ['SO Number:', student.so_number || 'N/A'],
                    ['Date Issued:', student.date_issued || 'N/A'],
                    ['Series Year:', student.series_year || 'N/A'],
                    ['LRN:', student.lrn || 'N/A']
                ];

                gradInfo.forEach(([label, value]) => {
                    doc.setFont('helvetica', 'bold');
                    doc.text(label, 25, yPos);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(value), 65, yPos);
                    yPos += lineHeight;
                });
            }

            // Attachments List if applicable
            if (student.attachments && student.attachments.length > 0) {
                yPos += 5;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`ATTACHMENTS (${student.attachments.length})`, 20, yPos);
                yPos += 8;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                student.attachments.forEach((attachment, index) => {
                    const fileName = attachment.split('/').pop() || attachment;
                    doc.text(`${index + 1}. ${fileName}`, 25, yPos);
                    yPos += 6;
                });
            }

            // Add footer
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('This is a computer-generated document from St. Peter\'s College Student Records System.', 105, doc.internal.pageSize.height - 15, { align: 'center' });
            doc.text('VPC-SRMS © 2026', 105, doc.internal.pageSize.height - 10, { align: 'center' });

            // Save PDF
            doc.save(`Student_Record_${student.username}_${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error('Failed to export student details:', error);
            throw new Error('Could not generate PDF. Please try again.');
        }
    }

    async exportStatistics(stats: Record<string, any>, title: string = 'System Statistics'): Promise<void> {
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.setTextColor(128, 0, 0);
        doc.text(title, 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

        let yPos = 45;

        // Student Statistics
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Students: ${stats.total || 0}`, 20, yPos);
        yPos += 15;

        if (stats.categoryStats) {
            doc.setFontSize(14);
            doc.text('Distribution by Status:', 20, yPos);
            yPos += 10;

            doc.setFontSize(11);
            Object.entries(stats.categoryStats).forEach(([status, count]: [string, any]) => {
                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0.0';
                doc.text(`• ${status}: ${count} (${percentage}%)`, 25, yPos);
                yPos += 7;
            });
        }

        // Recent Activity
        if (stats.recentStudents && stats.recentStudents.length > 0) {
            yPos += 10;
            doc.setFontSize(14);
            doc.text('Recent Activity:', 20, yPos);
            yPos += 10;

            doc.setFontSize(11);
            (stats.recentStudents as Array<{ first_name: string, last_name: string, category: string, updated_at: string }>).forEach(student => {
                const name = `${student.first_name} ${student.last_name}`;
                doc.text(`• ${name} (${student.category}) - ${formatDate(student.updated_at)}`, 25, yPos);
                yPos += 7;
            });
        }

        // Add footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('St. Peter\'s College - Student Records Management System', 105, doc.internal.pageSize.height - 10, { align: 'center' });

        doc.save(`statistics_${new Date().getTime()}.pdf`);
    }
}

export default new PDFExportService();