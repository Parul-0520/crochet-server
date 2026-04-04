const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Change from 465 to 587
    secure: false, // Port 587 ke liye false hona chahiye
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS, // Make sure this is a 16-digit App Password
    },
    // Ye block Render/Cloud environments mein connection errors ko fix karta hai:
    tls: {
        rejectUnauthorized: false
    }
});

async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
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