const Student = require('../models/user')
const asyncHandler = require('../middleware/asyncHandler')
const generateToken = require('../utils/generateToken')
const crypto = require('crypto')

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

// @desc    Login or register via GitHub OAuth
// @route   POST /api/auth/github
// @access  Public
const githubLogin = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) {
    res.status(400)
    throw new Error('Authorization code is required')
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    res.status(400)
    throw new Error(tokenData.error_description || 'Failed to get GitHub access token')
  }

  const accessToken = tokenData.access_token

  // Fetch GitHub user profile
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  })

  const ghUser = await userRes.json()
  if (!ghUser.id) {
    res.status(400)
    throw new Error('Failed to fetch GitHub profile')
  }

  // Fetch email if not public
  let email = ghUser.email
  if (!email) {
    const emailRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    })
    const emails = await emailRes.json()
    if (Array.isArray(emails)) {
      const primary = emails.find((e) => e.primary && e.verified)
      email = primary?.email || emails[0]?.email
    }
  }

  const githubId = String(ghUser.id)

  // Find existing user by githubId or email
  let user = await Student.findOne({ githubId })
  if (!user && email) {
    user = await Student.findOne({ email: email.toLowerCase() })
  }

  if (user) {
    // Update GitHub data on existing user
    user.githubId = githubId
    user.githubUsername = ghUser.login
    user.githubAccessToken = accessToken
    user.github = ghUser.html_url
    await user.save()
  } else {
    // Create new user from GitHub profile
    const nameParts = (ghUser.name || ghUser.login).split(' ')
    const firstName = nameParts[0] || ghUser.login
    const lastName = nameParts.slice(1).join(' ') || ghUser.login

    user = await Student.create({
      name: { firstName, lastName },
      email: (email || `${ghUser.login}@github.devconnect`).toLowerCase(),
      role: 'Developer',
      password: crypto.randomBytes(32).toString('hex'),
      bio: ghUser.bio || '',
      location: ghUser.location || '',
      github: ghUser.html_url,
      githubId,
      githubUsername: ghUser.login,
      githubAccessToken: accessToken
    })
  }

  res.json({
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
    githubUsername: user.githubUsername,
    token: generateToken(user._id)
  })
})

module.exports = { registerUser, loginUser, display, githubLogin }