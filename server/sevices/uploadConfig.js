const multer = require('multer')

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB per image
const ALLOWED_MIME = /^image\/(jpeg|jpg|png|webp|gif|avif)$/

// Without a filter multer accepted any file of any size straight into memory
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.test(file.mimetype)) return cb(null, true)
  const error = new Error('Only JPEG, PNG, WEBP, GIF or AVIF images are allowed')
  error.status = 400
  cb(error)
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 11 },
  fileFilter: imageFileFilter,
})

module.exports = upload
