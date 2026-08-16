/**
 * Custom MongoDB sanitization middleware for Express 5.
 *
 * express-mongo-sanitize crashes on Express 5 because req.query
 * is a read-only getter. This middleware sanitizes req.body and
 * req.params only (the writable properties that accept user input).
 *
 * It strips any keys containing '$' or '.' from objects to prevent
 * NoSQL injection attacks like { "$gt": "" }.
 */

const sanitize = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      obj[i] = sanitize(item)
    })
    return obj
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key]
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      obj[key] = sanitize(obj[key])
    }
  }
  return obj
}

const mongoSanitize = () => (req, res, next) => {
  if (req.body) sanitize(req.body)
  if (req.params) sanitize(req.params)
  next()
}

module.exports = mongoSanitize
