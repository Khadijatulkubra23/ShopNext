const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Order = require("../models/Order");

const updateProfile = async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name || name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include a letter and a number",
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update password", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    if (await Order.exists({ user: req.params.id })) {
      return res.status(400).json({ message: "This user has orders and cannot be deleted" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

module.exports = { updateProfile, changePassword, getUsers, updateUserRole, deleteUser };