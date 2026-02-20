require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendLeaveStatusEmail = async (toEmail, status) => {
  await transporter.sendMail({
    from: '"Leave Management" <chaitanyapashte36@gmail.com>',
    to: toEmail,
    subject: `Leave ${status}`,
    html: `<h3>Your leave request has been <b>${status}</b>.</h3>`
  });
};