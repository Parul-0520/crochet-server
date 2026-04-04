const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,// Isse Nodemailer khud best port/host pick kar lega
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS, // 16-digit App Password bina space ke
    },
    // host: 'smtp.gmail.com',
    // port: 587,
    // secure: false,
    // auth: {
    //     user: process.env.EMAIL,
    //     pass: process.env.EMAIL_PASS,
    // },
    // YE SARE PARAMETERS IPV6 ISSUE FIX KARENGE:
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 10000,
    socketTimeout: 10000,
    dnsOptions: {
        family: 4 // FORCE IPV4 (Sabse important line)
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    }
});

async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `"Crochet With Parul" <${process.env.EMAIL}>`,
            to,
            subject,
            text,
            html,
        });
        console.log('Email sent successfully:', info.messageId); // Success confirm karne ke liye
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendEmail };