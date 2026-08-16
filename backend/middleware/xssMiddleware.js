const xss = require('xss')

const sanitize = (obj) => {
  if (typeof obj === 'string') return xss(obj)
  if (Array.isArray(obj)) return obj.map(sanitize)
  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach((key) => {
      obj[key] = sanitize(obj[key])
    })
  }
  return obj
}

const xssMiddleware = (req, res, next) => {
  if (req.body) sanitize(req.body)
  if (req.params) sanitize(req.params)
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      req.query[key] = sanitize(req.query[key])
    })
  }
  next()
}

module.exports = () => xssMiddleware
