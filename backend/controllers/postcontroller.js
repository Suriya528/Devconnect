const asyncHandler = require('../middleware/asyncHandler')
const Post = require('../models/post')
const { createAndSendNotification } = require('../utils/sendNotification')

// @desc    Create a post with media
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  if (!req.body.text?.trim()) {
    res.status(400)
    throw new Error('Post text is required')
  }

  const mediaUrls = req.files?.map((file) => ({
    url: file.path,
    type: file.mimetype.startsWith('video') ? 'video' : 'image'
  })) || req.body.mediaUrls || []

  const techStack = req.body.techStack
    ? JSON.parse(req.body.techStack)
    : []

  const postData = {
    name: req.user._id,
    text: req.body.text,
    mediaUrls,
    techStack,
    githubLink: req.body.githubLink || '',
    demoLink: req.body.demoLink || ''
  }

  const cPost = await Post.create(postData)
  const populatePost = await cPost.populate('name', 'name role')
  res.status(201).json(populatePost)
})

// @desc    Create a post with video
// @route   POST /api/posts/video
// @access  Private
const createVideoPost = asyncHandler(async (req, res) => {
  if (!req.body.text?.trim()) {
    res.status(400)
    throw new Error('Post text is required')
  }

  if (!req.file) {
    res.status(400)
    throw new Error('Video file is required')
  }

  const techStack = req.body.techStack
    ? JSON.parse(req.body.techStack)
    : []

  const postData = {
    name: req.user._id,
    text: req.body.text,
    mediaUrls: [{ url: req.file.path, type: 'video' }],
    techStack,
    githubLink: req.body.githubLink || '',
    demoLink: req.body.demoLink || ''
  }

  const cPost = await Post.create(postData)
  const populatePost = await cPost.populate('name', 'name role')
  res.status(201).json(populatePost)
})

// @desc    Get all posts (cursor-based pagination)
// @route   GET /api/posts
// @access  Public
const getAllPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10
  const cursor = req.query.cursor

  let postsQuery = Post.find()
    .populate('name', 'name role')
    .populate('comments.name', 'name role')
    .sort({ createdAt: -1 })
    .limit(limit + 1)

  if (cursor) {
    const cursorPost = await Post.findById(cursor)
    if (cursorPost) {
      postsQuery = postsQuery.where('createdAt').lt(cursorPost.createdAt)
    }
  }

  const posts = await postsQuery.exec()

  let hasMore = false
  let nextCursor = null

  if (posts.length > limit) {
    hasMore = true
    posts.pop()
    nextCursor = posts[posts.length - 1]._id
  }

  res.json({
    posts,
    pagination: {
      hasMore,
      nextCursor
    }
  })
})

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
const getPostsByUser = asyncHandler(async (req, res) => {
  const posts = await Post.find({ name: req.params.userId })
    .populate('name', 'name role')
    .populate('comments.name', 'name role')
    .sort({ createdAt: -1 })
  res.json(posts)
})

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = asyncHandler(async (req, res) => {
  const postdta = await Post.findById(req.params.id)
    .populate('name', 'name role')
    .populate('comments.name', 'name role')
  if (!postdta) {
    res.status(404)
    throw new Error('Post not found')
  }
  res.json(postdta)
})

// @desc    Toggle like on a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const postdta = await Post.findById(req.params.id)
  if (!postdta) {
    res.status(404)
    throw new Error('Post not found')
  }
  const alreadyLiked = postdta.likes.some((id) => id.toString() === req.user._id.toString())
  if (alreadyLiked) {
    postdta.likes = postdta.likes.filter((id) => id.toString() !== req.user._id.toString())
    await postdta.save()
    res.json({ likesCount: postdta.likes.length, likes: postdta.likes })
  } else {
    postdta.likes.push(req.user._id)
    await postdta.save()

    const io = req.app.get('io')
    const onlineUsers = req.app.get('connectedUsers') || new Map()
    const recipientId = postdta.name.toString()

    if (recipientId !== req.user._id.toString()) {
      await createAndSendNotification(
        io,
        onlineUsers,
        recipientId,
        req.user._id,
        'like',
        postdta._id,
        'liked your post'
      )
    }

    res.json({ likesCount: postdta.likes.length, likes: postdta.likes })
  }
})

