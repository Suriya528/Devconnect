const express = require('express')
const router = express.Router()
const {
  getProfile,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  searchDevelopers,
  getUserById,
  followUser,
  getFollowers,
  getFollowing,
  uploadAvatar,
  endorseSkill,
  getLeaderboard
} = require('../controllers/userController')
const { protect } = require('../middleware/authmiddleware')
const { uploadImages } = require('../middleware/upload')

// Order matters: specific routes before /:id
router.get('/search', protect, searchDevelopers)
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateUserProfile)
router.put('/profile/avatar', protect, uploadImages.single('avatar'), uploadAvatar)
router.delete('/profile', protect, deleteUser)
router.get('/', protect, getAllUsers)
router.get('/leaderboard', protect, getLeaderboard)
router.post('/:id/follow', protect, followUser)
router.get('/:id/followers', protect, getFollowers)
router.get('/:id/following', protect, getFollowing)
router.post('/:id/skills/:skillName/endorse', protect, endorseSkill)
router.get('/:id', protect, getUserById)

module.exports = router
