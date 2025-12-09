// src/utils/emailService.js
import nodemailer from 'nodemailer';

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    NODE_ENV,
} = process.env;

// Fallbacks (in case any env is missing)
const host = process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io';
const port = Number(process.env.SMTP_PORT || 2525); // 587 = STARTTLS, 465 = SSL

console.log('[EmailService] Init with:', {
    host,
    port,
    user: process.env.SMTP_USER,
    env: process.env.NODE_ENV,
});

// Create transporter
// NOTE: we do NOT force `secure` here; Nodemailer will:
//  - use secure=true for port 465
//  - use secure=false (STARTTLS) for others like 587
const transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

console.log('transporter', transporter.options);

// Optional: verify connection at startup
transporter
    .verify()
    .then(() => {
        console.log('[EmailService] transporter.verify OK, ready to send.');
    })
    .catch((err) => {
        console.error('[EmailService] transporter.verify FAILED:', {
            name: err.name,
            message: err.message,
            code: err.code,
        });
    });

/**
 * Simple helper to send email with optional PDF attachment
 *
 * @param {Object} options
 * @param {string} options.to
 * @param {string} [options.cc]
 * @param {string} options.subject
 * @param {string} options.html
 * @param {Buffer} [options.pdfBuffer]
 * @param {string} [options.fileName]
 */
export async function sendDocumentEmail({
    to,
    cc,
    subject,
    html,
    pdfBuffer,
    fileName,
}) {
    if (!to) {
        console.warn(
            '[EmailService] sendDocumentEmail: no "to" address, skipping email.'
        );
        return false;
    }

    const mailOptions = {
        from: SMTP_FROM || '"Seecog Softwares" <seecogonline@gmail.com>',
        to,
        cc,
        subject,
        html,
        attachments: [],
    };

    if (pdfBuffer) {
        mailOptions.attachments.push({
            filename: fileName || 'document.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
        });
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailService] sendMail OK:', {
            messageId: info.messageId,
            response: info.response,
        });
        return true;
    } catch (err) {
        console.error('[EmailService] sendMail ERROR:', {
            name: err.name,
            message: err.message,
            code: err.code,
            command: err.command,
            syscall: err.syscall,
            reason: err.reason,
        });
        return false;
    }
}
