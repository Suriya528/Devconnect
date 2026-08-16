const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isAiReview: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Postschema = new mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    mediaUrls: [{
      url: { type: String, required: true },
      type: { type: String, enum: ['image', 'video'], required: true }
    }],
    techStack: [{ type: String, trim: true }],
    githubLink: { type: String, default: '' },
    demoLink: { type: String, default: '' },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ],
    comments: [commentSchema],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      }
    ]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', Postschema)
