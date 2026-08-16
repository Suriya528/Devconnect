const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const cors = require('cors')
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
const PORT = process.env.PORT || 3000

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

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`)
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying ${port + 1}...`)
      startServer(port + 1)
    } else {
      console.error('Server error:', err)
    }
  })
}

startServer(PORT)
