require('dotenv').config();
const emailService = require('./src/services/email.service.js');

async function testEmail() {
  console.log('Verifying connection...');
  const isVerified = await emailService.verifyConnection();
  if (isVerified) {
    console.log('Attempting to send test email...');
    try {
      const info = await emailService.sendEmail(
        process.env.EMAIL_USER,
        'Clubmeet SMTP Verification',
        'Your new SMTP configuration without OAuth2 is working perfectly!',
        '<b>Your new SMTP configuration without OAuth2 is working perfectly!</b>'
      );
      console.log('Email sent successfully:', info.messageId);
    } catch (e) {
      console.error('Failed to send email:', e);
    }
  } else {
    console.error('Skipping send due to verification failure.');
  }
}

testEmail();
