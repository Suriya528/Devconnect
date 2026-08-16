const express = require('express')
const router = express.Router()
const {
  createPost,
  createVideoPost,
  getAllPosts,
  getPostsByUser,
  getPostById,
  toggleLike,
  savePost,
  getSavedPosts,
  getTrendingPosts,
  deletePost,
  createComment,
  deleteComment
} = require('../controllers/postcontroller')
const { protect } = require('../middleware/authmiddleware')
const { uploadImages, uploadVideo } = require('../middleware/upload')
const mongoSanitize = require('../middleware/mongoSanitize')

// Public routes
router.get('/', getAllPosts)
router.get('/trending', getTrendingPosts)
router.get('/saved', protect, getSavedPosts)
router.get('/user/:userId', getPostsByUser)
router.get('/:id', getPostById)

// Protected routes
router.post('/', protect, uploadImages.array('images', 4), mongoSanitize(), createPost)
router.post('/video', protect, uploadVideo.single('video'), mongoSanitize(), createVideoPost)
router.put('/:id/like', protect, toggleLike)
router.put('/:id/save', protect, savePost)
router.delete('/:id', protect, deletePost)
router.post('/:id/comments', protect, createComment)
router.delete('/:id/comments/:commentId', protect, deleteComment)

module.exports = router
