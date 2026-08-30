import { io } from 'socket.io-client'

// A single shared connection for the whole app
const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', {
  withCredentials: true,
})

export default socket
