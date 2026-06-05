const nodemailer = require("nodemailer");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,        
    secure: true,     
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your Productr Login OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #1e3a8a; margin-bottom: 8px;">Productr</h2>
        <p style="color: #444; font-size: 15px;">Your one-time password (OTP) for login:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #1e3a8a;">${otp}</span>
        </div>
        <p style="color: #888; font-size: 13px;">This OTP is valid for <strong>${process.env.OTP_EXPIRES_MINUTES || 5} minutes</strong>. Do not share it with anyone.</p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };
