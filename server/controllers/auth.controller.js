const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { generateOTP, sendOTPEmail } = require("../utils/otp.utils");
const { successResponse, errorResponse } = require("../utils/response.utils");

const sendOTP = [
  body("email").isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    try {
      const { email } = req.body;

      await OTP.deleteMany({ email });

      const otp = generateOTP();
      const expiresAt = new Date(
        Date.now() + (parseInt(process.env.OTP_EXPIRES_MINUTES) || 5) * 60 * 1000
      );

      await OTP.create({ email, otp, expiresAt });

      await sendOTPEmail(email, otp);

      return successResponse(res, 200, "OTP sent successfully to your email.", { email });
    } catch (error) {
      console.error("Send OTP Error:", error.message);
      return errorResponse(res, 500, "Failed to send OTP. Please try again.");
    }
  },
];

const verifyOTP = [
  body("email").isEmail().withMessage("Please provide a valid email address.").normalizeEmail(),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits.")
    .isNumeric()
    .withMessage("OTP must contain only numbers."),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    try {
      const { email, otp } = req.body;

      const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return errorResponse(res, 400, "OTP not found. Please request a new OTP.");
      }

      if (new Date() > otpRecord.expiresAt) {
        await OTP.deleteMany({ email });
        return errorResponse(res, 400, "OTP has expired. Please request a new OTP.");
      }

      if (otpRecord.otp !== otp) {
        return errorResponse(res, 400, "Invalid OTP. Please enter a valid OTP.");
      }

      await OTP.deleteMany({ email });

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      });

      return successResponse(res, 200, "Login successful.", {
        token,
        user: { id: user._id, email: user.email },
      });
    } catch (error) {
      console.error("Verify OTP Error:", error.message);
      return errorResponse(res, 500, "OTP verification failed. Please try again.");
    }
  },
];

module.exports = { sendOTP, verifyOTP };
