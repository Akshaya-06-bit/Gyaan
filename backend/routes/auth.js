const router = require("express").Router();
const { register, getProfile, getAllUsers, updateUserRole } = require("../controllers/authController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/register", register);
router.get("/profile", verifyToken, getProfile);
router.get("/users", verifyToken, requireRole("admin"), getAllUsers);
router.patch("/users/:userId/role", verifyToken, requireRole("admin"), updateUserRole);

module.exports = router;
