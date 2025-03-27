const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validation.middleware");
const { registerSchema, loginSchema } = require("../utils/validation");

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

module.exports = router;
