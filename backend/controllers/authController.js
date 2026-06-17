const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// -----------------------------------------------
// Generate JWT Token
// -----------------------------------------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // token valid for 7 days
  });
};

// -----------------------------------------------
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// -----------------------------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, organization, phone } = req.body;

    // Check all required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email and password" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create new user (password is hashed automatically via userModel pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "retailer",
      organization: organization || "",
      phone: phone || "",
    });

    // Return user data + token
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------------------------
// @route   POST /api/auth/login
// @desc    Login user and return token
// @access  Public
// -----------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res
        .status(401)
        .json({ message: "Account is deactivated. Contact admin." });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Return user data + token
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------------------------
// @route   GET /api/auth/me
// @desc    Get current logged in user profile
// @access  Private (requires token)
// -----------------------------------------------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
