const express = require('express')
const router = express.Router()
const { reviewCode } = require('../controllers/aiController')
const { protect } = require('../middleware/authmiddleware')

router.post('/review/:postId', protect, reviewCode)

module.exports = router
