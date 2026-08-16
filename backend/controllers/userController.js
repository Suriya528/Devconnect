const asyncHandler = require('../middleware/asyncHandler')
const Student = require('../models/user')
const Post = require('../models/post')
const { createAndSendNotification } = require('../utils/sendNotification')

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.user._id).select('-password')
  if (!user) {
    res.status(404)
    throw new Error('User not found')
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
    portfolio: user.portfolio,
    linkedin: user.linkedin,
    availability: user.availability,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  })
})

// @desc    Upload user avatar
// @route   PUT /api/user/profile/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (!req.file) {
    res.status(400)
    throw new Error('Please upload an image')
  }

  user.avatar = req.file.path
  const updated = await user.save()

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    bio: updated.bio,
    skills: updated.skills,
    location: updated.location,
    github: updated.github,
    portfolio: updated.portfolio,
    linkedin: updated.linkedin,
    availability: updated.availability,
    avatar: updated.avatar,
    createdAt: updated.createdAt
  })
})

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const { firstName, middleName, lastName, role, password, bio, skills, location, github, portfolio, linkedin, availability } = req.body

  if (firstName || middleName || lastName) {
    user.name = {
      firstName: firstName || user.name.firstName,
      middleName: middleName !== undefined ? middleName : user.name.middleName,
      lastName: lastName || user.name.lastName
    }
  }

  if (role) user.role = role
  if (bio !== undefined) user.bio = bio
  if (location !== undefined) user.location = location
  if (github !== undefined) user.github = github
  if (portfolio !== undefined) user.portfolio = portfolio
  if (linkedin !== undefined) user.linkedin = linkedin
  if (availability !== undefined) user.availability = availability

  if (Array.isArray(skills)) {
    user.skills = skills.map(skill => {
      if (typeof skill === 'string') {
        return { name: skill, endorsedBy: [] }
      }
      return {
        name: skill.name,
        endorsedBy: skill.endorsedBy || []
      }
    })
  }

  if (password) {
    if (password.length < 6) {
      res.status(400)
      throw new Error('Password must be at least 6 characters')
    }
    user.password = password
  }

  const updated = await user.save()
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    bio: updated.bio,
    skills: updated.skills,
    location: updated.location,
    github: updated.github,
    portfolio: updated.portfolio,
    linkedin: updated.linkedin,
    availability: updated.availability,
    avatar: updated.avatar,
    createdAt: updated.createdAt
  })
})

// @desc    Get all users (sorted by devScore desc)
// @route   GET /api/user
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    Student.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ devScore: -1, createdAt: -1 }),
    Student.countDocuments()
  ])

  res.json({
    users,
    page,
    pages: Math.ceil(total / limit),
    total
  })
})

// @desc    Delete current user account
// @route   DELETE /api/user/profile
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  await user.deleteOne()
  res.json({ message: 'Account deleted' })
})

// @desc    Get user by ID
// @route   GET /api/user/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.params.id)
    .select('-password')
    .populate('followers', 'name role')
    .populate('following', 'name role')
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const [postCount, likesResult, commentsResult] = await Promise.all([
    Post.countDocuments({ name: user._id }),
    Post.aggregate([
      { $match: { name: user._id } },
      { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
    ]),
    Post.aggregate([
      { $match: { name: user._id } },
      { $unwind: '$comments' },
      { $group: { _id: null, total: { $sum: 1 } } }
    ])
  ])

  const totalLikes = likesResult[0]?.total || 0
  const totalComments = commentsResult[0]?.total || 0
  const devScore = user.calculateDevScore(postCount, totalLikes, totalComments)

  const skillsWithEndorsements = user.skills.map(skill => ({
    name: skill.name,
    endorsementCount: skill.endorsedBy?.length || 0
  }))

  res.json({
    ...user.toObject(),
    devScore,
    followerCount: user.followers.length,
    followingCount: user.following.length,
    skills: skillsWithEndorsements
  })
})

// @desc    Search developers
// @route   GET /api/user/search?search=keyword
// @access  Private
const searchDevelopers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { 'name.firstName': { $regex: req.query.search, $options: 'i' } },
          { 'name.lastName': { $regex: req.query.search, $options: 'i' } },
          { role: { $regex: req.query.search, $options: 'i' } },
          { 'skills.name': { $regex: req.query.search, $options: 'i' } }
        ]
      }
    : {}

  const users = await Student.find(keyword).select('-password').limit(50)
  res.json(users)
})

