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
            student.category,
            formatDate(student.created_at),
            formatDate(student.updated_at)
        ]);

        // Create table
        autoTable(doc, {
            head: [['ID', 'ID Number', 'Full Name', 'Status', 'Created', 'Updated']],
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
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(18);
        doc.setTextColor(128, 0, 0);
        doc.text(`Student Record: ${student.title}`, 105, 20, { align: 'center' });

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 30, { align: 'center' });

        // Student Information
        const infoY = 45;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        let yPos = infoY;
        const lineHeight = 8;

        // Basic Info
        doc.setFont('helvetica', 'bold');
        doc.text('Basic Information:', 20, yPos);
        yPos += lineHeight + 2;

        doc.setFont('helvetica', 'normal');
        const basicInfo = [
            ['ID Number:', student.username],
            ['First Name:', student.first_name],
            ['Middle Name:', student.middle_name || 'N/A'],
            ['Last Name:', student.last_name],
            ['Status:', student.category],
            ['Created:', formatDate(student.created_at)],
            ['Last Updated:', formatDate(student.updated_at)]
        ];

        basicInfo.forEach(([label, value]) => {
            doc.text(`${label} ${value}`, 25, yPos);
            yPos += lineHeight;
        });

        // Graduate Info if applicable
        if (student.category === 'Graduate') {
            yPos += lineHeight + 2;
            doc.setFont('helvetica', 'bold');
            doc.text('Graduate Information:', 20, yPos);
            yPos += lineHeight + 2;

            doc.setFont('helvetica', 'normal');
            const gradInfo = [
                ['Last School Year:', student.last_school_year || 'N/A'],
                ['Contact Number:', student.contact_number || 'N/A'],
                ['SO Number:', student.so_number || 'N/A'],
                ['Date Issued:', student.date_issued || 'N/A'],
                ['Series Year:', student.series_year || 'N/A'],
                ['LRN:', student.lrn || 'N/A']
            ];

            gradInfo.forEach(([label, value]) => {
                doc.text(`${label} ${value}`, 25, yPos);
                yPos += lineHeight;
            });
        }

        // Attachments
        if (student.attachments && student.attachments.length > 0) {
            yPos += lineHeight + 2;
            doc.setFont('helvetica', 'bold');
            doc.text(`Attachments (${student.attachments.length}):`, 20, yPos);
            yPos += lineHeight + 2;

            doc.setFont('helvetica', 'normal');
            student.attachments.forEach((attachment, index) => {
                const fileName = attachment.split('/').pop() || attachment;
                doc.text(`${index + 1}. ${fileName}`, 25, yPos);
                yPos += lineHeight;
            });
        }

        // Add footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Confidential Student Record - St. Peter\'s College Student Records System', 105, doc.internal.pageSize.height - 10, { align: 'center' });

        // Save PDF
        doc.save(`student_${student.username}_${new Date().getTime()}.pdf`);
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