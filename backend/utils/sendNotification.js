const Notification = require('../models/Notification')

const createAndSendNotification = async (io, onlineUsers, recipientId, senderId, type, postId, message) => {
  if (recipientId.toString() === senderId.toString()) {
    return null
  }

  const notification = await Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    post: postId || null,
    message
  })

  const populatedNotification = await Notification.findById(notification._id)
    .populate('sender', 'name role avatar')

  if (io && onlineUsers.has(recipientId.toString())) {
    io.to(recipientId.toString()).emit('new-notification', populatedNotification)
  }

  return populatedNotification
}

module.exports = { createAndSendNotification }
