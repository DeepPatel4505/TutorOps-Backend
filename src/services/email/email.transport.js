import {
    EMAIL_PROVIDER,
    GMAIL_USER,
    GMAIL_PASS,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
} from '#src/config/env.js';
import nodemailer from 'nodemailer';

// const EMAIL_PROVIDER = EMAIL_PROVIDER || 'gmail';

let transporter;

if (EMAIL_PROVIDER === 'gmail') {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS,
        },
    });
} else if (EMAIL_PROVIDER === 'smtp') {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: SMTP_SECURE === 'true',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
} else {
    throw new Error(`Unsupported EMAIL_PROVIDER: ${EMAIL_PROVIDER}`);
}

export default transporter;
