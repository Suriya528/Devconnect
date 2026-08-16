const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: 'devconnect/posts/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
    }
  }
})

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: 'devconnect/posts/videos',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'webm']
    }
  }
})

const imageFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG and GIF images are allowed'), false)
  }
}

const videoFileFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/quicktime', 'video/webm']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only MP4, MOV and WEBM videos are allowed'), false)
  }
}

const uploadImages = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 4 },
  fileFilter: imageFileFilter
})

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: videoFileFilter
})

module.exports = { uploadImages, uploadVideo }