// @desc    Follow / unfollow a user
// @route   POST /api/user/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const currentUser = await Student.findById(req.user._id)
  const targetUser = await Student.findById(req.params.id)

  if (!targetUser) {
    res.status(404)
    throw new Error('User not found')
  }

  if (currentUser._id.toString() === targetUser._id.toString()) {
    res.status(400)
    throw new Error('You cannot follow yourself')
  }

  const isFollowing = currentUser.following.includes(targetUser._id)

  if (isFollowing) {
    await Promise.all([
      Student.findByIdAndUpdate(currentUser._id, { $pull: { following: targetUser._id } }),
      Student.findByIdAndUpdate(targetUser._id, { $pull: { followers: currentUser._id } })
    ])
    res.json({ message: 'Unfollowed successfully', following: false })
  } else {
    await Promise.all([
      Student.findByIdAndUpdate(currentUser._id, { $addToSet: { following: targetUser._id } }),
      Student.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: currentUser._id } })
    ])

    const io = req.app.get('io')
    const onlineUsers = req.app.get('connectedUsers') || new Map()

    await createAndSendNotification(
      io,
      onlineUsers,
      targetUser._id,
      currentUser._id,
      'follow',
      null,
      'started following you'
    )

    res.json({ message: 'Followed successfully', following: true })
  }
})

// @desc    Get followers list
// @route   GET /api/user/:id/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.params.id).populate('followers', 'name role').select('-password')
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  res.json(user.followers)
})

// @desc    Get following list
// @route   GET /api/user/:id/following
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.params.id).populate('following', 'name role').select('-password')
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  res.json(user.following)
})

// @desc    Endorse / unendorse a skill
// @route   POST /api/user/:id/skills/:skillName/endorse
// @access  Private
const endorseSkill = asyncHandler(async (req, res) => {
  const user = await Student.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const skillIndex = user.skills.findIndex(
    skill => skill.name.toLowerCase() === req.params.skillName.toLowerCase()
  )

  if (skillIndex === -1) {
    res.status(404)
    throw new Error('Skill not found')
  }

  const skill = user.skills[skillIndex]
  const currentUserId = req.user._id
  const alreadyEndorsed = skill.endorsedBy.some(
    id => id.toString() === currentUserId.toString()
  )

  if (alreadyEndorsed) {
    skill.endorsedBy = skill.endorsedBy.filter(
      id => id.toString() !== currentUserId.toString()
    )
  } else {
    skill.endorsedBy.push(currentUserId)

    const io = req.app.get('io')
    const onlineUsers = req.app.get('connectedUsers') || new Map()

    await createAndSendNotification(
      io,
      onlineUsers,
      user._id,
      currentUserId,
      'endorse',
      null,
      `endorsed your ${skill.name} skill`
    )
  }

  await user.save()

  res.json({
    name: skill.name,
    endorsementCount: skill.endorsedBy.length,
    endorsed: !alreadyEndorsed
  })
})

// @desc    Get leaderboard (top 10 by devScore)
// @route   GET /api/user/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const users = await Student.aggregate([
    {
      $lookup: {
        from: 'posts',
        let: { userId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$name', '$$userId'] } } },
          {
            $group: {
              _id: null,
              posts: { $sum: 1 },
              likes: { $sum: { $size: '$likes' } },
              comments: { $sum: { $size: '$comments' } }
            }
          }
        ],
        as: 'postStats'
      }
    },
    {
      $addFields: {
        posts: { $ifNull: [{ $arrayElemAt: ['$postStats.posts', 0] }, 0] },
        totalLikes: { $ifNull: [{ $arrayElemAt: ['$postStats.likes', 0] }, 0] },
        totalComments: { $ifNull: [{ $arrayElemAt: ['$postStats.comments', 0] }, 0] },
        followerCount: { $size: '$followers' },
        devScore: {
          $add: [
            { $multiply: [{ $ifNull: [{ $arrayElemAt: ['$postStats.posts', 0] }, 0] }, 10] },
            { $multiply: [{ $ifNull: [{ $arrayElemAt: ['$postStats.likes', 0] }, 0] }, 5] },
            { $multiply: [{ $size: '$followers' }, 8] },
            { $multiply: [{ $ifNull: [{ $arrayElemAt: ['$postStats.comments', 0] }, 0] }, 3] }
          ]
        }
      }
    },
    { $project: { postStats: 0, password: 0 } },
    { $sort: { devScore: -1 } },
    { $limit: 10 }
  ])

  res.json(users)
})

module.exports = {
  getProfile,
  uploadAvatar,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getUserById,
  searchDevelopers,
  followUser,
  getFollowers,
  getFollowing,
  endorseSkill,
  getLeaderboard
}
