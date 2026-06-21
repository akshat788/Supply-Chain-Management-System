const express = require("express");
const router = express.Router();
const {
  getUsers, getUsersByRole, getUserById,
  updateUserRole, deleteUser, updatePassword,
} = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", protect, authorizeRoles("admin"), getUsers);
router.get("/role/:role", protect, authorizeRoles("admin"), getUsersByRole);
router.get("/:id", protect, authorizeRoles("admin"), getUserById);
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.put("/:id/password", protect, authorizeRoles("admin"), updatePassword);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;
