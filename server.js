'use strict';

const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS for local static files opening in browser
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Configure mail transport
// Provide SMTP settings via environment variables for production use.
// Examples for Gmail (less secure, not recommended):
// EMAIL_HOST=smtp.gmail.com EMAIL_PORT=465 EMAIL_SECURE=true EMAIL_USER=your@gmail.com EMAIL_PASS=app_password
// Default recipient can be changed with EMAIL_RECIPIENT env var.
const EMAIL_RECIPIENT = process.env.EMAIL_RECIPIENT || 'xyz@gmail.com';

function createTransport() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT || 465),
            secure: String(process.env.EMAIL_SECURE || 'true') === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    // Fallback: log-only transport to console if SMTP not configured
    return {
        sendMail: async (opts) => {
            console.log('Email sending is in log-only mode. Configure SMTP to actually send emails.');
            console.log('To:', opts.to);
            console.log('Subject:', opts.subject);
            console.log('Text:', opts.text);
            console.log('HTML:', opts.html);
            return { messageId: 'log-only' };
        }
    };
}

const transporter = createTransport();

app.post('/api/send-email', async (req, res) => {
    try {
        const { jobTitle, pageUrl, fields } = req.body || {};
        if (!fields || typeof fields !== 'object') {
            return res.status(400).json({ ok: false, error: 'Missing fields' });
        }

        const safe = (v) => (v === undefined || v === null ? '' : String(v));

        const lines = [];
        if (jobTitle) lines.push(`Job Title: ${safe(jobTitle)}`);
        if (pageUrl) lines.push(`Page URL: ${safe(pageUrl)}`);
        lines.push('');
        lines.push('Application Details:');
        Object.keys(fields).forEach((key) => {
            lines.push(`- ${key}: ${safe(fields[key])}`);
        });
        const textBody = lines.join('\n');

        const htmlRows = Object.keys(fields).map((key) => {
            return `<tr><td style="padding:6px 10px;border:1px solid #eee;font-weight:600;">${key}</td><td style="padding:6px 10px;border:1px solid #eee;">${safe(fields[key])}</td></tr>`;
        }).join('');

        const htmlBody = `
            <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#333;">
                <h2 style="margin:0 0 8px 0;">New Job Application</h2>
                ${jobTitle ? `<p style="margin:0 0 8px 0;"><strong>Job Title:</strong> ${safe(jobTitle)}</p>` : ''}
                ${pageUrl ? `<p style="margin:0 0 16px 0;"><strong>Page URL:</strong> <a href="${safe(pageUrl)}">${safe(pageUrl)}</a></p>` : ''}
                <table style="border-collapse:collapse;border:1px solid #eee;min-width:380px;">
                    <tbody>${htmlRows}</tbody>
                </table>
            </div>
        `;

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@localhost',
            to: EMAIL_RECIPIENT,
            subject: `New Application${jobTitle ? ` - ${jobTitle}` : ''}`,
            text: textBody,
            html: htmlBody
        });

        return res.json({ ok: true, messageId: info.messageId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, error: 'Internal error' });
    }
});

app.listen(PORT, () => {
    console.log(`Email server listening on http://localhost:${PORT}`);
});


