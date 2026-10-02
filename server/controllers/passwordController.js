const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const message =
      "If an account with that email exists, a password reset link has been generated.";

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(token);
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL?.split(",")[0] || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${token}`;

    console.log(`Password reset link for ${email}: ${resetUrl}`);

    const response = { message };
    if (process.env.SHOW_RESET_LINK === "true") {
      response.resetUrl = resetUrl;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Failed to process request", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include a letter and a number",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashToken(req.params.token),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
};

module.exports = { forgotPassword, resetPassword };