const express = require("express");
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { updateUserSchema } = require("../utils/validation");

const router = express.Router();

// Admin only routes
router.use(authenticate);
router.use(authorize("admin"));

// Get all users
router.get("/", userController.getAllUsers);

// Get user by ID
router.get("/:id", userController.getUserById);

// Create a new user
router.post("/", userController.createUser);

// Update user
router.put("/:id", validate(updateUserSchema), userController.updateUser);

// Delete user
router.delete("/:id", userController.deleteUser);

// Approve user registration
router.patch("/:id/approve", userController.approveUser);

module.exports = router;
