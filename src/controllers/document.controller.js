// src/controllers/document.controller.js
import PDFDocument from 'pdfkit';
import Employee from '../models/Employee.js';
import DocumentType from '../models/DocumentType.js';

export const renderDocumentsPage = async (req, res, next) => {
    try {
        const employees = await Employee.findAll({
            order: [['empName', 'ASC']],
        });

        const documentTypes = await DocumentType.findAll({
            where: { isDeleted: false },
            order: [['name', 'ASC']],
        });

        const employeesPlain = employees.map(e => e.get({ plain: true }));
        const documentTypesPlain = documentTypes.map(d => d.get({ plain: true }));

        const user = req.user
            ? { firstName: req.user.firstName, lastName: req.user.lastName }
            : {};

        res.render('documents', {
            layout: 'main',
            title: 'Documents',
            user,
            employees: employeesPlain,
            documentTypes: documentTypesPlain,
        });
    } catch (err) {
        next(err);
    }
};

export const generateDocument = async (req, res, next) => {
    try {
        const { employeeId, documentTypeId } = req.body;

        const employee = await Employee.findByPk(employeeId);
        const docType = await DocumentType.findByPk(documentTypeId);

        if (!employee || !docType || docType.isDeleted) {
            return res.status(400).send('Invalid employee or document type');
        }

        const pdf = new PDFDocument({ size: 'A4', margin: 50 });
        const fileName = `${docType.code}-${employee.empId || employee.id}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        );

        pdf.pipe(res);

        // Header
        pdf.fontSize(20).text(docType.name, { align: 'center' }).moveDown(2);

        // Employee details
        pdf
            .fontSize(12)
            .text(`Employee Name: ${employee.empName}`, { lineGap: 4 })
            .text(`Employee ID: ${employee.empId}`, { lineGap: 4 })
            .text(`Email: ${employee.empEmail}`, { lineGap: 4 })
            .text(`Designation: ${employee.empDesignation}`, { lineGap: 4 })
            .moveDown(1);

        const code = (docType.code || '').toUpperCase();

        if (code === 'INTERNSHIP_CERT') {
            pdf
                .moveDown(1)
                .fontSize(12)
                .text(
                    `This is to certify that ${employee.empName} (Employee ID: ${employee.empId}) ` +
                    `has successfully completed their internship with our organisation.`,
                    { align: 'justify', lineGap: 6 }
                );
        } else if (code === 'SALARY_SLIP') {
            pdf
                .moveDown(1)
                .fontSize(12)
                .text(
                    `Salary slip for ${employee.empName} (Employee ID: ${employee.empId}).`,
                    { lineGap: 6 }
                )
                .text(`CTC: ₹${employee.empCtc}`, { lineGap: 6 });
        } else {
            pdf
                .moveDown(1)
                .fontSize(12)
                .text(
                    `This document has been generated for ${employee.empName}.`,
                    { lineGap: 6 }
                );
        }

        pdf.moveDown(4).text('Authorised Signatory', { align: 'right' });

        pdf.end();
    } catch (err) {
        next(err);
    }
};
