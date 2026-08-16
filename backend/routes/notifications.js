const express = require('express')
const router = express.Router()
const {
  getNotifications,
  markAsRead,
  markAllRead,
  getUnreadCount,
  deleteNotification
} = require('../controllers/notificationController')
const { protect } = require('../middleware/authmiddleware')

router.get('/', protect, getNotifications)
router.get('/unread-count', protect, getUnreadCount)
router.put('/:id/read', protect, markAsRead)
router.put('/read-all', protect, markAllRead)
router.delete('/:id', protect, deleteNotification)

module.exports = router
