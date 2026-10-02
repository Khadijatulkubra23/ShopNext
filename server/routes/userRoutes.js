const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  updateProfile,
  changePassword,
  getUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route accessed successfully",
    user: req.user,
  });
});

router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

router.get("/", protect, authorize("admin"), getUsers);
router.put("/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;