// @desc    Save / unsave a post
// @route   PUT /api/posts/:id/save
// @access  Private
const savePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) {
    res.status(404)
    throw new Error('Post not found')
  }

  const userId = req.user._id
  const alreadySaved = post.savedBy.some((id) => id.toString() === userId.toString())

  if (alreadySaved) {
    post.savedBy = post.savedBy.filter((id) => id.toString() !== userId.toString())
    await post.save()
    res.json({ message: 'Post unsaved', saved: false })
  } else {
    post.savedBy.push(userId)
    await post.save()

    const io = req.app.get('io')
    const onlineUsers = req.app.get('connectedUsers') || new Map()
    const recipientId = post.name.toString()

    if (recipientId !== req.user._id.toString()) {
      await createAndSendNotification(
        io,
        onlineUsers,
        recipientId,
        req.user._id,
        'save',
        post._id,
        'saved your post'
      )
    }

    res.json({ message: 'Post saved', saved: true })
  }
})

// @desc    Get saved posts
// @route   GET /api/posts/saved
// @access  Private
const getSavedPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ savedBy: req.user._id })
    .populate('name', 'name role')
    .populate('comments.name', 'name role')
    .sort({ createdAt: -1 })
  res.json(posts)
})

// @desc    Get trending posts (last 7 days, top 5 by likes)
// @route   GET /api/posts/trending
// @access  Public
const getTrendingPosts = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const posts = await Post.find({ createdAt: { $gte: sevenDaysAgo } })
    .populate('name', 'name role')
    .populate('comments.name', 'name role')
    .sort({ 'likes': -1 })
    .limit(5)

  res.json(posts)
})

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const postdta = await Post.findById(req.params.id)
  if (!postdta) {
    res.status(404)
    throw new Error('Post not found')
  }
  if (postdta.name.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to delete this post')
  }
  await Post.findByIdAndDelete(req.params.id)
  res.json({ message: 'Post deleted successfully' })
})

// @desc    Create a comment
// @route   POST /api/posts/:id/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const postdta = await Post.findById(req.params.id)
  if (!postdta) {
    res.status(404)
    throw new Error('Post not found')
  }
  if (!req.body.text?.trim()) {
    res.status(400)
    throw new Error('Comment text is required')
  }
  const comment = {
    name: req.user._id,
    text: req.body.text
  }

  postdta.comments.push(comment)
  await postdta.save()
  const updatedComment = await Post.findById(req.params.id)
    .populate('name', 'name role')
    .populate('comments.name', 'name role')

  const io = req.app.get('io')
  const onlineUsers = req.app.get('connectedUsers') || new Map()
  const recipientId = postdta.name.toString()

  if (recipientId !== req.user._id.toString()) {
    await createAndSendNotification(
      io,
      onlineUsers,
      recipientId,
      req.user._id,
      'comment',
      postdta._id,
      'commented on your post'
    )
  }

  res.status(201).json(updatedComment.comments)
})

// @desc    Delete a comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const postdta = await Post.findById(req.params.id)
  if (!postdta) {
    res.status(404)
    throw new Error('Post not found')
  }
  const comment = postdta.comments.find((c) => c._id.toString() === req.params.commentId)
  if (!comment) {
    res.status(404)
    throw new Error('Comment not found')
  }
  if (comment.name.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized to delete this comment')
  }
  postdta.comments = postdta.comments.filter((c) => c._id.toString() !== req.params.commentId)
  await postdta.save()
  res.json({ message: 'Comment deleted successfully' })
})

module.exports = {
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
}
