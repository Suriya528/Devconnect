const asyncHandler = require('../middleware/asyncHandler')
const Post = require('../models/post')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const REVIEW_PROMPT = `You are a senior code reviewer on a developer social network called DevConnect. A developer has shared code in a post. Review it concisely.

Rules:
- Be helpful, constructive, and encouraging
- Point out bugs, security issues, or performance problems if any
- Suggest improvements briefly
- Use bullet points, keep it under 200 words
- Use emojis sparingly for readability (✅ ⚠️ 💡 🔒)
- If the post doesn't contain code, just give a brief, friendly comment about the content
- Do NOT use markdown code blocks in your response
- Format as plain text with line breaks

Post content:
`

// @desc    AI code review for a post
// @route   POST /api/ai/review/:postId
// @access  Private
const reviewCode = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId)
  if (!post) {
    res.status(404)
    throw new Error('Post not found')
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(503)
    throw new Error('AI service not configured')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContent(REVIEW_PROMPT + post.text)
  const response = await result.response
  const reviewText = response.text()

  if (!reviewText) {
    res.status(502)
    throw new Error('AI did not return a review')
  }

  // Add AI review as a special comment
  const aiComment = {
    name: req.user._id,
    text: `🤖 AI Code Review:\n${reviewText}`,
    isAiReview: true
  }

  post.comments.push(aiComment)
  await post.save()

  const updated = await Post.findById(post._id)
    .populate('name', 'name role')
    .populate('comments.name', 'name role')

  res.json({
    review: reviewText,
    comments: updated.comments
  })
})

module.exports = { reviewCode }
