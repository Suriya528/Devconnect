const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const xss = require('xss-clean')
const Connectdb = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const http = require('http')
const { Server } = require('socket.io')

Connectdb()
const app = express()

// CORS - allow specific origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
)

app.use(express.json())

// Security middlewares
app.use(helmet())
app.use(xss())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
})
app.use('/api', limiter)

app.use('/api/auth', require('./routes/auth'))
app.use('/api/user', require('./routes/userrouter'))
app.use('/api/posts', require('./routes/postrouter'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/github', require('./routes/github'))
app.use('/api/ai', require('./routes/ai'))

app.get('/', (req, res) => {
  res.json({ message: 'DevConnect API is running' })
})

app.use(notFound)
app.use(errorHandler)

const server = http.createServer(app)
const PORT = parseInt(process.env.PORT || '3000', 10)

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
})

app.set('io', io)

const connectedUsers = new Map()
app.set('connectedUsers', connectedUsers)

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId
  if (userId) {
    connectedUsers.set(userId.toString(), socket.id)
  }

  socket.on('disconnect', () => {
    if (userId) {
      connectedUsers.delete(userId.toString())
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
