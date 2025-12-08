// test-mailtrap.js
import 'dotenv/config';
import nodemailer from 'nodemailer';

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
} = process.env;

console.log('Using:', { SMTP_HOST, SMTP_PORT, SMTP_USER });

const transporter = nodemailer.createTransport({
    host: SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(SMTP_PORT || 2525),
    secure: false,
    auth: {
        user: "ff192085ba3de3",
        pass: "6a7e24aff6343c",
    },
});

async function main() {
    try {
        await transporter.verify();
        console.log('✅ SMTP verify OK');

        const info = await transporter.sendMail({
            from: 'seecogonline@gmail.com',
            to: 'loved4743@gmail.com',
            subject: 'Mailtrap test from standalone script',
            text: 'If you see this in Mailtrap inbox, SMTP works.',
        });

        console.log('✅ sendMail OK:', info.messageId, info.response);
    } catch (err) {
        console.error('❌ ERROR:', {
            name: err.name,
            message: err.message,
            code: err.code,
            command: err.command,
            syscall: err.syscall,
            reason: err.reason,
        });
    }
}

main();
