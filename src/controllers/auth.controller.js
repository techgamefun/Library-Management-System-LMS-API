const { User } = require("../models");
const { generateToken } = require("../utils/jwt");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Generate password based on user data
    const password = User.generatePassword(name, email, phone);

    // For demo purposes, we approve admin users automatically
    // In production, you would want all users to require approval
    const isApproved = role === "admin" ? true : false;

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      isApproved,
    });

    // Remove password from response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isApproved: user.isApproved,
      generatedPassword: password, // Only sending this back for demo purposes
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
      note: "In a production environment, the password would be sent via email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password is valid
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};
