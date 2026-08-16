const asyncHandler = require('../middleware/asyncHandler')
const Notification = require('../models/Notification')

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('sender', 'name role avatar')
    .sort({ createdAt: -1 })
    .limit(20)

  res.json(notifications)
})

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  })

  if (!notification) {
    res.status(404)
    throw new Error('Notification not found')
  }

  notification.read = true
  await notification.save()

  res.json(notification)
})

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  )

  res.json({ message: 'All notifications marked as read' })
})

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false
  })

  res.json({ count })
})

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  })

  if (!notification) {
    res.status(404)
    throw new Error('Notification not found')
  }

  await notification.deleteOne()
  res.json({ message: 'Notification deleted' })
})

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  getUnreadCount,
  deleteNotification
}
