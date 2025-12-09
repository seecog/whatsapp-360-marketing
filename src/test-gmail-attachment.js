// test-gmail-attachment.js (TEMP only)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendDocumentEmail } from './utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // small fake PDF if you have one, else just a Buffer
    const dummyPdf = Buffer.from('%PDF-1.4\n% Test PDF\n', 'utf-8');

    const ok = await sendDocumentEmail({
        to: 'mukeshkumhar906@gmail.com',
        subject: 'Test Gmail + Attachment from main app',
        html: '<p>This is a test email with a small dummy PDF.</p>',
        pdfBuffer: dummyPdf,
        fileName: 'test.pdf',
    });

    console.log('Result:', ok);
}

main().catch(console.error);
