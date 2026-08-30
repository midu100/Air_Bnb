const express = require('express')
const { createServer } = require("http")
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const dbConfig = require('./dbConfig')
const route = require('./routes')
const claudinaryConfig = require('./sevices/claudinaryConfig')
const startBookingExpiryCleanup = require('./sevices/bookingCleanup')
const startBillingScheduler = require('./sevices/billingScheduler')
const { apiLimiter } = require('./middleware/rateLimiters')

const app = express()
const port = process.env.PORT || 8000

const httpServer = createServer(app)

// ====== Allowed origins - extra deployed origins come from CLIENT_ORIGINS (comma separated)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
  ...(process.env.CLIENT_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean)
]

const io = require("socket.io")(httpServer, {
  cors: { origin: allowedOrigins, credentials: true }
});
global.io = io;

io.on("connection", (socket) => {
  socket.on("setup", (userId) => {
    if (userId) socket.join(userId)
  })
  socket.on("join_room", (convId) => {
    socket.join(convId)
  })
});

// ====== Middleware
// Behind nginx or an ALB the client IP arrives in X-Forwarded-For, which the rate limiter needs
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY))

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// CORS middleware — allows browser to send cross-origin requests from frontend
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
// Stripe signs the raw bytes, so this route must be parsed before express.json touches it
app.use('/payment/webhook', express.raw({ type: 'application/json' }))
// Body size caps - an uncapped parser lets a single request exhaust memory
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser())
app.use(apiLimiter)

// ====== Database
dbConfig()
claudinaryConfig()
startBookingExpiryCleanup()
startBillingScheduler()

// ====== Routes
app.use(route)

// ====== Global error handler - guarantees a response for anything the routes throw
app.use((err, req, res, next) => {
  console.log(err)
  if (res.headersSent) return next(err)

  if (err?.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be 5MB or smaller'
      : err.code === 'LIMIT_FILE_COUNT'
        ? 'Too many images uploaded'
        : 'Invalid file upload'
    return res.status(400).send({ message })
  }

  if (err?.type === 'entity.too.large') {
    return res.status(413).send({ message: 'Payload too large' })
  }

  res.status(err.status || 500).send({ message: err.status ? err.message : 'Internal server error' })
})

// ====== Server
httpServer.listen(port,()=>{
    console.log('server is running...')
})
