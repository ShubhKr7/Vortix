require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspace');
const { setupSocket } = require('./socket/presence');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For MVP, we'll allow all origins
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

// Keep-alive ping endpoint
app.get('/api/ping', (req, res) => res.send('pong'));

// Self-pinging logic to prevent sleep on free hosting
const SELF_URL = process.env.SELF_URL;
if (SELF_URL) {
  const pinger = SELF_URL.startsWith('https') ? https : http;
  setInterval(() => {
    pinger.get(SELF_URL + '/api/ping', (res) => {
      console.log(`Self-ping sent to ${SELF_URL}/api/ping - Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Self-ping failed:', err.message);
    });
  }, 5 * 60 * 1000); // 5 minutes
}

// Socket.io integration
setupSocket(io);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
