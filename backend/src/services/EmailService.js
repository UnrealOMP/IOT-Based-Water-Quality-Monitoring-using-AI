// src/services/EmailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or SMTP
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendAlertEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Water Quality Monitor" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  };

  try {
    console.log('📧 Sending email to:', to);
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }

};