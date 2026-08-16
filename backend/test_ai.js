require('dotenv').config()
const mongoose = require('mongoose')
const Post = require('./models/post')
const Student = require('./models/user')
const { GoogleGenerativeAI } = require('@google/generative-ai')

async function run() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to DB')

  const post = await Post.findOne().sort({ createdAt: -1 })
  if (!post) {
    console.log('No post found')
    return process.exit(0)
  }

  const user = await Student.findOne()

  console.log('Testing Gemini API...')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })

  try {
    const result = await model.generateContent("Review this code: console.log('hello')")
    const response = await result.response
    const reviewText = response.text()
    console.log('Review:', reviewText.substring(0, 100) + '...')

    console.log('Saving comment...')
    post.comments.push({
      name: user._id,
      text: reviewText,
      isAiReview: true
    })
    
    await post.save()
    console.log('Saved successfully!')
  } catch (err) {
    console.error('Error during execution:', err)
  }

  process.exit(0)
}

run()
