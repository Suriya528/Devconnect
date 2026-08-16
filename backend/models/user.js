const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const StudentSchema = mongoose.Schema(
  {
    name: {
      firstName: { type: String, required: true, trim: true },
      middleName: { type: String, trim: true },
      lastName: { type: String, required: true, trim: true }
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, default: 'Developer', trim: true },
    password: { type: String, required: true },
    bio: { type: String, maxlength: 200, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    skills: [{
      name: { type: String, required: true, trim: true },
      endorsedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
    }],
    location: { type: String, default: '', trim: true },
    linkedin: { type: String, default: '', trim: true },
    availability: {
      type: String,
      enum: ['available', 'busy', 'open-to-work', 'not-available'],
      default: 'available'
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    avatar: { type: String, default: '' },
    devScore: { type: Number, default: 0 },
    githubId: { type: String, sparse: true, default: '' },
    githubUsername: { type: String, default: '' },
    githubAccessToken: { type: String, select: false, default: '' }
  },
  { timestamps: true }
)

StudentSchema.virtual('followerCount').get(function () {
  return this.followers?.length || 0
})

StudentSchema.virtual('followingCount').get(function () {
  return this.following?.length || 0
})

StudentSchema.methods.calculateDevScore = function (posts, totalLikes, totalComments) {
  return (posts * 10) + (totalLikes * 5) + (this.followers.length * 8) + (totalComments * 3)
}

StudentSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

StudentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('Student', StudentSchema)
