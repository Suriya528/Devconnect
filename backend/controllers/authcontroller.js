const Student = require('../models/user')
const asyncHandler = require('../middleware/asyncHandler')
const generateToken = require('../utils/generateToken')

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, middleName, email, role, password } = req.body

  // Validation
  if (!firstName || !lastName || !email || !password) {
    res.status(400)
    throw new Error('Please provide first name, last name, email, and password')
  }

  if (password.length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(400)
    throw new Error('Please provide a valid email address')
  }

  const userExists = await Student.findOne({ email: email.toLowerCase() })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await Student.create({
    name: { firstName, middleName, lastName },
    email: email.toLowerCase(),
    role: role || 'Developer',
    password
  })

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id)
  })
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Please provide email and password')
  }

  const user = await Student.findOne({ email: email.toLowerCase() })
  if (!user) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    skills: user.skills,
    location: user.location,
    github: user.github,
    linkedin: user.linkedin,
    availability: user.availability,
    token: generateToken(user._id)
  })
})

// @desc    Get current user
// @route   GET /api/auth/view
// @access  Private
const display = asyncHandler(async (req, res) => {
  res.json(req.user)
})

module.exports = { registerUser, loginUser, display }