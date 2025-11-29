// src/utils/generatePdfFromTemplate.js
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';

/**
 * Renders a DocumentType HTML template (with Handlebars placeholders)
 * into a PDF Buffer (A4, print background).
 *
 * @param {string} templateHtml - HTML from DocumentType.templateHtml
 * @param {object} data - key/value map to fill {{placeholders}}
 * @returns {Buffer} PDF buffer
 */
export async function generatePdfFromTemplate(templateHtml, data) {
    // 1. Compile template with Handlebars
    const template = Handlebars.compile(templateHtml);
    const html = template(data || {});

    // 2. Launch headless browser
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'networkidle0',
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm',
            },
        });

        await page.close();
        return pdfBuffer;
    } finally {
        await browser.close();
    }
}
