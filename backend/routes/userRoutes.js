const express = require("express");
const router = express.Router();
const {
  getUsers, getUsersByRole, getUserById,
  updateUserRole, deleteUser, updatePassword,
  updateProfile, changePassword, createUser,
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.get("/role/:role", protect, authorizeRoles("admin"), getUsersByRole);
router.get("/:id", protect, getUserById);
router.post("/", protect, authorizeRoles("admin"), createUser);
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.put("/:id/password", protect, authorizeRoles("admin"), updatePassword);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

// Self routes (any logged in user)
router.put("/:id/profile", protect, updateProfile);
router.put("/:id/change-password", protect, changePassword);

module.exports = router;
