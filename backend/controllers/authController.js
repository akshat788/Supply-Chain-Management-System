const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// -----------------------------------------------
// @route   POST /api/auth/register
// @desc    Public registration — Retailer only
// @access  Public
// -----------------------------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, organization, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email and password" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Public registration is ALWAYS retailer — no exceptions
    const user = await User.create({
      name, email, password,
      role: "retailer", // Force retailer role
      organization: organization || "",
      phone: phone || "",
    });

    res.status(201).json({
      message: "Retailer account created successfully",
      user: {
        _id: user._id, name: user.name,
        email: user.email, role: user.role,
        organization: user.organization, phone: user.phone,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------------------------
// @route   POST /api/auth/login
// @access  Public
// -----------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated. Contact admin." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id, name: user.name,
        email: user.email, role: user.role,
        organization: user.organization, phone: user.phone,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -----------------------------------------------
// @route   GET /api/auth/me
// @access  Private
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
