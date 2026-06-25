const express = require('express')
const { createServer } = require("http")
const cookieParser = require('cookie-parser')
require('dotenv').config()
const dbConfig = require('./dbConfig')
const route = require('./routes')
const { generateOTP } = require('./sevices/helpers')
const claudinaryConfig = require('./sevices/claudinaryConfig')

const app = express()
const port = 8000

const httpServer = createServer(app)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000'
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

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
dbConfig()
claudinaryConfig()
app.use(route)

httpServer.listen(port,()=>{
    console.log('server is running...')
})