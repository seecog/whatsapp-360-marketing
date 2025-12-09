// test-nodemailer.js
import 'dotenv/config';          // loads .env / property.env if configured
import nodemailer from 'nodemailer';

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
} = process.env;

async function main() {
    console.log('[Test] Using SMTP config:', {
        host: "smtp.gmail.com",
        port: 587,
        user: "seecogonline@gmail.com",
    });

    // Create a simple transporter (same as emailService)
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: Number(587),
        auth: {
            user: "seecogonline@gmail.com",
            pass: "aqsopgxbwnafgbky",
        },
    });

    // 1) Verify SMTP connection
    try {
        await transporter.verify();
        console.log('[Test] SMTP verify OK');
    } catch (err) {
        console.error('[Test] SMTP verify FAILED:', err);
        process.exit(1);
    }

    // 2) Send a simple test email (no attachment)
    try {
        const info = await transporter.sendMail({
            from: SMTP_FROM || '"Seecog Test" <seecogonline@gmail.com>',
            // For Mailtrap Sandbox, any email is fine; message will appear in UI
            to: 'loved4743@gmail.com',
            subject: '✅ Nodemailer test mail',
            text: 'This is a plain text test mail from test-nodemailer.js',
            html: '<p>This is a <strong>test mail</strong> from <code>test-nodemailer.js</code>.</p>',
        });

        console.log('[Test] Email sent OK:', {
            messageId: info.messageId,
            envelope: info.envelope,
            response: info.response,
        });
    } catch (err) {
        console.error('[Test] sendMail ERROR:', {
            name: err.name,
            message: err.message,
            code: err.code,
            command: err.command,
            syscall: err.syscall,
            reason: err.reason,
        });
    }
}

main().catch((err) => {
    console.error('[Test] Unexpected error:', err);
});
